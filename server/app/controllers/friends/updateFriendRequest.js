const { matchedData } = require('express-validator')
const { handleError, isIDGood } = require('../../middleware/utils')

const { addFriendsFromRequest, removeItemInDb } = require('./helpers')

/**
 * Accept or decline friend request function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const updateFriendRequest = async (req, res) => {
  try {
    const id = await isIDGood(req.params.friendRequestId)
    req = matchedData(req)
    if (req.accepted) {
      await addFriendsFromRequest(id)
      res.status(200).json({ msg: 'social.REQUEST_ACCEPTED' })
    } else {
      res.status(200).json({ msg: 'social.REQUEST_DECLINED' })
    }
    await removeItemInDb(id)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { updateFriendRequest }
