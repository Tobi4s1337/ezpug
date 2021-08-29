const { validateResult } = require('../../../middleware/utils')
const { check } = require('express-validator')

/**
 * Validates login request
 */
const validateLogin = [
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

module.exports = { validateLogin }
