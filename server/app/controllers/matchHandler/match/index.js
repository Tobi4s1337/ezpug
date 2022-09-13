/* 
Match Class

    - constructor
    - - If match Id is given load match from db
    - - If no match Id is given, handle cases based on type (pug, 1v1, 2v2, custom)

    - data
    - - type
    - - players
    - - teamOne
    - - - name
    - - - captain
    - - - players
    - - teamTwo
    - - - name
    - - - captain
    - - - players
    - - status (playerveto | mapveto | active | finished)
    - - teamSpeak
    - - - mainCid
    - - - statusCid
    - - - talkCid
    - - - teamOneCid
    - - - teamTwoCid
    - - mapVeto:
    - - - pool
    - - - teamOneBans
    - - - teamTwoBans
    - - map
    - - server

    - loadMatchFromDb
    - createPUG
    - pickPlayer
    - banMap
    - updateRoomState

    getters
    - roomState

*/

const Logger = require('../../../Logger')
const logger = new Logger('MatchRoom')
const {
  createMatchInDb,
  getActiveMapPool,
  getMatchFromDb,
  saveMatchToDb,
  playersToIds,
  getTeamCaptains,
  getTimeLeft
} = require('./helpers/index.js')
const { emitMatchEvent } = require('../../../socket/index')
const TeamSpeakHandler = require('../../../controllers/teamSpeak')

const COUNTDOWN_TIME = 1000 * 30 // 30 seconds

/**
 * Match class.
 *
 */
class Match {
  constructor({ players, matchId, type }) {
    logger.info('Constructing')

    if (matchId) {
      this._matchId = matchId
      this.loadMatchFromDb()
      return
    }

    this._matchId = null
    this._type = type
    this._gameServer = ''
    this._gotv = ''
    this._mapVeto = {
      pool: [],
      teamOneBans: [],
      teamTwoBans: []
    }
    this._map = null
    this._players = players
    this._teamOne = {
      name: '',
      roundsWon: 0,
      players: [],
      captain: null
    }
    this._teamTwo = {
      name: '',
      roundsWon: 0,
      players: [],
      captain: null
    }
    this._demoLink = ''
    this._stats = {}
    this._teamSpeak = {
      mainCid: '',
      statusCid: '',
      talkCid: '',
      teamOneCid: '',
      teamTwoCid: ''
    }
    this._status = 'playerveto'
    this._timeout = null
  }

  initMatch() {
    return new Promise(async (resolve, reject) => {
      try {
        this._mapVeto.pool = await getActiveMapPool({ type: this._type })

        const { teamOneCaptain, teamTwoCaptain } = getTeamCaptains({ players })

        this._teamOne.captain = teamOneCaptain
        this._teamOne.name = 'team_' + teamOneCaptain.name
        this._teamTwo.captain = teamTwoCaptain
        this._teamTwo.name = 'team_' + teamTwoCaptain.name

        const teamSpeakHandler = await TeamSpeakHandler.getInstance()
        this._teamSpeak = await teamSpeakHandler.createMatch({
          teamOneName: this._teamOne.name,
          teamTwoName: this._teamTwo.name
        })

        const match = await createMatchInDb({ data: this.matchStateDbFriendly })
        this._matchId = match._id

        resolve(match)

        this.startPlayerVeto()
      } catch (err) {
        reject(err)
      }
    })
  }

  startMatch() {
    // get gameserver
    // set up gameserver
    // handle match end event
  }

  startPlayerVeto() {
    this._status = 'playerveto'
    this.emitEvent({ event: 'status-update', data: { status: 'playerveto' } })
    this.setPlayerVetoTimeout()
  }

  setPlayerVetoTimeout() {
    if (this._timeout) {
      clearTimeout(this._timeout)
    }

    this._timeout = setTimeout(() => {
      // pick random available player
      this._timeout = null

      let pickedById = ''

      if (this._teamTwo.players.length < this._teamOne.players.length) {
        pickedById = this._teamOne.captain._id
      } else {
        pickedById = this._teamTwo.captain._id
      }

      const playersToPick = this.playersToPick
      const pickedId =
        playersToPick[Math.floor(Math.random() * playersToPick.length)]

      this.pickPlayer({ pickedById, pickedId })

      logger.info('Picked random player because of timeout')
    }, COUNTDOWN_TIME)
  }

