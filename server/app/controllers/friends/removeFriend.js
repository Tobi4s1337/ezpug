const { handleError, isIDGood } = require('../../middleware/utils')

const { removeFriendFromUser } = require('./helpers')

/**
 * Get friend requests function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const removeFriend = async (req, res) => {
  try {
    const friendUserId = await isIDGood(req.params.friendUserId)
    const userId = req.user._id
    await removeFriendFromUser(userId, friendUserId)
    res.sendStatus(200)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { removeFriend }
