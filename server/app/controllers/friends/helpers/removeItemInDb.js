const FriendRequest = require('../../../models/friendRequest')
const { buildErrObject } = require('../../../middleware/utils')

/**
 * Remove friend request
 * @param {string} id - request object
 */
const removeItemInDb = (id = '') => {
  return new Promise((resolve, reject) => {
    FriendRequest.findByIdAndRemove(id, (err) => {
      if (err) {
        reject(buildErrObject(422, err))
      }
      resolve()
    })
  })
}

module.exports = { removeItemInDb }
