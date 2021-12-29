const { createFriendRequest } = require('./createFriendRequest')
const { getFriendRequests } = require('./getFriendRequests')
const { removeFriendRequest } = require('./removeFriendRequest')
const { updateFriendRequest } = require('./updateFriendRequest')
const { getFriends } = require('./getFriends')
const { removeFriend } = require('./removeFriend')

module.exports = {
  createFriendRequest,
  getFriendRequests,
  removeFriendRequest,
  updateFriendRequest,
  getFriends,
  removeFriend
}
