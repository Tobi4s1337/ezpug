// To fix: for some reason random pick tried to add captain to a team
// To Fix: mapPool is not iterable (cuz of schema change)
// Verify that check for banned maps and picked players makes sense (so one team can only have one more than the other)

const {
  emitPublicEvent,
  emitMatchEvent,
  emitPrivateEvent
} = require('../../../socket')

const { updateStatus } = require('../../users/helpers/updateStatus')

const Logger = require('../../../Logger')
const logger = new Logger('MatchRoom')
const {
  createMatchInDb,
  getActiveMapPool,
  getMatchFromDb,
  saveMatchToDb,
  playersToIds,
  getTeamCaptains,
  getTimeLeft,
  idToProfile,
  getFutureTime,
  updateUserStats
} = require('./helpers/index.js')

const {
  cloneServer,
  updateServer,
  deleteServer,
  createMatch,
  generateGSLT,
  downloadDemo,
  stopServer
} = require('./dathost')

function containsAnyLetter(str) {
  return /[a-zA-Z]/.test(str)
}

const TeamSpeakHandler = require('../../../controllers/teamSpeak')

const COUNTDOWN_TIME = 1000 * 30 // 30 seconds

/**
 * Match class.
 *
 */
class Match {
  constructor({ players, matchId, type }) {
    logger.info('Constructor()')

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
    this._stats = []
    this._teamSpeak = {
      mainCid: '',
      statusCid: '',
      talkCid: '',
      teamOneCid: '',
      teamTwoCid: ''
    }
    this._status = 'playerveto'
    this._timeout = null
    this._countdown = null
    this._server = null
    this._dathostServerId = null
    this._dathostMatchId = null
  }

  initMatch() {
    return new Promise(async (resolve, reject) => {
      try {
        logger.info('initMatch()')

        logger.info('Got server', this._server)

        this._mapVeto.pool = await getActiveMapPool({ type: this._type })

        logger.info('Got active map-pool', this._mapVeto.pool)

        const { teamOneCaptain, teamTwoCaptain } = getTeamCaptains({
          players: this._players
        })

        const teamOneCaptainProfile = await idToProfile({ id: teamOneCaptain })
        const teamTwoCaptainProfile = await idToProfile({ id: teamTwoCaptain })

        logger.info('Got captains', { teamOneCaptain, teamTwoCaptain })

        this._teamOne.captain = teamOneCaptain
        this._teamOne.name = 'team_' + teamOneCaptainProfile.name
        this._teamTwo.captain = teamTwoCaptain
        this._teamTwo.name = 'team_' + teamTwoCaptainProfile.name

        logger.info('Created TeamSpeak Match')

        const matchId = await createMatchInDb({
          data: this.matchStateDbFriendly
        })
        const match = await getMatchFromDb({ matchId })

        logger.info('Created Match in DB')

        this._matchId = matchId
        this._teamOne.captain = match.teamOne.captain
        this._teamOne.players = match.teamOne.players
        this._players = match.players
        this._teamTwo.players = match.teamTwo.players
        this._teamTwo.captain = match.teamTwo.captain

        resolve(match)

        this.redirectUsers()
        this.setupTeamSpeak()
        this.startPlayerVeto()
        this.updatePlayersStatus()
        this.updateTeamSpeakStatus()
      } catch (err) {
        logger.error('Error while initiating match', err)
        reject(err)
      }
    })
  }

  redirectUsers() {
    try {
      for (const player of this._players) {
        emitPrivateEvent(player._id, 'MATCH_START', { matchId: this._matchId })
      }
    } catch (err) {
      logger.error('Unable to redirect users', err)
    }
  }

