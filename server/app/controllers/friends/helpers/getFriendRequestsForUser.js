const FriendRequest = require('../../../models/friendRequest')
const { buildErrObject } = require('../../../middleware/utils')

/**
 * Find friend request by recipient
 * @param {Object} recipient - userid of recipient
 */
const getFriendRequestsForUser = (recipient) => {
  return new Promise((resolve, reject) => {
    FriendRequest.find({ recipient })
      .populate('requester', 'name avatar')
      .exec((err, foundRequests) => {
        if (err) {
          reject(buildErrObject(422, err))
        }
        resolve(foundRequests)
      })
  })
}

module.exports = { getFriendRequestsForUser }
