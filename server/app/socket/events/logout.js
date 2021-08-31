const { Socket } = require('socket.io')
const { leaveRooms } = require('../helpers')

/**
 * Disconnects user from all rooms and removes userId from socket
 * @param {object} socket - user socket
 * @param {object} io - socket io instance
 */
const logout = (socket, io) => {
  leaveRooms(Socket, io)
  socket.userId = null
  socket.authenticated = false
}

module.exports = { logout }
