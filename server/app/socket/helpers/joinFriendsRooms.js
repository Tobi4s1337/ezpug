/**
 * Lets user socket join all rooms for each friend to track status etc.
 * @param {object} socket - user socket
 * @param {array} friends - user friends
 */
const joinFriendsRooms = (socket, friends) => {
  for (const friendId in friends) {
    socket.join(`status-${friendId}`)
  }
}

module.exports = { joinFriendsRooms }
