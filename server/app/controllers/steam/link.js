const { decrypt } = require('../../middleware/auth')
const { handleError, isIDGood } = require('../../middleware/utils')
const { addSteamToUser } = require('./helpers')

/**
 * link steam function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const link = async (req, res) => {
  try {
    const steamId = decrypt(req.body.id)
    const userId = await isIDGood(req.user._id)
    const steamUserData = await addSteamToUser(userId, steamId)
    res.status(200).send(steamUserData)
  } catch (error) {
    if(error.code === 422) {
      error.message = "STEAM_ALREADY_EXIST"
    }
    handleError(res, error)
  }
}

module.exports = { link }
