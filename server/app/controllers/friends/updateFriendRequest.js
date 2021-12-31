const { matchedData } = require('express-validator')
const { handleError, isIDGood } = require('../../middleware/utils')

const {
  addFriendsFromRequest,
  removeItemInDb,
  getItemInDb
} = require('./helpers')
const { emitPrivateEvent } = require('../../socket')

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

    const friendRequest = await getItemInDb(id)

    emitPrivateEvent(
      friendRequest.recipient,
      'DELETE_RECEIVED_FRIEND_REQUEST',
      {
        id
      }
    )
    emitPrivateEvent(
      friendRequest.requester,
      'DELETE_REQUESTED_FRIEND_REQUEST',
      {
        id
      }
    )

    await removeItemInDb(id)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { updateFriendRequest }
