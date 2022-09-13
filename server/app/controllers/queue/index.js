const TeamSpeakHandler = require('../teamSpeak')
const MatchHandler = require('../matchHandler')
const Logger = require('../../Logger')
const logger = new Logger('Queue')
const {
  emitPublicEvent,
  emitQueueEvent,
  emitPrivateEvent
} = require('../../socket')
const { allowedToJoin, idsToNames } = require('./helpers')
const { updateStatus } = require('../users/helpers/updateStatus')

const COUNTDOWN_TIME = 1000 * 20 // 20 seconds

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
  }

  init() {
    try {
      this.announceChange()
    } catch (err) {
      logger.err('Error creating Queue:', err)
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

  readyPlayer({ userId }) {
    if (
      !this._possiblePlayers.includes(userId) ||
      this._readyPlayers.includes(userId)
    ) {
      return logger.warn('Unvalid user tried to ready up', userId)
    }

    this._readyPlayers.push(userId)

    if (this._readyPlayers.length === 10) {
      clearTimeout(this._timeout)
      this.createMatch()
    }
  }

  async kickUnreadyPlayers() {
    try {
      let playersToKick = []

      for (const player of this._possiblePlayers) {
        if (this._readyPlayers.includes(player)) {
          continue
        }

        playersToKick.push(player)
      }

      for (const player of playersToKick) {
        await this.removePlayer({ userId: player })
        emitPrivateEvent(player, 'queue_kick', {})
      }

      const unreadyNames = await idsToNames({ ids: playersToKick })
      for (const player of this._readyPlayers) {
        emitPrivateEvent(player, 'queue_timeout', { unreadyNames })
      }

      this._possiblePlayers = []
      this._readyPlayers = []

      if (this.count > 9) {
        this.handleFullQueue()
      }
    } catch (err) {
      logger.err('Unable to kick unready players', err)
    }
  }

  async beforeJoin({ userId }) {
    try {
      const isAllowedToJoin = await allowedToJoin({ userId })

      if (isAllowedToJoin && !this._players.includes(userId)) {
        this.addPlayer({ userId })
      }
    } catch (err) {
      logger.err('Issue in beforeJoin', err)
    }
  }

  async addPlayer({ userId }) {
    try {
      this._players.push(userId)
      await updateStatus(userId, { inQueue: true })

      this.announceChange()

      if (this.count > 9) {
        this.handleFullQueue()
      }
    } catch (err) {
      logger.err('Unable to add player to queue', err)
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
      emitPrivateEvent(userId, 'queue_ready', {})
    }

    this.setReadyTimeout()
  }

  async createMatch() {
    logger.info('Creating new match because 10 players were ready')

    try {
      const matchHandler = await MatchHandler.getInstance()
      matchHandler.createMatch({ type: 'pug', players: this._readyPlayers })

      for (const player of this._readyPlayers) {
        this.removePlayer({ userId: player })
      }

      this._readyPlayers = []
      this._possiblePlayers = []

      if (this.count > 9) {
        this.handleFullQueue()
      }
    } catch (err) {
      logger.err('Failed to create match', err)
    }
  }

  // Improvement: add debounce for announceChange
  async announceChange() {
    try {
      const teamSpeakHandler = await TeamSpeakHandler.getInstance()
      const title = `[cspacer#4][${this.count}] In der Warteschlange`
      teamSpeakHandler.editChannel({
        cid: teamSpeakHandler._queueChannel,
        options: { title }
      })
      emitPublicEvent({
        event: 'queue-update',
        data: { count: this.count }
      })
    } catch (err) {
      logger.err('Error updating TeamSpeak:', err)
    }
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
