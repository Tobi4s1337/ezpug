const EventEmitter = require('events').EventEmitter
const User = require('../../models/user')
const { TeamSpeak } = require('ts3-nodejs-library')

const generateCode = () => {
  return (Math.floor(Math.random() * 10000) + 10000).toString().substring(1)
}

const createMatchChannelTitle = (teamOneName, teamTwoName) => {
  let title = teamOneName + ' vs. ' + teamTwoName

  if (title.length < 40) {
    return title
  }

  return teamOneName.substring(0, 17) + ' vs. ' + teamTwoName.substring(0, 17)
}

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
    this._queueChannel = null
    this._dropsChannel = null
    this._mapPoolChannel = null
    this._generalTalkCid = null
    this._matchAreaCid = null
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

      await this.createDefaultChannels()

      return this
    } catch (err) {
      console.log('Error when connecting to TeamSpeak Server:', err)

      setTimeout(() => {
        this.init()
      }, 1000 * 20)
    }
  }

  async updateFloodProtection() {
    try {
      const result = await this._teamSpeak.instanceEdit({
        serverinstanceServerqueryFloodCommands: 999
      })
    } catch (err) {
      console.log(err)
    }
  }

  async createDefaultChannels() {
    try {
      const blackSpacerTwo = await this.createChannel({
        title: '[*spacer#15]━',
        noJoin: true,
        cpid: 0
      })

      const channelOrder = blackSpacerTwo.propcache.channelOrder

      await this.createChannel({
        title: '[cspacer#14]  ',
        noJoin: true,
        cpid: 0,
        channelOrder
      })

      await this.createChannel({
        title: '[cspacer#13]Ｔ Ａ Ｌ Ｋ － Ｃ Ｈ Ａ Ｎ Ｎ Ｅ Ｌ',
        noJoin: false,
        cpid: 0,
        channelOrder
      })

      await this.createChannel({
        title: '[cspacer#12]◢◤━━━━━━━ ◢〓◣ ━━━━━━━◥◣',
        noJoin: true,
        cpid: 0,
        channelOrder
      })

      await this.createChannel({
        title: '[cspacer#11]  ',
        noJoin: true,
        cpid: 0,
        channelOrder
      })

      const matchAreaText = await this.createChannel({
        title: '[cspacer#10]Ｍ Ａ Ｔ Ｃ Ｈ － Ａ Ｒ Ｅ Ａ',
        noJoin: true,
        cpid: 0,
        channelOrder
      })

      this._matchAreaCid = matchAreaText.propcache.cid

      await this.createChannel({
        title: '[cspacer#9]◢◤━━━━━━━ ◢〓◣ ━━━━━━━◥◣',
        noJoin: true,
        cpid: 0,
        channelOrder
      })

      await this.createChannel({
        title: '[cspacer#8]',
        noJoin: true,
        cpid: 0,
        channelOrder
      })

      await this.createChannel({
        title: '[cspacer#7]◥◣━━━━━━━ ◥〓☰〓◤ ━━━━━━━◢◤',
        noJoin: true,
        cpid: 0,
        channelOrder
      })

      this._mapPoolChannel = await this.createChannel({
        title: '[cspacer#6]Map-Pool: Default',
        noJoin: true,
        cpid: 0,
        channelOrder
      })

      this._dropsChannel = await this.createChannel({
        title: '[cspacer#5]Drops: Aktiv ✔️',
        noJoin: true,
        cpid: 0,
        channelOrder
      })

      this._queueChannel = await this.createChannel({
        title: `[cspacer#${generateCode()}][0] In der Warteschlange`,
        noJoin: true,
        cpid: 0,
        channelOrder
      })

      await this.createChannel({
        title: '[cspacer1#3]Ｅ Ｚ Ｐ Ｕ Ｇ ．Ｃ Ｏ Ｍ',
        noJoin: true,
        cpid: 0,
        channelOrder
      })

      await this.createChannel({
        title: '[cspacer#2]◢◤━━━━━━━ ◢〓☰〓◣ ━━━━━━━◥◣',
        noJoin: true,
        cpid: 0,
        channelOrder
      })

      await this.createChannel({
        title: '[cspacer#1]  ',
        noJoin: true,
        cpid: 0,
        channelOrder
      })

      await this.createChannel({
        title: '[*spacer#0]━',
        noJoin: true,
        cpid: 0,
        channelOrder
      })
    } catch (err) {
      //console.log('Failed to create default channels', err)

      // Channels already exist, now get each of them for future reference
      if (err.id === '771') {
        this.getDefaultChannels()
      }
    }
  }

  async getDefaultChannels() {
    try {
      const channels = await this._teamSpeak.channelList()

      for (const channel of channels) {
        const name = channel.propcache.channelName
        if (name.includes('[cspacer#6]Map-Pool')) {
          this._mapPoolChannel = channel
        }

        if (name.includes('[cspacer#5]Drops')) {
          this._dropsChannel = channel
        }

        if (name.includes('In der Warteschlange')) {
          this._queueChannel = channel
        }
      }

      const generalTalkChannel = await this._teamSpeak.getChannelByName(
        '[cspacer#13]Ｔ Ａ Ｌ Ｋ － Ｃ Ｈ Ａ Ｎ Ｎ Ｅ Ｌ'
      )

      this._generalTalkCid = generalTalkChannel.propcache.cid

      const matchAreaText = await this._teamSpeak.getChannelByName(
        '[cspacer#10]Ｍ Ａ Ｔ Ｃ Ｈ － Ａ Ｒ Ｅ Ａ'
      )
      this._matchAreaCid = matchAreaText.propcache.cid

      console.log('Got existing channels instead')
    } catch (err) {
      console.log('Error getting default channels', err)
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

  async moveUserToChannel({ teamSpeakId, cid }) {
    try {
      console.log(`Moving user ${teamSpeakId} to channel ${cid}`)

      const teamSpeakUser = await this._teamSpeak.getClientByUid(teamSpeakId)

      if (teamSpeakUser && teamSpeakUser.propcache) {
        return await this._teamSpeak.clientMove(
          teamSpeakUser.propcache.clid,
          cid
        )
      }
      throw new Error('Unable to find client on TeamSpeak-Server')
    } catch (err) {
      console.log('Error moving player', err)
    }
  }

  async moveUsersToChannel({ teamSpeakIds, cid }) {
    try {
      for (const teamSpeakId of teamSpeakIds) {
        await this.moveUserToChannel({ teamSpeakId, cid })
      }
    } catch (err) {
      console.log('Error moving players', err)
    }
  }

  createChannel({ title, description, noJoin, cpid, channelOrder }) {
    return new Promise(async (resolve, reject) => {
      try {
        let props = {
          channel_flag_permanent: '1',
          channel_codec_quality: 10,
          channel_description: description ? description : 'EZPUG.COM',
          cpid: cpid ? cpid : 0
        }

        if (channelOrder) {
          props.channelOrder = channelOrder
        }

        const channel = await this._teamSpeak.channelCreate(title, props)

        if (noJoin) {
          await channel
            .setPerm()
            .perm('i_channel_needed_join_power')
            .value(90)
            .skip(false)
            .negate(false)
            .update()
        }

        resolve(channel)
      } catch (err) {
        reject(err)
      }
    })
  }

  async removeChannel({ cid }) {
    try {
      await this._teamSpeak.channelDelete(cid, 1)
    } catch (err) {
      console.log('Error removing channel', err)
    }
  }

  async editChannel({ cid, options }) {
    try {
      await this._teamSpeak.channelEdit(cid, options)
    } catch (err) {
      console.log('Error editing channel', err)
    }
  }

  createMatch({ teamOneName, teamTwoName }) {
    return new Promise(async (resolve, reject) => {
      try {
        const mainChannelTitle = createMatchChannelTitle(
          teamOneName,
          teamTwoName
        )

        const mainChannel = await this.createChannel({
          title: mainChannelTitle,
          noJoin: true,
          cpid: this._matchAreaCid
        })
        const mainCid = mainChannel.propcache.cid

        const statusChannel = await this.createChannel({
          title: 'Status: Player-Veto',
          noJoin: true,
          cpid: mainCid
        })
        const statusCid = statusChannel.propcache.cid

        const talkChannel = await this.createChannel({
          title: 'Talk / Playerveto',
          cpid: mainCid
        })
        const talkCid = talkChannel.propcache.cid

        const teamOneChannel = await this.createChannel({
          title: teamOneName.substring(0, 40),
          cpid: mainCid
        })
        const teamOneCid = teamOneChannel.propcache.cid

        const teamTwoChannel = await this.createChannel({
          title: teamTwoName.substring(0, 40),
          cpid: mainCid
        })
        const teamTwoCid = teamTwoChannel.propcache.cid

        resolve({
          mainCid,
          talkCid,
          statusCid,
          teamOneCid,
          teamTwoCid
        })
      } catch (err) {
        reject('Failed to create match channels', err)
      }
    })
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