  setMapVetoTimeout() {
    if (this._timeout) {
      clearTimeout(this._timeout)
    }

    this._timeout = setTimeout(() => {
      // ban random available map
      this._timeout = null

      let bannedById = ''

      if (this._mapVeto.teamOneBans.length < this._mapVeto.teamTwoBans.length) {
        bannedById = this._teamOne.captain._id
      } else {
        bannedById = this._teamTwo.captain._id
      }

      const availableMaps = this.availableMaps
      const mapKey =
        availableMaps[Math.floor(Math.random() * availableMaps.length)]

      this.banMap({ bannedById, mapKey })

      logger.info('Banned random map because of timeout')
    }, COUNTDOWN_TIME)
  }

  startMapVeto() {
    this._status = 'mapveto'
    this.emitEvent({ event: 'status-update', data: { status: 'mapveto' } })
    this.setMapVetoTimeout()
  }

  updateRemoteMatchState() {
    this.emitEvent({ event: 'state', data: this.matchState })
  }

  async saveMatchState() {
    try {
      await saveMatchToDb({
        matchId: this._matchId,
        match: this.matchStateDbFriendly
      })
    } catch (err) {
      console.log('Failed to save match state', err)
    }
  }

  async loadMatchFromDb(matchId) {
    try {
      const match = await getMatchFromDb({ matchId })

      this._matchId = match._id
      this._type = match.type
      this._gameServer = match.gameServer
      this._gotv = match.gotv
      this._mapVeto = match.mapVeto
      this._map = match.map
      this._players = match.players
      this._teamOne = match.teamOne
      this._teamTwo = match.teamTwo
      this._demoLink = match.demoLink
      this._stats = match.stats
      this._teamSpeak = match.teamSpeak
      this._status = match.status

      logger.info('Loaded Match from db', this._matchId)
    } catch (err) {
      logger.error('Error loading match from db', err)
    }
  }

  emitEvent({ event, data }) {
    emitMatchEvent(this._matchId, event, data)
  }

  async banMap({ bannedById, mapKey }) {
    let bannedMaps = this._mapVeto.teamOneBans.concat(this._mapVeto.teamTwoBans)

    if (bannedMaps.includes(mapKey)) {
      return logger.warn('Map is already banned')
    }

    if (this._teamOne.captain._id === bannedById) {
      if (this._mapVeto.teamOneBans.length > this._mapVeto.teamTwoBans.length) {
        return logger.warn('Team One already has more banned maps')
      }

      this._mapVeto.teamOneBans.push(mapKey)
      this.emitEvent({
        event: 'banned-map',
        data: {
          mapVeto: this._mapVeto
        }
      })
    }

    if (this._teamTwo.captain._id === bannedById) {
      if (this._mapVeto.teamTwoBans.length > this._mapVeto.teamOneBans.length) {
        return logger.warn('Team Two already has more banned maps')
      }

      this._mapVeto.teamTwoBans.push(mapKey)
    }

    if (this.availableMaps.length === 1) {
      // set the only map that is not banned as the match map and start match
      this._map = this.availableMaps[0]

      try {
        await this.saveMatchState()
      } catch (err) {
        logger.error('Failed to save match state', err)
      }
      return this.startMatch()
    }

    this.setPlayerVetoTimeout()
  }

  async pickPlayer({ pickedById, pickedId }) {
    if (
      playersToIds(this._teamOne.players).includes(pickedId) ||
      playersToIds(this._teamTwo.players).includes(pickedId)
    ) {
      return logger.warn('Player is already part of a team')
    }

    if (this._teamOne.captain._id === pickedById) {
      if (this._teamOne.players.length > this._teamTwo.players.length) {
        return logger.warn('Team One already has more players')
      }

      this.addPlayerToTeam({ playerId: pickedId, teamOne: true })
    }

    if (this._teamTwo.captain._id === pickedById) {
      if (this._teamTwo.players.length > this._teamTwo.players.length) {
        return logger.warn('Team Two already has more players')
      }

      this.addPlayerToTeam({ playerId: pickedId, teamOne: false })
    }

    if (
      this._teamTwo.players.length + this._teamOne.players.length + 2 ===
      this._players.length
    ) {
      try {
        await this.saveMatchState()
      } catch (err) {
        logger.error('Failed to save match state', err)
      }
      return this.startMapVeto()
    }

    this.setPlayerVetoTimeout()
  }

