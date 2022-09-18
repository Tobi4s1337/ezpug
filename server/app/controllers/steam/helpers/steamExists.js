const User = require('../../../models/user')

const steamExists = (steamId) => {
  return new Promise((resolve, reject) => {
    User.findOne({ steamId }, (err, foundUser) => {
      if (err || !foundUser) {
        return resolve(false)
      }
      resolve(true)
    })
  })
}

module.exports = { steamExists }
