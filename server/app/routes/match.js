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
  getMatch,
  getMatches,
  updateMatch,
  deleteMatch
} = require('../controllers/matches')

const {
  validateGetMatch,
  validateUpdateMatch,
  validateDeleteMatch
} = require('../controllers/matches/validators')

/*
 * Match routes
 */

/*
 * Get items route
 */
router.get(
  '/',
  requireAuth,
  roleAuthorization(['admin', 'user']),
  trimRequest.all,
  getMatches
)

/*
 * Get items route
 */
router.get(
  '/search',
  requireAuth,
  roleAuthorization(['admin', 'user']),
  trimRequest.all,
  getMatches
)

/*
 * Get item route
 */
router.get(
  '/:id',
  trimRequest.all,
  validateGetMatch,
  getMatch
)

/*
 * Update item route
 */
router.patch(
  '/:id',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateUpdateMatch,
  updateMatch
)

/*
 * Delete item route
 */
router.delete(
  '/:id',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateDeleteMatch,
  deleteMatch
)

module.exports = router
