/**
 * Lets user join admin room
 * @param {object} socket - user socket
 */
const joinAdminRoom = (socket) => {
  socket.join('admin')
}

module.exports = { joinAdminRoom }