  get availableMaps() {
    let maps = []

    for (const map of this._mapVeto.pool) {
      if (
        !this._mapVeto.teamOneBans.includes(map.key) &&
        this._mapVeto.teamTwoBans.includes(map.key)
      ) {
        maps.push(map.key)
      }
    }

    return maps
  }

  async addPlayerToTeam({ playerId, teamOne }) {
    try {
      const teamSpeakHandler = await TeamSpeakHandler.getInstance()
      const player = this.playersMap[playerId]

      if (teamOne) {
        this._teamOne.players.push(player)
        teamSpeakHandler.moveUserToChannel({
          teamSpeakId: player.teamSpeakId,
          cid: this._teamSpeak.teamOneCid
        })

        this.emitEvent({
          event: 'update-team-one',
          data: {
            players: this._teamOne.players
          }
        })
        return
      }

      this._teamTwo.players.push(player)
      teamSpeakHandler.moveUserToChannel({
        teamSpeakId: player.teamSpeakId,
        cid: this._teamSpeak.teamTwoCid
      })

      this.emitEvent({
        event: 'update-team-two',
        data: {
          players: this._teamTwo.players
        }
      })
    } catch (err) {
      logger.err(err)
    }
  }

  onMessage({ userId, event, data }) {
    if (!playersToIds(this._players).includes(userId)) {
      return
    }

    switch (event) {
      case 'message':
        break
      case 'pick-player':
        this.pickPlayer({ pickedById: userId, pickedId: data.pickedId })
        break
      case 'ban-map':
        this.banMap({ bannedById: userId, mapKey: data.mapKey })
        break
      default:
        logger.warn('Unhandled event', event)
    }
  }

  get matchId() {
    return this._matchId
  }

  get playersToPick() {
    let availablePlayers = []
    const players = this._players
    const teamOnePlayers = playersToIds(this._teamOne.players)
    const teamTwoPlayers = playersToIds(this._teamTwo.players)

    for (const player of players) {
      if (
        teamOnePlayers.includes(player._id) &&
        teamTwoPlayers.includes(player._id) &&
        teamOneCaptain._id !== player._id &&
        teamTwoCaptain._id !== player._id
      ) {
        availablePlayers.push(player)
      }
    }

    return availablePlayers
  }

  get playersMap() {
    const map = this._players.reduce((map, player) => {
      map[player._id] = player
      return map
    }, {})
    return map
  }

  get matchState() {
    return {
      type: this._type,
      status: this._status,
      gameServer: this._gameServer,
      gotv: this._gotv,
      mapVeto: this._mapVeto,
      map: this._map,
      players: this._players,
      teamOne: {
        name: this._teamOne.name,
        roundsWon: this._teamOne.roundsWon,
        players: this._teamOne.players,
        captain: this._teamOne.captain._id
      },
      teamOne: {
        name: this._teamTwo.name,
        roundsWon: this._teamTwo.roundsWon,
        players: this._teamTwo.players,
        captain: this._teamTwo.captain._id
      },
      demoLink: this._demoLink,
      stats: this._stats,
      teamSpeak: this._teamSpeak,
      playersToPick: this.playersToPick,
      timer: this._timeout ? getTimeLeft(this._timeout) : -1
    }
  }

  get matchStateDbFriendly() {
    const state = this.matchState
    state.players = playersToIds(this._players)
    state.teamOne.players = playersToIds(this._teamOne.players)
    state.teamTwo.players = playersToIds(this._teamOne.players)

    delete state.playersToPick

    return state
  }
}

module.exports.Match = Match