  async setupTeamSpeak() {
    try {
      const teamSpeakHandler = await TeamSpeakHandler.getInstance()
      this._teamSpeak = await teamSpeakHandler.createMatch({
        teamOneName: this._teamOne.name,
        teamTwoName: this._teamTwo.name
      })

      const playersTeamSpeakIds = []

      for (const player of this._players) {
        if (
          this._teamOne.captain._id !== player._id &&
          this._teamTwo.captain._id !== player._id
        ) {
          playersTeamSpeakIds.push(player.teamSpeakId)
        }
      }

      await teamSpeakHandler.moveUsersToChannel({
        teamSpeakIds: playersTeamSpeakIds,
        cid: this._teamSpeak.talkCid
      })

      await teamSpeakHandler.moveUserToChannel({
        teamSpeakId: this._teamOne.captain.teamSpeakId,
        cid: this._teamSpeak.teamOneCid
      })

      await teamSpeakHandler.moveUserToChannel({
        teamSpeakId: this._teamTwo.captain.teamSpeakId,
        cid: this._teamSpeak.teamTwoCid
      })
    } catch (err) {
      logger.err('Issue setting up TeamSpeak', err)
    }
  }

  async updateTeamSpeakStatus() {
    try {
      const teamSpeakHandler = await TeamSpeakHandler.getInstance()

      let title = ''

      if (this._status === 'playerveto') {
        title = 'Status: Playerveto'
      }
      if (this._status === 'mapveto') {
        title = 'Status: Mapveto'
      }
      if (this._status === 'active') {
        title = `Status: [${this._teamOne.roundsWon}] : [${this._teamTwo.roundsWon}] | ${this._map.name}`
      }

      teamSpeakHandler.editChannel({
        cid: this._teamSpeak.statusCid,
        options: { channelName: title }
      })
    } catch (err) {
      logger.error('Issue updating teamspeak status channel', err)
    }
  }

  async updatePlayersStatus() {
    try {
      let status = {
        active: true,
        status: this._status,
        score: {
          teamOne: this._teamOne.roundsWon,
          teamTwo: this._teamTwo.roundsWon
        },
        map: this._map && this._map.name ? this._map.name : 'Unknown',
        matchId: this._matchId
      }

      if (this._status === 'playerveto' || this._status === 'mapveto') {
        const players = playersToIds(this._players)

        for (const player of players) {
          await updateStatus(player, { match: status })
        }
        return
      }

      if (this._status === 'finished') {
        const players = playersToIds(this._players)
        status.active = false
        status.score = {
          teamOne: 0,
          teamTwo: 0
        }
        for (const player of players) {
          await updateStatus(player, { match: status })
        }
        return
      }

      let teamOnePlayers = playersToIds(this._teamOne.players)
      teamOnePlayers.push(
        this._teamOne.captain._id
          ? this._teamOne.captain._id
          : this._teamOne.captain
      )

      let teamTwoPlayers = playersToIds(this._teamTwo.players)
      teamTwoPlayers.push(
        this._teamTwo.captain._id
          ? this._teamTwo.captain._id
          : this._teamTwo.captain
      )

      for (const player of teamOnePlayers) {
        status.isTeamOne = true

        await updateStatus(player, { match: status })
      }

      for (const player of teamTwoPlayers) {
        status.score.teamOne = this._teamTwo.roundsWon
        status.score.teamTwo = this._teamOne.roundsWon

        await updateStatus(player, { match: status })
      }
    } catch (err) {
      logger.error('Failed updating players status', err)
    }
  }

  startMatch() {
    setTimeout(() => {
      this.emitEvent({
        event: 'CHANGE_STATUS',
        data: { matchId: this._matchId, status: 'active' }
      })
      this._countdown = getFutureTime({ timeAdded: 10 * 60 * 1000 }) // 10 minutes, the time to connect
      this.emitEvent({
        event: 'SET_COUNTDOWN',
        data: { countdown: this._countdown, matchId: this._matchId }
      })
    }, 2000)
    this._status = 'active'
    this.updatePlayersStatus()
    this.updateTeamSpeakStatus()
    this.initDathost()
  }

