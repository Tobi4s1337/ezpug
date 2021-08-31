const { joinRooms } = require('./joinRooms')
const { joinUserRoom } = require('./joinUserRoom')
const { joinFriendsRooms } = require('./joinFriendsRooms')
const { joinAdminRoom } = require('./joinAdminRoom')
const { leaveRooms } = require('./leaveRooms')

module.exports = {
  joinRooms,
  joinAdminRoom,
  joinUserRoom,
  joinFriendsRooms,
  leaveRooms
}
