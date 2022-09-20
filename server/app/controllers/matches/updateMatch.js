const Match = require('../../models/match')
const { matchedData } = require('express-validator')
const { isIDGood, handleError } = require('../../middleware/utils')
const { updateItem } = require('../../middleware/db')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const updateMatch = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await isIDGood(req.id)
    if (!doesEmailExists) {
      res.status(200).json(await updateItem(id, Match, req))
    }
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { updateMatch }
