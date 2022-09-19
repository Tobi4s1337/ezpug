const TeamSpeakHandler = require('../teamSpeak')
const MatchHandler = require('../matchHandler')
const Logger = require('../../Logger')
const logger = new Logger('Queue')
const {
  emitPublicEvent,
  emitQueueEvent,
  emitPrivateEvent
} = require('../../socket')
const {
  allowedToJoin,
  idsToProfiles,
  notifyWhatsAppUser
} = require('./helpers')
const { updateStatus } = require('../users/helpers/updateStatus')

const COUNTDOWN_TIME = 1000 * 30 // 30 seconds

const generateCode = () => {
  return (Math.floor(Math.random() * 10000) + 10000).toString().substring(1)
}

/**
 * @var {Promise<Queue>}
 */
let instance

/**
 * Queue Singleton class.
 */
class Queue {
  constructor() {
    logger.info('constructor()')

    this._players = []
    this._timeout = null
    this._possiblePlayers = []
    this._readyPlayers = []
    this._whatsAppReady = []
  }

  init() {
    try {
      this.announceChange()

      return this
    } catch (err) {
      logger.error('Error creating Queue:', err)
    }
  }

  async onMessage({ userId, event }) {
    switch (event) {
      case 'join':
        this.beforeJoin({ userId })
        break
      case 'leave':
        this.removePlayer({ userId })
        break
      case 'ready':
        this.readyPlayer({ userId })
        break
      default:
        logger.warn('Unhandled event', event)
    }
  }

  setReadyTimeout() {
    this._timeout = setTimeout(() => {
      this.kickUnreadyPlayers()
    }, COUNTDOWN_TIME)
  }

  async readyPlayer({ userId, whatsApp }) {
    if (
      !this._possiblePlayers.includes(userId) ||
      this._readyPlayers.includes(userId)
    ) {
      logger.warn('Invalid user tried to ready up', userId)
      return false
    }

    this._readyPlayers.push(userId)

    logger.info('Amount of ready players', this._readyPlayers.length)

    if (whatsApp) {
      this._whatsAppReady.push(userId)
    }

    const players = await this.getPossiblePlayersProfiles()

    for (const player of this._possiblePlayers) {
      emitPrivateEvent(player, 'QUEUE_READY_UPDATE', { players })
    }

    if (this._readyPlayers.length === 10) {
      clearTimeout(this._timeout)
      this._timeout = null

      logger.info('All players accepted, creating match...')
      this.createMatch()
    }

    return true
  }

  async kickUnreadyPlayers() {
    try {
      this._timeout = null

      logger.info('Queue timed out, kicking players who did not accept')

      let playersToKick = []

      for (const player of this._possiblePlayers) {
        if (this._readyPlayers.includes(player)) {
          continue
        }

        playersToKick.push(player)
      }

      for (const player of playersToKick) {
        await this.removePlayer({ userId: player })
        emitPrivateEvent(player, 'QUEUE_KICK', {})
      }

      const unreadyProfiles = await idsToProfiles({ ids: playersToKick })
      for (const player of this._readyPlayers) {
        emitPrivateEvent(player, 'QUEUE_TIMEOUT', { unreadyProfiles })
        notifyWhatsAppUser({
          userId: player,
          event: 'queue_timeout',
          data: { unreadyProfiles }
        })
      }

      this._possiblePlayers = []
      this._readyPlayers = []
      this._whatsAppReady = []

      logger.info('Queue count after kicking inactive players', this.count)

      if (this.count > 9) {
        this.handleFullQueue()
      }
    } catch (err) {
      logger.error('Unable to kick unready players', err)
    }
  }

  async beforeJoin({ userId }) {
    try {
      const isAllowedToJoin = await allowedToJoin({ userId })
      if (isAllowedToJoin && !this._players.includes(userId)) {
        this.addPlayer({ userId })
      }
    } catch (err) {
      logger.error('Issue in beforeJoin', err)
    }
  }

  async addPlayer({ userId }) {
    try {
      this._players.push(userId)
      console.log(this._players.length)
      console.log(this.count)
      await updateStatus(userId, { inQueue: true })

      this.announceChange()

      logger.info('Amount of users in queue', this.count)

      if (this.count > 9) {
        this.handleFullQueue()
      }
    } catch (err) {
      logger.error('Unable to add player to queue', err)
    }
  }

  removePlayer({ userId }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (this._timeout && this._possiblePlayers.includes(userId)) {
          return logger.warn(
            'Person tried to quit queue while requesting ready status'
          )
        }

        this._players = this._players.filter((player) => player !== userId)
        await updateStatus(userId, { inQueue: false })
        this.announceChange()
        logger.info('Current queue count', this.count)

        resolve()
      } catch (err) {
        reject('Unable to remove player from queue', err)
      }
    })
  }

  async handleFullQueue() {
    if (this._timeout) {
      return logger.warn('Already collecting ready status from queue members')
    }

    for (let i = 0; i < 10; i++) {
      const userId = this._players[i]
      this._possiblePlayers.push(userId)
      emitPrivateEvent(userId, 'QUEUE_READY', {})
      notifyWhatsAppUser({ userId, event: 'queue_ready' })
    }

    this.setReadyTimeout()

    logger.info('Queue is full, started accept phase')
  }

  async createMatch() {
    logger.info('Creating new match because 10 players were ready')

    try {
      const matchHandler = await MatchHandler.getInstance()
      matchHandler.createMatch({ type: 'pug', players: this._readyPlayers })

      for (const player of this._readyPlayers) {
        this.removePlayer({ userId: player })
      }

      for (const player of this._whatsAppReady) {
        const playerProfiles = await idsToProfiles(this._readyPlayers)
        notifyWhatsAppUser({
          userId: player,
          event: 'queue_success',
          data: { playerProfiles }
        })
      }

      this._readyPlayers = []
      this._possiblePlayers = []
      this._whatsAppReady = []

      if (this.count > 9) {
        this.handleFullQueue()
      }
    } catch (err) {
      logger.error('Failed to create match', err)
    }
  }

  // Improvement: add debounce for announceChange
  async announceChange() {
    try {
      const teamSpeakHandler = await TeamSpeakHandler.getInstance()
      const title = `[cspacer#${generateCode()}][${
        this.count
      }] In der Warteschlange`
      teamSpeakHandler.editChannel({
        cid: teamSpeakHandler._queueChannel.propcache.cid,
        options: { channelName: title }
      })
      emitPublicEvent({
        event: 'QUEUE_UPDATE',
        data: { count: this.count }
      })
    } catch (err) {
      logger.error('Error updating TeamSpeak:', err)
    }
  }

  getPossiblePlayersProfiles() {
    return new Promise(async (resolve, reject) => {
      try {
        const playerProfiles = await idsToProfiles({
          ids: this._possiblePlayers
        })
        const playersArr = []

        for (let player of playerProfiles) {
          if (this._readyPlayers.includes(player.userId)) {
            player.accepted = true
          }
          playersArr.push(player)
        }

        resolve(playersArr)
      } catch (err) {
        reject(err)
      }
    })
  }

  get count() {
    return this._players.length
  }
}

/**
 * @return {Promise<Queue>}
 */
Queue.getInstance = async function () {
  if (!instance) {
    const queue = new Queue()

    instance = await queue.init()
  }

  return instance
}

module.exports = Queue
