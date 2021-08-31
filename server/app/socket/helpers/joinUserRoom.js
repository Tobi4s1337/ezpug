/**
 * Lets user join user room for communication directly to the user
 * @param {object} socket - user socket
 */
const joinUserRoom = (socket) => {
  socket.join(socket.userId)
}

module.exports = { joinUserRoom }
