const User = require('../../../models/user')
const { itemNotFound } = require('../../../middleware/utils')

/**
 * Finds user by steamid
 * @param {string} steamId - user´s steamId
 */
const findUserBySteamId = (steamId = '') => {
  return new Promise((resolve, reject) => {
    User.findOne(
      {
        steamId
      },
      'password loginAttempts blockExpires name email role verified verification',
      async (err, item) => {
        try {
          await itemNotFound(err, item, 'USER_DOES_NOT_EXIST')
          resolve(item)
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

module.exports = { findUserBySteamId }
