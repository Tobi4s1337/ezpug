const { isIDGood, handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')
const { updateProfileInDB } = require('./helpers')
const { emitSocialEvent } = require('../../socket')

/**
 * Update profile function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const updateProfile = async (req, res) => {
  try {
    const id = await isIDGood(req.user._id)
    const prevName = req.user.name
    req = matchedData(req)
    res.status(200).json(await updateProfileInDB(req, id))
    if (req.name !== prevName) {
      emitSocialEvent(id, 'CHANGED_NAME', { name: req.name })
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { updateProfile }
