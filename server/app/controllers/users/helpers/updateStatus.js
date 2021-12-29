const User = require('../../../models/user')
const { emitPrivateEvent, emitSocialEvent } = require('../../../socket')

/**
 * Updates status of an user
 * @param {String} userId - id of user
 * @param {Object} status - status object
 */
const updateStatus = (userId, status) => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(userId, { $set: { status } }, (err, updatedUser) => {
      if (err) {
        reject(err)
      }
      emitSocialEvent(userId, 'CHANGED_STATUS', { userId, status })
      emitPrivateEvent(userId, 'CHANGED_STATUS', { userId, status })
      resolve(updatedUser)
    })
  })
}

module.exports = { updateStatus }
