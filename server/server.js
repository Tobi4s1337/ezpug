process.title = 'ezpug-server'
process.env.DEBUG = process.env.DEBUG || '*INFO* *WARN* *ERROR*'

require('dotenv-safe').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const compression = require('compression')
const helmet = require('helmet')
const cors = require('cors')
const passport = require('passport')
const app = express()
const i18n = require('i18n')
const initMongo = require('./config/mongo')
const path = require('path')
const { createDefaultMapPool } = require('./createDefaultMapPool')
const { setAdmins } = require('./setAdmins')


// Setup express server port from ENV, default: 3001
app.set('port', process.env.PORT || 3001)

// Setup socket
require('./app/socket/index')

// Clean up user status (set all to offline)
require('./app/controllers/users/helpers/resetStatus')()

// Enable only in development HTTP request logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// for parsing json
app.use(
  bodyParser.json({
    limit: '20mb'
  })
)
// for parsing application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: '20mb',
    extended: true
  })
)

// i18n
i18n.configure({
  locales: ['en', 'de'],
  directory: `${__dirname}/locales`,
  defaultLocale: 'en',
  objectNotation: true
})
app.use(i18n.init)

// Init all other stuff
app.use(cors())
app.use(passport.initialize())
app.use(compression())
app.use(helmet())
app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs')
app.use(require('./app/routes'))
app.listen(app.get('port'))

// Init MongoDB
initMongo()
createDefaultMapPool()
setAdmins()

module.exports = app
