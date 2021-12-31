const User = require('../../../models/user')
const { buildErrObject } = require('../../../middleware/utils')
const { emitPrivateEvent } = require('../../../socket')

/**
 * Removes user from friendlist
 * @param {String} userId - id of user
 * @param {String} friendId - id of friend
 */
const removeUserFromFriendslist = (userId = '', friendId = '') => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      userId,
      { $pull: { friends: friendId } },
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
 * Removes user from each anothers friends list
 * @param {String} userId - id of user
 * @param {String} friendId - id of friend
 */
const removeFriendFromUser = (userId = '', friendId = '') => {
  return new Promise(async (resolve, reject) => {
    try {
      await removeUserFromFriendslist(userId, friendId)
      await removeUserFromFriendslist(friendId, userId)
      emitPrivateEvent(userId, 'DELETE_FRIEND', { id: friendId })
      emitPrivateEvent(friendId, 'DELETE_FRIEND', { id: userId })
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = { removeFriendFromUser }
