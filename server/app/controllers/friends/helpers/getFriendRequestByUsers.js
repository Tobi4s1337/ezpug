const FriendRequest = require('../../../models/friendRequest')

/**
 * Find friend request by requester and recipient
 * @param {Object} req - request object
 */
const getFriendRequestByUsers = ({ requester = '', recipient = '' }) => {
  return new Promise((resolve) => {
    FriendRequest.findOne({ requester, recipient }, (err, foundRequest) => {
      if (err) {
        resolve(false)
        return
      }
      resolve(foundRequest)
    })
  })
}

module.exports = { getFriendRequestByUsers }
