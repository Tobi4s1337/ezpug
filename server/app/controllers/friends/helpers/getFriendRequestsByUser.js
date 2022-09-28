const FriendRequest = require('../../../models/friendRequest')
const { buildErrObject } = require('../../../middleware/utils')

/**
 * Find friend request by requester
 * @param {Object} requester - userid of requester
 */
const getFriendRequestsByUser = (requester) => {
  return new Promise((resolve, reject) => {
    FriendRequest.find({ requester })
      .populate('recipient', 'name avatar stats')
      .exec((err, foundRequests) => {
        if (err) {
          reject(buildErrObject(422, err))
        }
        resolve(foundRequests)
      })
  })
}

module.exports = { getFriendRequestsByUser }
