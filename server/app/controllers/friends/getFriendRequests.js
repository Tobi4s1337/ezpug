const { handleError, isIDGood } = require('../../middleware/utils')

const {
  getFriendRequestsByUser,
  getFriendRequestsForUser
} = require('./helpers')

/**
 * Get friend requests function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const getFriendRequests = async (req, res) => {
  try {
    const id = await isIDGood(req.user._id)
    const receivedFriendRequests = await getFriendRequestsForUser(id)
    const sentFriendRequests = await getFriendRequestsByUser(id)
    res.status(200).json({ receivedFriendRequests, sentFriendRequests })
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getFriendRequests }
