const Drop = require('../../models/drop')
const { updateItem } = require('../../middleware/db')
const { isIDGood, handleError } = require('../../middleware/utils')
const { matchedData } = require('express-validator')

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const updateDrop = async (req, res) => {
  try {
    const id = await isIDGood(req.params.id)
    res.status(200).json(await updateItem(id, Drop, req.body))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { updateDrop }
