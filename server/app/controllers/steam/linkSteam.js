const { decrypt } = require('../../middleware/auth')
const { handleError } = require('../../middleware/utils')
/**
 * LinkSteam function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const linkSteam = async (req, res) => {
  try {
    console.log(decrypt(req.body.id))
    res.sendStatus(200)
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { linkSteam }
