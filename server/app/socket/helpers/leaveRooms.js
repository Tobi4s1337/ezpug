/**
 * Removes socket from all rooms it is currently connected to
 * @param {object} socket - user socket
 */
const leaveRooms = (socket) => {
  socket.leaveAll()
}

module.exports = { leaveRooms }
