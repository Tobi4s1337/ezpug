const User = require('../../models/user')
const { getItem } = require('../../middleware/db')
const { joinUserRoom } = require('./joinUserRoom')
const { joinFriendsRooms } = require('./joinFriendsRooms')
const { joinAdminRoom } = require('./joinAdminRoom')

/**
 * Adds user socket connection to all relevant rooms
 * @param {object} socket - user socket
 */
const joinRooms = (socket) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await getItem(socket.userId, User)
      joinUserRoom(socket)
      joinFriendsRooms(socket, user.friends)
      if (user.role === 'admin') {
        joinAdminRoom(socket)
      }
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = { joinRooms }
