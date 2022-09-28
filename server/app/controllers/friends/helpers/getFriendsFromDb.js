const User = require('../../../models/user')
const { itemNotFound } = require('../../../middleware/utils')

/**
 * Get friends of user
 * @param {string} id - user id
 */
const getFriendsFromDb = (id = '') => {
  return new Promise((resolve, reject) => {
    User.findById(id)
      .populate('friends', 'name avatar status stats')
      .exec(async (err, foundUser) => {
        try {
          await itemNotFound(err, foundUser, 'USER_DOES_NOT_EXIST')
          resolve(foundUser.friends)
        } catch (error) {
          reject(error)
        }
      })
  })
}

module.exports = { getFriendsFromDb }
