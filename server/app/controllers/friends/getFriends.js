const { handleError, isIDGood } = require('../../middleware/utils')

const { getFriendsFromDb } = require('./helpers')

/**
 * Get friends function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const getFriends = async (req, res) => {
  try {
    const id = await isIDGood(req.user._id)
    const friends = await getFriendsFromDb(id)
    res.status(200).json(friends)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getFriends }
