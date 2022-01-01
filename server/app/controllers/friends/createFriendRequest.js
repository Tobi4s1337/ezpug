const { matchedData } = require('express-validator')
const {
  isIDGood,
  handleError,
  buildErrObject
} = require('../../middleware/utils')

const {
  checkExisting,
  createItemInDb,
  notifyRecipient,
  notifyRequester
} = require('./helpers')

/**
 * Create friend request function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const createFriendRequest = async (req, res) => {
  try {
    const id = await isIDGood(req.user._id)
    req = matchedData(req)
    req.requester = id
    if (req.requester === req.recipient) {
      throw buildErrObject(422, 'YOU_CANT_ADD_YOURSELF')
      return
    }
    await checkExisting(req)
    const friendRequest = await createItemInDb(req)
    notifyRecipient(friendRequest._id)
    notifyRequester(friendRequest._id)
    res.status(200).json(friendRequest)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { createFriendRequest }
