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
  getTeamCaptains
} = require('./helpers/index.js')
const { emitMatchEvent } = require('../../../socket/index')
const TeamSpeakHandler = require('../../../controllers/teamSpeak')

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
  }

  initMatch() {
    return new Promise(async (resolve, reject) => {
      try {
        // pick team captains
        // set team names
        // get map pool
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
      } catch (err) {
        reject(err)
      }
    })
  }

  createPUG() {}

  pickPlayer() {}

  banMap() {}

  updateRoomState() {
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

  onMessage({ userId, event, data }) {}

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
      playersToPick: this.playersToPick
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
