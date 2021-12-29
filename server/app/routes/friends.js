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
  getFriendRequests,
  createFriendRequest,
  updateFriendRequest,
  removeFriendRequest,
  getFriends,
  removeFriend
} = require('../controllers/friends')

const {
  validateCreateFriendRequest,
  validateUpdateFriendRequest
} = require('../controllers/friends/validators')

/*
 * Friend-request routes
 */

/*
 * Get friend requests route
 */
router.get(
  '/requests',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  getFriendRequests
)

/*
 * Get friends route
 */
router.get(
  '/',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  getFriends
)

/*
 * Create friend request route
 */
router.post(
  '/',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validateCreateFriendRequest,
  createFriendRequest
)

/*
 * Update friend request route
 */
router.patch(
  '/:friendRequestId',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validateUpdateFriendRequest,
  updateFriendRequest
)

/*
 * Delete existing friend from list
 */
router.delete(
  '/existing/:friendUserId',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  removeFriend
)

/*
 * Delete friend request route
 */
router.delete(
  '/:friendRequestId',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  removeFriendRequest
)

module.exports = router
