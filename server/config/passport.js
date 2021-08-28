const passport = require('passport')
const User = require('../app/models/user')
const auth = require('../app/middleware/auth')
const JwtStrategy = require('passport-jwt').Strategy
const SteamStrategy = require('passport-steam').Strategy

/**
 * Extracts token from: header, body or query
 * @param {Object} req - request object
 * @returns {string} token - decrypted token
 */
const jwtExtractor = (req) => {
  let token = null
  if (req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer ', '').trim()
  } else if (req.body.token) {
    token = req.body.token.trim()
  } else if (req.query.token) {
    token = req.query.token.trim()
  }
  if (token) {
    // Decrypts token
    token = auth.decrypt(token)
  }
  return token
}

/**
 * Options object for jwt middlware
 */
const jwtOptions = {
  jwtFromRequest: jwtExtractor,
  secretOrKey: process.env.JWT_SECRET
}

/**
 * Login with JWT middleware
 */
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  User.findById(payload.data._id, (err, user) => {
    if (err) {
      return done(err, false)
    }
    return !user ? done(null, false) : done(null, user)
  })
})

/**
 * Options object for steam middleware
 */
const steamOptions = {
  returnURL: process.env.BASE_URL + '/steam/return',
  realm: process.env.FRONTEND_URL,
  apiKey: process.env.STEAM_API_KEY
}

/**
 * Login with Steam middleware
 */
const steamLogin = new SteamStrategy(
  steamOptions,
  (identifier, profile, done) => {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      done(null, profile)
    })
  }
)

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})

passport.use(jwtLogin)
passport.use(steamLogin)
