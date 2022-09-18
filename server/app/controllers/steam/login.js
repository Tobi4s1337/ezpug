const { matchedData } = require('express-validator')

// Some helper functions from auth are required
const {
  saveLoginAttemptsToDB,
  saveUserAccessAndReturnToken
} = require('../../controllers/auth/helpers')

const { findUserBySteamId, signupUser, steamExists } = require('./helpers')
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
    const steamId = decrypt(data.steamId)

    const doesSteamExists = await steamExists(steamId)
    let user = null
    if (!doesSteamExists) {
      user = await signupUser(steamId)
    } else {
      user = await findUserBySteamId(steamId)
    }
    user.loginAttempts = 0
    await saveLoginAttemptsToDB(user)
    return res.status(200).json(await saveUserAccessAndReturnToken(req, user))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { login }
