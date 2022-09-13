const Match = require('../../../../models/match')

const getActiveMatches = () => {
  return new Promise((resolve, reject) => {
    Match.find({ status: { $ne: 'finished' } }, (err, matches) => {
      if (err) {
        return reject(err)
      }

      resolve(matches)
    })
  })
}

module.exports = { getActiveMatches }
