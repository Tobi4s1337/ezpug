const { handleError, isIDGood } = require('../../middleware/utils')
const { emitPrivateEvent } = require('../../socket')

const { removeItemInDb, getItemInDb } = require('./helpers')

/**
 * Remove friend request called from route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const removeFriendRequest = async (req, res) => {
  try {
    const id = await isIDGood(req.params.friendRequestId)
    const friendRequest = await getItemInDb(req.params.friendRequestId)

    await removeItemInDb(id)

    emitPrivateEvent(
      friendRequest.recipient,
      'DELETE_RECEIVED_FRIEND_REQUEST',
      {
        id: friendRequest._id
      }
    )
    emitPrivateEvent(
      friendRequest.requester,
      'DELETE_REQUESTED_FRIEND_REQUEST',
      {
        id: friendRequest._id
      }
    )

    res.sendStatus(200)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { removeFriendRequest }
