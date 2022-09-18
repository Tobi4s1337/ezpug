const uuid = require('uuid')
const User = require('../../../models/user')
const { buildErrObject } = require('../../../middleware/utils')

/**
 * Registers a new user in database
 * @param {Object} req - request object
 */
const registerUser = (req = {}) => {
  return new Promise((resolve, reject) => {
    let user = null

    if (req.steamId) {
      user = new User({
        steamId: req.steamId,
        email: req.steamId + '@ezpug.com'
      })
    } else {
      user = new User({
        name: req.name,
        email: req.email,
        password: req.password,
        verification: uuid.v4()
      })
    }
    user.save((err, item) => {
      if (err) {
        reject(buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}

module.exports = { registerUser }