  startPlayerVeto() {
    this._status = 'playerveto'
    this.emitEvent({
      event: 'CHANGE_STATUS',
      data: { matchId: this._matchId, status: 'playerveto' }
    })
    this.setPlayerVetoTimeout()
  }

  setPlayerVetoTimeout() {
    if (this._timeout) {
      clearTimeout(this._timeout)
    }

    this._countdown = getFutureTime({ timeAdded: COUNTDOWN_TIME })
    this.emitEvent({
      event: 'SET_COUNTDOWN',
      data: { countdown: this._countdown, matchId: this._matchId }
    })

    this._timeout = setTimeout(() => {
      // pick random available player
      this._timeout = null

      let pickedById = ''

      if (this._teamTwo.players.length < this._teamOne.players.length) {
        pickedById = this._teamTwo.captain._id
      } else {
        pickedById = this._teamOne.captain._id
      }

      const playersToPick = this.playersToPick

      console.log('Players to pick')
      console.log(this._teamOne.captain._id)
      console.log(this._teamTwo.captain._id)
      console.log(playersToPick)

      const pickedId =
        playersToPick[Math.floor(Math.random() * playersToPick.length)]._id

      this.pickPlayer({ pickedById, pickedId })

      logger.info(`Picked random player ${pickedId} because of timeout`)
    }, COUNTDOWN_TIME)
  }

