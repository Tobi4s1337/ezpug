const FriendRequest = require('../../../models/friendRequest')
const User = require('../../../models/user')
const { buildErrObject } = require('../../../middleware/utils')

/**
 * Adds user to friendlist
 * @param {String} userId - id of user
 * @param {String} friendId - id of friend
 */
const addUserToFriendlist = (userId = '', friendId = '') => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      userId,
      { $push: { friends: friendId } },
      (err, updatedUser) => {
        if (err) {
          reject(buildErrObject(422, err))
        }
        resolve(updatedUser)
      }
    )
  })
}

/**
 * Adds users to each anothers friends list
 * @param {String} id - id of friend request
 */
const addFriendsFromRequest = (id = '') => {
  return new Promise((resolve, reject) => {
    FriendRequest.findById(id, async (err, foundRequest) => {
      if (err) {
        reject(buildErrObject(422, err))
      }
      try {
        await addUserToFriendlist(
          foundRequest.recipient,
          foundRequest.requester
        )
        await addUserToFriendlist(
          foundRequest.requester,
          foundRequest.recipient
        )
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  })
}

module.exports = { addFriendsFromRequest }
