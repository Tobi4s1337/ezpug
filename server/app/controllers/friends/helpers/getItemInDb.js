const FriendRequest = require('../../../models/friendRequest')
const { buildErrObject } = require('../../../middleware/utils')

/**
 * Gets Item from database
 * @param {Object} id - id of item
 */
const getItemInDb = (id = '') => {
  return new Promise((resolve, reject) => {
    FriendRequest.findById(id, (err, foundRequest) => {
      if (err || !foundRequest) {
        reject(buildErrObject(422, err ? err.message : 'NOT FOUND'))
      }
      resolve(foundRequest)
    })
  })
}

module.exports = { getItemInDb }
