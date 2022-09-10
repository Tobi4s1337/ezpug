const EventEmitter = require('events').EventEmitter
const User = require('../../models/user')
const { TeamSpeak } = require('ts3-nodejs-library')

const getLinkedIds = () => {
  return new Promise((resolve, reject) => {
    User.find({}, (err, users) => {
      if (err || !users) {
        return reject(err)
      }

      const ids = []

      for (const user of users) {
        if (user.teamSpeakId) {
          ids.push(user.teamSpeakId)
        }
      }
      resolve(ids)
    })
  })
}

/**
 * @var {Promise<TeamspeakHandler>}
 */
let instance

/**
 * TeamSpeakHandler class.
 *
 * Connects to the TeamSpeak server of the PUG system and is responsible for handling
 * things like room creation, moving players into the right channels and making it possible
 * to link a teamspeakId to a player profile
 */
class TeamSpeakHandler extends EventEmitter {
  constructor() {
    console.log('Creating TeamSpeakHandler')

    super()

    this._ip = '94.130.180.183'
    this._queryport = 10011
    this._serverport = 9987
    this._username = 'serveradmin'
    this._password = 'KYNfAsqd'
    this._teamSpeak = null
    this._clients = []
    this._interval = null
    this._firstTime = true
  }

  async init() {
    try {
      this._teamSpeak = await TeamSpeak.connect({
        host: this._ip,
        queryport: this._queryport, // optional
        serverport: this._serverport,
        username: this._username,
        password: this._password,
        nickname: 'EZPUG Bot'
      })

      this.setupEventListeners()

      if (this._interval) {
        clearInterval(this._interval)
      }

      this._interval = setInterval(() => {
        this.getClients()
      }, 3000)

      return this
    } catch (err) {
      console.log('Error when connecting to TeamSpeak Server:', err)

      setTimeout(() => {
        this.init()
      }, 1000 * 20)
    }
  }

  setupEventListeners() {
    this._teamSpeak.on('clientconnect', (event) => {
      this.emit('user-connect', event.client.propcache.clientUniqueIdentifier)
      this._clients.push({
        teamSpeakId: event.client.propcache.clientUniqueIdentifier,
        name: event.client.propcache.clientNickname
      })
    })
  }

  async getClients() {
    try {
      const clients = await this._teamSpeak.clientList({ clientType: 0 })
      const oldClients = this._clients
      this._clients = []

      for (const client of clients) {
        this._clients.push({
          teamSpeakId: client.propcache.clientUniqueIdentifier,
          name: client.propcache.clientNickname
        })

        if (this._firstTime) {
          this.emit('user-connect', client.propcache.clientUniqueIdentifier)
        }
      }

      this._firstTime = false

      for (const client of oldClients) {
        if (!this._clients.some((e) => e.teamSpeakId === client.teamSpeakId)) {
          this.emit('user-disconnect', client.teamSpeakId)
        }
      }
    } catch (err) {
      console.log('Error getting clients', err)
    }
  }

  getUnlinkedUsers() {
    return new Promise(async (resolve, reject) => {
      try {
        const clients = this._clients

        const users = []
        const unlinkedUsers = []

        for (const client of clients) {
          users.push({
            id: client.teamSpeakId,
            name: client.name
          })
        }

        const linkedIds = await getLinkedIds()

        // remove any ids of already linked users
        for (const user of users) {
          if (!linkedIds.includes(user.id)) {
            unlinkedUsers.push(user)
          }
        }

        resolve(unlinkedUsers)
      } catch (err) {
        reject(err)
      }
    })
  }

  async messageById({ id, message }) {
    try {
      const client = await this._teamSpeak.getClientByUid(id)
      client.message(message)
    } catch (err) {
      console.log('Error sending message to user', err)
    }
  }
}

/**
 * @return {Promise<TeamSpeakHandler>}
 */
TeamSpeakHandler.getInstance = async function () {
  if (!instance) {
    const teamSpeakHandler = new TeamSpeakHandler()

    instance = await teamSpeakHandler.init()
  }

  return instance
}

module.exports = TeamSpeakHandler
