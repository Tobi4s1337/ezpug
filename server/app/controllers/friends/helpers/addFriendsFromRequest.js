const FriendRequest = require('../../../models/friendRequest')
const User = require('../../../models/user')
const { buildErrObject } = require('../../../middleware/utils')
const { emitPrivateEvent } = require('../../../socket')

/**
 * Adds user to friendlist
 * @param {String} userId - id of user
 * @param {Object} friend - object of friend
 */
const addUserToFriendlist = (userId, friend) => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      userId,
      { $push: { friends: friend._id } },
      (err, updatedUser) => {
        if (err) {
          reject(buildErrObject(422, err))
        }
        emitPrivateEvent(userId, 'NEW_FRIEND', friend)
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
    FriendRequest.findById(id)
      .populate('recipient', 'name avatar status')
      .populate('requester', 'name avatar status')
      .exec(async (err, foundRequest) => {
        if (err) {
          reject(buildErrObject(422, err))
        }
        try {
          await addUserToFriendlist(
            foundRequest.recipient._id,
            foundRequest.requester
          )
          await addUserToFriendlist(
            foundRequest.requester._id,
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
