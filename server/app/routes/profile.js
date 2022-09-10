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
  getProfile,
  updateProfile,
  changePassword,
  getTeamSpeakUsers,
  linkTeamSpeakRequest,
  redeemTeamSpeakCode,
  unlinkTeamSpeak
} = require('../controllers/profile')

const {
  validateUpdateProfile,
  validateChangePassword
} = require('../controllers/profile/validators')

/*
 * Profile routes
 */

/*
 * Get profile route
 */
router.get(
  '/',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  getProfile
)

/*
 * Update profile route
 */
router.patch(
  '/',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validateUpdateProfile,
  updateProfile
)

/*
 * Change password route
 */
router.post(
  '/changePassword',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validateChangePassword,
  changePassword
)

/*
 * Get items route
 */
router.get(
  '/teamSpeakUsers',
  requireAuth,
  roleAuthorization(['admin', 'user']),
  trimRequest.all,
  getTeamSpeakUsers
)

router.post(
  '/unlinkTeamSpeak',
  requireAuth,
  roleAuthorization(['admin', 'user']),
  trimRequest.all,
  unlinkTeamSpeak
)

/*
 * Get items route
 */
router.post(
  '/linkTeamSpeak',
  requireAuth,
  roleAuthorization(['admin', 'user']),
  trimRequest.all,
  linkTeamSpeakRequest
)

/*
 * Get items route
 */
router.post(
  '/teamSpeakCode',
  requireAuth,
  roleAuthorization(['admin', 'user']),
  trimRequest.all,
  redeemTeamSpeakCode
)

module.exports = router
