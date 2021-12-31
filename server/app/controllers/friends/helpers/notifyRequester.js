const FriendRequest = require('../../../models/friendRequest')
const { emitPrivateEvent } = require('../../../socket')
const { buildErrObject } = require('../../../middleware/utils')

/**
 * Notifies requester of a friend request that a new request exists
 * @param {String} id - id of friend request
 */
const notifyRequester = (id = '') => {
  return new Promise((resolve, reject) => {
    FriendRequest.findById(id)
      .populate('recipient', 'name avatar')
      .exec((err, foundRequest) => {
        if (err) {
          reject(buildErrObject(422, err))
        }
        emitPrivateEvent(
          foundRequest.requester,
          'NEW_REQUESTED_FRIEND_REQUEST',
          foundRequest
        )
        resolve()
      })
  })
}

module.exports = { notifyRequester }
