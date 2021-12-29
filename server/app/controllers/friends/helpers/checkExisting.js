const { buildErrObject } = require('../../../middleware/utils')
const { getFriendRequestByUsers } = require('./getFriendRequestByUsers')

/**
 * Throws error in case friend request with those two users already exists
 * @param {Object} req - request object
 */
const checkExisting = ({ requester = '', recipient = '' }) => {
  return new Promise(async (resolve, reject) => {
    const friendRequestsByRequester = await getFriendRequestByUsers({
      requester,
      recipient
    })
    const friendRequestsByRecipient = await getFriendRequestByUsers({
      recipient,
      requester
    })
    if (!friendRequestsByRequester && !friendRequestsByRecipient) {
      resolve()
    } else {
      reject(buildErrObject(422, 'FRIEND_REQUEST_ALREADY_EXISTS'))
    }
  })
}

module.exports = { checkExisting }
