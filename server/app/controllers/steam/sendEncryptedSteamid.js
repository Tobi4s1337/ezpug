const { encrypt } = require('../../middleware/auth')
const { handleError } = require('../../middleware/utils')
/**
 * SendEncryptedSteamid function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const sendEncryptedSteamid = async (req, res) => {
  try {
    // We need to encrypt and later decrypt the steamid to make sure that a user cant claim the steamid of somebody else
    console.log(req)
    res
      .set(
        'Content-Security-Policy',
        "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'"
      )
      .render('steamAuthSuccess', {
        id: encrypt(req.user._json.steamid),
      })
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { sendEncryptedSteamid }
