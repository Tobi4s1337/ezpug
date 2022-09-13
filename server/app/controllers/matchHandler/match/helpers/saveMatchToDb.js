const Match = require('../../../../models/match')

const saveMatchToDb = ({ matchId, match }) => {
  return new Promise((resolve, reject) => {
    Match.findByIdAndUpdate(matchId, { $set: match }, (err, updatedMatch) => {
      if (err) {
        return reject(err)
      }

      resolve(updatedMatch)
    })
  })
}

module.exports = { saveMatchToDb }