  setMapVetoTimeout() {
    if (this._timeout) {
      clearTimeout(this._timeout)
    }

    this._countdown = getFutureTime({ timeAdded: COUNTDOWN_TIME })
    this.emitEvent({
      event: 'SET_COUNTDOWN',
      data: { countdown: this._countdown, matchId: this._matchId }
    })

    this._timeout = setTimeout(() => {
      // ban random available map
      this._timeout = null

      let bannedById = ''

      if (this._mapVeto.teamTwoBans.length < this._mapVeto.teamOneBans.length) {
        bannedById = this._teamTwo.captain._id
      } else {
        bannedById = this._teamOne.captain._id
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
    this.emitEvent({
      event: 'CHANGE_STATUS',
      data: { matchId: this._matchId, status: 'mapveto' }
    })
    this.setMapVetoTimeout()
    this.updatePlayersStatus()
    this.updateTeamSpeakStatus()
  }

  updateRemoteMatchState() {
    this.emitEvent({ event: 'state', data: this.matchState })
  }

  async saveMatchState() {
    try {
      const match = await saveMatchToDb({
        matchId: this._matchId,
        match: this.matchStateDbFriendly
      })
    } catch (err) {
      logger.error('Failed to save match state', err)
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
    logger.info(`User ${bannedById} is trying to ban ${mapKey}`)

    let bannedMaps = this._mapVeto.teamOneBans.concat(this._mapVeto.teamTwoBans)

    if (bannedMaps.includes(mapKey)) {
      return logger.warn('Map is already banned')
    }

    if (this._teamOne.captain._id.toString() === bannedById.toString()) {
      if (this._mapVeto.teamOneBans.length > this._mapVeto.teamTwoBans.length) {
        return logger.warn('Team One already has more banned maps')
      }

      this._mapVeto.teamOneBans.push(mapKey)
      this.emitEvent({
        event: 'BAN_MAP',
        data: {
          matchId: this._matchId,
          teamOne: true,
          mapKey
        }
      })
    }

    if (this._teamTwo.captain._id.toString() === bannedById.toString()) {
      if (
        this._mapVeto.teamTwoBans.length >= this._mapVeto.teamOneBans.length
      ) {
        return logger.warn('Team Two already has more or equal banned maps')
      }

      this._mapVeto.teamTwoBans.push(mapKey)

      this.emitEvent({
        event: 'BAN_MAP',
        data: {
          matchId: this._matchId,
          teamOne: false,
          mapKey
        }
      })
    }

    if (this.availableMaps.length === 1) {
      // set the only map that is not banned as the match map and start match
      this._map = this.getMapByKey({ mapKey: this.availableMaps[0] })
      logger.info('Last remaining map is', this._map)

      this.emitEvent({
        event: 'SET_MAP',
        data: { map: this._map, matchId: this._matchId }
      })

      try {
        await this.saveMatchState()
      } catch (err) {
        logger.erroror('Failed to save match state', err)
      }
      return this.startMatch()
    }

    if (this.availableMaps && !this._map) {
      this.setMapVetoTimeout()
    }
  }

  getMapByKey({ mapKey }) {
    return this._mapVeto.pool.maps.filter((map) => map.key === mapKey)[0]
  }

  async pickPlayer({ pickedById, pickedId }) {
    if (
      playersToIds(this._teamOne.players).includes(pickedId.toString()) ||
      playersToIds(this._teamTwo.players).includes(pickedId.toString()) ||
      this._teamOne.captain._id == pickedId ||
      this._teamTwo.captain._id == pickedId
    ) {
      return logger.warn('Player is already part of a team')
    }
    console.log('Team One', playersToIds(this._teamOne.players))
    console.log('Team Two', playersToIds(this._teamTwo.players))
    console.log('Picked ID', pickedId)
    console.log(this._teamOne.captain._id)
    console.log(this._teamTwo.captain._id)

    if (this._teamOne.captain._id.toString() === pickedById.toString()) {
      if (this._teamOne.players.length > this._teamTwo.players.length) {
        return logger.warn('Team One already has more players')
      }

      await this.addPlayerToTeam({ playerId: pickedId, teamOne: true })

      this.emitEvent({
        event: 'PICK_PLAYER',
        data: {
          matchId: this._matchId,
          teamOne: true,
          userId: pickedId
        }
      })
    }

    if (this._teamTwo.captain._id.toString() === pickedById.toString()) {
      if (this._teamTwo.players.length >= this._teamOne.players.length) {
        return logger.warn('Team Two already has more or equal players')
      }

      await this.addPlayerToTeam({ playerId: pickedId, teamOne: false })

      this.emitEvent({
        event: 'PICK_PLAYER',
        data: {
          matchId: this._matchId,
          teamOne: false,
          userId: pickedId
        }
      })
    }

    // move last remaining player to other team
    if (
      this._teamTwo.players.length + this._teamOne.players.length + 3 ===
      this._players.length
    ) {
      try {
        this.emitEvent({
          event: 'PICK_PLAYER',
          data: {
            matchId: this._matchId,
            teamOne: false,
            userId: this.playersToPick[0]._id
          }
        })

        await this.addPlayerToTeam({
          playerId: this.playersToPick[0]._id,
          teamOne: false
        })

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

    for (const map of this._mapVeto.pool.maps) {
      if (
        !this._mapVeto.teamOneBans.includes(map.key) &&
        !this._mapVeto.teamTwoBans.includes(map.key)
      ) {
        maps.push(map.key)
      }
    }

    return maps
  }

  async addPlayerToTeam({ playerId, teamOne }) {
    try {
      logger.info(
        `Adding player with id ${playerId} to ${
          teamOne ? 'teamOne' : 'teamTwo'
        }`
      )
      const teamSpeakHandler = await TeamSpeakHandler.getInstance()
      const player = this.playersMap[playerId]

      //logger.info('Player info taken from playersMap', player)

      if (teamOne) {
        this._teamOne.players.push(player)
        teamSpeakHandler.moveUserToChannel({
          teamSpeakId: player.teamSpeakId,
          cid: this._teamSpeak.teamOneCid
        })
        return
      }

      this._teamTwo.players.push(player)
      teamSpeakHandler.moveUserToChannel({
        teamSpeakId: player.teamSpeakId,
        cid: this._teamSpeak.teamTwoCid
      })
    } catch (err) {
      logger.error(err)
    }
  }

  onMessage({ userId, event, data }) {
    // Do if check like below only for captains or permission relevant stuff
    //if (!playersToIds(this._players).includes(userId)) {
    //  return logger.warn(`User ${userId} is not part of this game`)
    //}

    switch (event) {
      case 'message':
        break
      case 'pick-player':
        this.pickPlayer({ pickedById: userId, pickedId: data.pickedId })
        break
      case 'ban-map':
        this.banMap({ bannedById: userId, mapKey: data.mapKey })
        break
      case 'get-state':
        this.sendState({ userId })
        break
      default:
        logger.warn('Unhandled event', event)
    }
  }

  sendState({ userId }) {
    console.log('Sending state')
    emitPrivateEvent(userId, 'MATCH_SET_TEAM_ONE', {
      matchId: this._matchId,
      teamOne: this._teamOne.players
    })
    emitPrivateEvent(userId, 'MATCH_SET_TEAM_TWO', {
      matchId: this._matchId,
      teamTwo: this._teamTwo.players
    })
    emitPrivateEvent(userId, 'MATCH_SET_MAPVETO', {
      matchId: this._matchId,
      mapVeto: this._mapVeto
    })
    emitPrivateEvent(userId, 'MATCH_SET_STATUS', {
      matchId: this._matchId,
      status: this._status
    })
    emitPrivateEvent(userId, 'MATCH_SET_COUNTDOWN', {
      countdown: this._countdown,
      matchId: this._matchId
    })
    emitPrivateEvent(userId, 'MATCH_SCORE_UPDATE', {
      teamOne: this._teamOne.roundsWon,
      teamTwo: this._teamTwo.roundsWon,
      matchId: this._matchId,
      stats: this._stats
    })
  }

  handleDathostMatchRequest(data) {
    logger.info('handleDathostMatchRequest()')
    console.log(data)
    if (data.cancel_reason) {
      return this.endMatch({ stats: {}, cancelled: true })
    }

    if (data.finished) {
      this.endMatch({ stats: data, cancelled: false })
    }
  }

  handleDathostRoundRequest(data) {
    logger.info('handleDathostRoundRequest()')
    console.log(data)
    if (!data.rounds_played || data.rounds_played === 0) {
      return logger.warn('Not really started yet')
    }

    this._teamOne.roundsWon = data.team1_stats.score
    this._teamTwo.roundsWon = data.team2_stats.score
    this._stats = data.player_stats

    if (data.rounds_played === 1) {
      this._countdown = getFutureTime({ timeAdded: 0 })

      this.emitEvent({
        event: 'SET_COUNTDOWN',
        data: { countdown: this._countdown, matchId: this._matchId }
      })
    }

    this.updatePlayersStatus()
    this.updateTeamSpeakStatus()
    console.log('Do score update', {
      teamOne: this._teamOne.roundsWon,
      teamTwo: this._teamTwo.roundsWon,
      stats: this._stats,
      matchId: this._matchId
    })
    this.emitEvent({
      event: 'SCORE_UPDATE',
      data: {
        teamOne: this._teamOne.roundsWon,
        teamTwo: this._teamTwo.roundsWon,
        stats: this._stats,
        matchId: this._matchId
      }
    })
  }

  async initDathost() {
    try {
      logger.info('Setting up Dathost server')
      const dathostServer = await cloneServer({
        serverId: process.env.DATHOST_DEFAULT_SERVER
      })
      this._dathostServerId = dathostServer.id
      logger.info('Cloned dathost default server', dathostServer)
      const gslt = await generateGSLT({ matchId: this._matchId })
      logger.info('Generated new gslt', gslt)

      let data = {
        'csgo_settings.steam_game_server_login_token': gslt
      }

      if (containsAnyLetter(this._map.key)) {
        data['csgo_settings.mapgroup_start_map'] = this._map.key
      } else {
        data['csgo_settings.mapgroup_start_map'] = this._map.key
      }

      await updateServer({
        serverId: this._dathostServerId,
        data
      })

      logger.info('Updated dathost server (map and gslt)')

      const config = this.getDathostConfig()
      const dathostMatch = await createMatch({ config })

      this._dathostMatchId = dathostMatch.id
      logger.info('Created Dathost match', dathostMatch)

      this._server = {
        connect: dathostServer.raw_ip + ':' + dathostServer.ports.game,
        gotv: dathostServer.raw_ip + ':' + dathostServer.ports.gotv
      }

      setTimeout(() => {
        this.emitEvent({
          event: 'SERVER_AVAILABLE',
          data: {
            matchId: this._matchId,
            server: this._server
          }
        })
      }, 6000)

      this.saveMatchState()
    } catch (err) {
      logger.error('Issue creating dathost stuff', err)
    }
  }

  getDathostConfig() {
    let teamOne = [this._teamOne.captain.csgoId]
    let teamTwo = [this._teamTwo.captain.csgoId]

    for (const player of this._teamOne.players) {
      teamOne.push(player.csgoId)
    }

    for (const player of this._teamTwo.players) {
      teamTwo.push(player.csgoId)
    }

    return {
      connect_time: 600,
      enable_knife_round: true,
      enable_playwin: false,
      game_server_id: this._dathostServerId,
      message_prefix: 'EZPUG Bot',
      round_end_webhook_url:
        process.env.BASE_URL + '/webhook/dathost-round/' + this._matchId,
      match_end_webhook_url:
        process.env.BASE_URL + '/webhook/dathost-match/' + this._matchId,
      team1_name: this._teamOne.name,
      team2_name: this._teamTwo.name,
      //team1_steam_ids: teamOne,
      //team2_steam_ids: teamTwo,
      team1_steam_ids: ['STEAM_1:1:105363156'],
      team2_steam_ids: ['STEAM_1:0:487708863'],
      enable_pause: true,
      wait_for_spectators: false,
      warmup_time: 15
    }
  }

  async moveAllToTalkChannelAndDeleteChannels() {
    try {
      const playersTeamSpeakIds = []

      const teamSpeakHandler = await TeamSpeakHandler.getInstance()

      for (const player of this._players) {
        playersTeamSpeakIds.push(player.teamSpeakId)
      }

      await teamSpeakHandler.moveUsersToChannel({
        teamSpeakIds: playersTeamSpeakIds,
        cid: teamSpeakHandler._generalTalkCid
      })

      teamSpeakHandler.removeChannel({ cid: this._teamSpeak.mainCid })
    } catch (err) {
      logger.error('Failed to move all users to talk channel', err)
    }
  }

  async handlePlayerStats({ stats, teamOneScore, teamTwoScore }) {
    try {
      const playerStatsMap = stats.reduce((map, player) => {
        map[player.steam_id] = player
        return map
      }, {})
      console.log('Hi')
      console.log(playerStatsMap)
      await updateUserStats({
        userId: this._teamOne.captain._id,
        stats: playerStatsMap[this._teamOne.captain.csgoId]
          ? playerStatsMap[this._teamOne.captain.csgoId]
          : {},
        teamOne: true,
        teamOneScore,
        teamTwoScore,
        matchId: this._matchId,
        map: this._map
      })
      console.log('whooo')
      for (const player of this._teamOne.players) {
        await updateUserStats({
          userId: player._id,
          stats: playerStatsMap[player.csgoId]
            ? playerStatsMap[player.csgoId]
            : {},
          teamOne: true,
          teamOneScore,
          teamTwoScore,
          matchId: this._matchId,
          map: this._map
        })
      }

      await updateUserStats({
        userId: this._teamTwo.captain._id,
        stats: playerStatsMap[this._teamTwo.captain.csgoId]
          ? playerStatsMap[this._teamTwo.captain.csgoId]
          : {},
        teamOne: false,
        teamOneScore,
        teamTwoScore,
        matchId: this._matchId,
        map: this._map
      })

      for (const player of this._teamTwo.players) {
        await updateUserStats({
          userId: player._id,
          stats: playerStatsMap[player.csgoId]
            ? playerStatsMap[player.csgoId]
            : {},
          teamOne: false,
          teamOneScore,
          teamTwoScore,
          matchId: this._matchId,
          map: this._map
        })
      }
    } catch (err) {
      logger.error('Failed to update player stats', err)
    }
  }

  async cancelMatch() {
    try {
      this.emitEvent({ event: 'CANCELLED', data: {} })
      this._status = 'cancelled'
      this.saveMatchState()
      await stopServer({ serverId: this._dathostServerId })
      await deleteServer({ serverId: this._dathostServerId })
    } catch (err) {
      console.log('Failed to cancel match', err)
    }
  }

  async endMatch({ stats, cancelled }) {
    try {
      // ToDo
      // Handle Demos
      // Delete match from matchhandler

      if (this._status === 'finished') {
        return logger.warn('For some reason called again')
      }

      logger.info('Ending match', this._matchId)
      this._status = 'finished'

      this.emitEvent('STATUS_UPDATE', {
        status: 'finished',
        matchId: this._matchId
      })

      this.updatePlayersStatus()

      this.moveAllToTalkChannelAndDeleteChannels()
      logger.info('Moved users & Deleted channels')

      if (cancelled || !(stats && stats.team1_stats)) {
        console.log('Cancelled:(')
        return this.cancelMatch()
      }

      // should save stats to match
      // should update average stats for all players
      this.handlePlayerStats({
        stats: stats.player_stats,
        teamOneScore: stats.team1_stats.score,
        teamTwoScore: stats.team2_stats.score
      })

      this._teamOne.roundsWon = stats.team1_stats.score
      this._teamTwo.roundsWon = stats.team2_stats.score

      // save demo (takes around 20 seconds for server to have demo ready)
      setTimeout(async () => {
        try {
          await downloadDemo({
            serverId: this._dathostServerId,
            dathostMatchId: this._dathostMatchId,
            matchId: this._matchId
          })
          await stopServer({ serverId: this._dathostServerId })
          logger.info('Stopped server')
          await deleteServer({ serverId: this._dathostServerId })
          logger.info("removed server")
          // here we should probably remove it from matches map of matchHandler
        } catch (err) {
          logger.error('Failed to save demo and delete server', err)
        }
      }, 30 * 1000)

      this.saveMatchState()
    } catch (err) {
      logger.error('Failed to end match', err)
    }
  }

  get matchId() {
    return this._matchId
  }

  get playersToPick() {
    let availablePlayers = []
    const players = this._players
    let teamOnePlayers = playersToIds(this._teamOne.players)
    let teamTwoPlayers = playersToIds(this._teamTwo.players)

    for (const player of players) {
      if (
        !teamOnePlayers.includes(player._id.toString()) &&
        !teamTwoPlayers.includes(player._id.toString()) &&
        this._teamOne.captain._id.toString() !== player._id.toString() &&
        this._teamTwo.captain._id.toString() !== player._id.toString()
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
          ? this._teamOne.captain._id
          : this._teamOne.captain
      },
      teamTwo: {
        name: this._teamTwo.name,
        roundsWon: this._teamTwo.roundsWon,
        players: this._teamTwo.players,
        captain: this._teamTwo.captain._id
          ? this._teamTwo.captain._id
          : this._teamTwo.captain
      },
      demoLink: this._demoLink,
      stats: this._stats,
      teamSpeak: this._teamSpeak,
      timer: this._timeout ? getTimeLeft(this._timeout) : -1,
      server: this._server,
      stats: this._stats ? this._stats : []
    }
  }

  get matchStateDbFriendly() {
    const state = this.matchState
    state.players =
      this._players.length > 0 && this._players[0]._id
        ? playersToIds(this._players)
        : this._players
    state.teamOne.players = playersToIds(this._teamOne.players)
    state.teamTwo.players = playersToIds(this._teamTwo.players)
    state.server = this._server

    delete state.playersToPick

    return state
  }
}

module.exports.Match = Match
