const User = require('../../../models/user')

const allowedToJoin = ({ userId }) => {
  return new Promise((resolve, reject) => {
    User.findById(userId, (err, foundUser) => {
      if (err || !foundUser) {
        return reject(err)
      }

      if (
        foundUser.status &&
        foundUser.status.teamSpeak &&
        !foundUser.status.inMatch
      ) {
        return resolve(true)
      }

      resolve(false)
    })
  })
}

module.exports = { allowedToJoin }
