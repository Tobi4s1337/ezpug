const FriendRequest = require('../../../models/friendRequest')
const User = require('../../../models/user')
const { buildErrObject } = require('../../../middleware/utils')

/**
 * Creates a new item in database
 * @param {Object} req - request object
 */
const createItemInDb = ({ requester = '', recipient = '' }) => {
  return new Promise((resolve, reject) => {
    const friendRequest = new FriendRequest({
      requester,
      recipient
    })
    friendRequest.save((err, item) => {
      if (err) {
        reject(buildErrObject(422, err.message))
      }

      User.findById(recipient)
        .select('name avatar')
        .exec((e, foundUser) => {
          if (e) {
            reject(buildErrObject(422, e.message))
          }

          item = JSON.parse(JSON.stringify(item))
          item.recipient = foundUser
          resolve(item)
        })
    })
  })
}

module.exports = { createItemInDb }
