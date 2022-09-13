const Match = require('../../../../models/match')

const createMatchInDb = ({ data }) => {
  return new Promise((resolve, reject) => {
    Match.create(data, (err, newMatch) => {
      if (err || !newMatch) {
        return reject(err)
      }

      resolve(newMatch)
    })
  })
}

module.exports = { createMatchInDb }
