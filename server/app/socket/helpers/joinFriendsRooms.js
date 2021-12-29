/**
 * Lets user socket join all rooms for each friend to track status etc.
 * @param {object} socket - user socket
 * @param {array} friends - user friends
 */
const joinFriendsRooms = (socket, friends) => {
  friends.forEach((friendId) => {
    console.log(`social-${friendId}`)
    socket.join(`social-${friendId}`)
  })
}

module.exports = { joinFriendsRooms }
