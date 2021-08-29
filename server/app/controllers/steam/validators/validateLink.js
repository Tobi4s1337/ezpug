const { validateResult } = require('../../../middleware/utils')
const { check } = require('express-validator')

/**
 * Validates link request
 */
const validateLink = [
  check('steamId')
    .exists()
    .withMessage('MISSING')
    .not()
    .isEmpty()
    .withMessage('IS_EMPTY'),
  (req, res, next) => {
    validateResult(req, res, next)
  }
]

module.exports = { validateLink }
