const { updateStatus } = require('../../controllers/users/helpers/updateStatus')

/**
 * Handles user disconnect event
 * @param {String} userId - id of user
 */
const disconnect = (userId) => {
  if (userId) {
    updateStatus(userId, { online: false, lastSeen: Date.now() })
  }
}

module.exports = { disconnect }
