const Match = require('../../../models/match')

const getServer = ({ matchId }) => {
  return new Promise((resolve, reject) => {
    Match.findById(matchId, (err, foundMatch) => {
      if (
        err ||
        !foundMatch ||
        !foundMatch.server ||
        !foundMatch.server.connect
      ) {
        return reject(err ? err : 'Match or server not found')
      }

      resolve(foundMatch.server.connect)
    })
  })
}

module.exports = { getServer }
