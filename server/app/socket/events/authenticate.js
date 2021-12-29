const {
  getUserIdFromToken
} = require('../../controllers/auth/helpers/getUserIdFromToken')
const { updateStatus } = require('../../controllers/users/helpers/updateStatus')

/**
 * Authenticates user socket connection
 * @param {object} socket - user socket
 * @param {string} key - user jwt
 */
const authenticate = (socket, { key = '' }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userId = await getUserIdFromToken(key)
      socket.userId = userId
      socket.authenticated = true
      updateStatus(userId, { online: true })
      resolve(userId)
    } catch (err) {
      reject(err)
    }
  })
  // return new Promise(async (resolve, reject) => {})
}

module.exports = { authenticate }
