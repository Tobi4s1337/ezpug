const express = require('express')
const router = express.Router()
require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

const { sendEncryptedSteamid, link, login } = require('../controllers/steam')

const {
  validateLink,
  validateLogin
} = require('../controllers/steam/validators')

router.get(
  '/',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    res.sendStatus(200)
  }
)

// GET /steam/return
router.get(
  '/return',
  // Issue #37 - Workaround for Express router module stripping the full url, causing assertion to fail
  (req, res, next) => {
    req.url = req.originalUrl
    next()
  },
  passport.authenticate('steam', { failureRedirect: '/' }),
  sendEncryptedSteamid
)

router.post('/', trimRequest.all, requireAuth, validateLink, link)

/*
 * Login route
 */
router.post('/login', trimRequest.all, validateLogin, login)

module.exports = router
