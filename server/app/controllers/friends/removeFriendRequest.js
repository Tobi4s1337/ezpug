const { handleError, isIDGood } = require('../../middleware/utils')

const { removeItemInDb } = require('./helpers')

/**
 * Get friend requests function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const removeFriendRequest = async (req, res) => {
  try {
    const id = await isIDGood(req.params.friendRequestId)
    await removeItemInDb(id)
    res.sendStatus(200)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { removeFriendRequest }
