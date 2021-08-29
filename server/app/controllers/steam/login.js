const { matchedData } = require('express-validator')

// Some helper functions from auth are required
const {
  saveLoginAttemptsToDB,
  saveUserAccessAndReturnToken
} = require('../../controllers/auth/helpers')

const { findUserBySteamId } = require('./helpers')
const { decrypt } = require('../../middleware/auth')
const { handleError } = require('../../middleware/utils')

/**
 * Steam Login function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const login = async (req, res) => {
  try {
    const data = matchedData(req)
    const user = await findUserBySteamId(decrypt(data.steamId))
    user.loginAttempts = 0
    await saveLoginAttemptsToDB(user)
    res.status(200).json(await saveUserAccessAndReturnToken(req, user))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { login }
