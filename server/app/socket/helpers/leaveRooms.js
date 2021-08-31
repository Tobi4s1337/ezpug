/**
 * Removes socket from all rooms it is currently connected to
 * @param {object} socket - user socket
 */
const leaveRooms = (socket, io) => {
  const rooms = io.sockets.adapter.sids[socket.id]
  for (const room in rooms) {
    socket.leave(room)
  }
}

module.exports = { leaveRooms }
