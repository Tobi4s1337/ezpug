const express = require('express')
const router = express.Router()
require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

const { roleAuthorization } = require('../controllers/auth')

const {
  getDrops,
  createDrops,
  deleteDrop,
  updateDrop,
  configureHandler,
  getHandler
} = require('../controllers/drops')

/*
 * Match routes
 */

/*
 * Get items route
 */
router.get(
  '/',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  getDrops
)

router.post(
  '/',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  createDrops
)

router.patch(
  ':/id',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  updateDrop
)

/*
 * Delete item route
 */
router.delete(
  '/:id',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  deleteDrop
)

router.get(
  '/handler',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  getHandler
)

router.post(
  '/handler',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  configureHandler
)
module.exports = router
