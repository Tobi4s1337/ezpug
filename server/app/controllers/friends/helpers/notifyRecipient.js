const FriendRequest = require('../../../models/friendRequest')
const { emitPrivateEvent } = require('../../../socket')
const { buildErrObject } = require('../../../middleware/utils')

/**
 * Notifies receiver of a friend request that a new request exists
 * @param {String} id - id of friend request
 */
const notifyRecipient = (id = '') => {
  return new Promise((resolve, reject) => {
    FriendRequest.findById(id)
      .populate('requester', 'name avatar')
      .exec((err, foundRequest) => {
        if (err) {
          reject(buildErrObject(422, err))
        }
        emitPrivateEvent(
          foundRequest.recipient,
          'NEW_RECEIVED_FRIEND_REQUEST',
          foundRequest
        )
        resolve()
      })
  })
}

module.exports = { notifyRecipient }
