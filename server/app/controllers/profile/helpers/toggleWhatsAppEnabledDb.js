const User = require('../../../models/user')

const getEnabled = ({ userId }) => {
  return new Promise((resolve, reject) => {
    User.findById(userId, (err, foundUser) => {
      if (err || !foundUser) {
        return reject(err ? err : 'User not found')
      }

      resolve(foundUser.whatsAppEnabled)
    })
  })
}

const toggleWhatsAppEnabledDb = ({ userId }) => {
  return new Promise(async (resolve, reject) => {
    const currentState = await getEnabled({ userId })

    User.findByIdAndUpdate(
      userId,
      { $set: { whatsAppEnabled: !currentState } },
      (err, updatedUser) => {
        if (err) {
          return reject(err)
        }

        resolve(!currentState)
      }
    )
  })
}

module.exports = { toggleWhatsAppEnabledDb }
