const Match = require('../../models/match')
const { matchedData } = require('express-validator')
const { isIDGood, handleError } = require('../../middleware/utils')
const { getItem } = require('../../middleware/db')

/**
 * Get item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const getMatch = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await isIDGood(req.id)
    console.log(id)
    res.status(200).json(await getItem(id, Match))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { getMatch }
