const User = require('../../../models/user')
const { emitPrivateEvent, emitSocialEvent } = require('../../../socket')

/**
 * Updates status of an user
 * @param {String} userId - id of user
 * @param {Object} status - status object
 */
const updateStatus = (userId, status) => {
  return new Promise((resolve, reject) => {
    User.findById(userId, (err, foundUser) => {
      if (err || !foundUser) {
        return reject(err)
      }

      const newStatus = foundUser.status

      if (status.online === true) {
        newStatus.online = true
      }

      if (status.inQueue === true) {
        newStatus.inQueue = true
      }

      if (status.inQueue === false) {
        newStatus.inQueue = false
      }

      if (status.match) {
        newStatus.match = status.match
      }

      if (status.online === false) {
        newStatus.online = false
      }

      if (status.lastSeen) {
        newStatus.lastSeen = status.lastSeen
      }

      if (status.teamSpeak === true) {
        newStatus.teamSpeak = true
      }

      if (status.teamSpeak === false) {
        newStatus.teamSpeak = false
      }

      User.findByIdAndUpdate(
        userId,
        { $set: { status: newStatus } },
        (error, updatedUser) => {
          if (error) {
            return reject(error)
          }
          emitSocialEvent(userId, 'CHANGED_STATUS', {
            userId,
            status: newStatus
          })
          emitPrivateEvent(userId, 'UPDATE_USER', { status: newStatus })
          resolve(updatedUser)
        }
      )
    })
  })
}

module.exports = { updateStatus }
