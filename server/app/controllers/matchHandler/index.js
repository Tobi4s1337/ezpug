const Match = require('./match')
const { getActiveMatches } = require('./match/helpers')

/**
 * @var {Promise<MatchHandler>}
 */
let instance

/**
 * MatchHandler Singleton class.
 *
 * Can create and cancel matches
 */
class MatchHandler {
  constructor() {
    console.log('Creating MatchHandler')

    this._matches = {}
  }

  async init() {
    try {
      // load existing active matches
      const matches = getActiveMatches()

      for (const match of matches) {
        this.createMatch({ matchId: match._id })
      }
    } catch (err) {
      console.log('Error creating MatchHandler:', err)
    }
  }

  createMatch({ type, players, matchId }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (matchId) {
          const match = new Match({ matchId })
          this._matches[matchId] = match
          return
        }

        const match = new Match({ type, players })
        await match.initMatch()

        this._matches[match.matchId]

        resolve(match.matchId)
      } catch (err) {
        reject(err)
      }
    })
  }

  cancelMatch() {}

  get activeMatches() {}
}

/**
 * @return {Promise<MatchHandler>}
 */
MatchHandler.getInstance = async function () {
  if (!instance) {
    const matchHandler = new MatchHandler()

    instance = await matchHandler.init()
  }

  return instance
}

module.exports = MatchHandler
