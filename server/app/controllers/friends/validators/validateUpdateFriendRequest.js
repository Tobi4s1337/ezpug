const { validateResult } = require('../../../middleware/utils')
const { check } = require('express-validator')

/**
 * Validates create new item request
 */
const validateUpdateFriendRequest = [
  check('accepted')
    .exists()
    .withMessage('MISSING')
    .isBoolean()
    .withMessage('MUST_BE_BOOLEAN'),
  (req, res, next) => {
    validateResult(req, res, next)
  }
]

module.exports = { validateUpdateFriendRequest }
