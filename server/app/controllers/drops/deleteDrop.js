const model = require('../../models/drop')
const { matchedData } = require('express-validator')
const { isIDGood, handleError } = require('../../middleware/utils')
const { deleteItem } = require('../../middleware/db')

/**
 * Delete item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const deleteDrop = async (req, res) => {
  try {
    const id = await isIDGood(req.params.id)
    res.status(200).json(await deleteItem(id, model))
  } catch (error) {
    handleError(res, error)
  }
}

module.exports = { deleteDrop }
