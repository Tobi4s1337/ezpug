const Match = require('../../../../models/match')

const getMatchFromDb = ({ matchId }) => {
  return new Promise((resolve, reject) => {
    Match.findById(matchId, (err, foundMatch) => {
      if (err || !foundMatch) {
        return reject(err)
      }

      resolve(foundMatch)
    })
  })
}

module.exports = { getMatchFromDb }
