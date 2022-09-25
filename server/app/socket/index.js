const app = require('../../server')
const server = require('http').createServer(app)
const Logger = require('../Logger')
const logger = new Logger('Socket')
server.listen(process.env.SOCKETIO_PORT || 3003)

// require helper functions
const { joinRooms } = require('./helpers')

// set up socket
const io = require('socket.io')(server, {
  path: '/socket',
  cors: {
    origin: '*'
  }
})

/**
 * Includes all sorts of events that are only directed to a specific user (messages, friend requests, etc.)
 * @param {String} userId - id of user
 * @param {String} event - event title
 * @param {Object} data - data related to event
 */
const emitPrivateEvent = (userId, event, data) => {
  io.to(`private-${userId}`).emit(`PRIVATE_${event}`, data)
}

/**
 * @param {String} userId - id of user
 * @param {String} event - event title
 * @param {Object} data - data related to event
 */
const emitSocialEvent = (userId, event, data) => {
  data.userId = userId
  io.to(`social-${userId}`).emit(`SOCIAL_${event}`, data)
}

/**
 * @param {String} event - event title
 * @param {Object} data - data related to event
 */
const emitPublicEvent = ({ event, data }) => {
  io.emit(`PUBLIC_${event}`, data)
}

/**
 * @param {String} matchId - id of match
 * @param {String} event - event title
 * @param {Object} data - data related to event
 */
const emitMatchEvent = (matchId, event, data) => {
  io.to(`match-${matchId}`).emit(`MATCH_${event}`, data)
}

/**
 * @param {String} event - event title
 * @param {Object} data - data related to event
 */
const emitQueueEvent = (event, data) => {
  io.to(`queue`).emit(`QUEUE_${event}`, data)
}

module.exports = {
  emitPrivateEvent,
  emitSocialEvent,
  emitPublicEvent,
  emitMatchEvent,
  emitQueueEvent
}

const MatchHandler = require('../controllers/matchHandler')
const Queue = require('../controllers/queue')

// require events
const { authenticate, disconnect, logout } = require('./events')

// use same socketio version as client
io.on('connection', (socket) => {
  socket.authenticated = false
  // Authenticates the socket by using JWT and getting the user id from it
  // If authentication is successful user gets added to the relevant rooms
  socket.on('authenticate', async (data) => {
    try {
      await authenticate(socket, data)
      await joinRooms(socket)
    } catch (err) {
      logger.error('Issue authenticating user', err)
    }
  })

  socket.on('join-social', (userId) => {
    socket.join(`social-${userId}`)
  })

  socket.on('join-match', (matchId) => {
    socket.join(`match-${matchId}`)
  })

  socket.on('leave-match', (matchId) => {
    socket.leave(`match-${matchId}`)
  })

  socket.on('queue-message', async (msg) => {
    try {
      const queue = await Queue.getInstance()
      queue.onMessage({ userId: socket.userId, event: msg.event })
    } catch (err) {
      logger.error('Issue handling queue-message', err)
    }
  })

  socket.on('match-message', async (msg) => {
    if (!socket.userId || !msg.event || !msg.data) {
      return
    }

    try {
      const matchHandler = await MatchHandler.getInstance()

      if (!msg.data || !msg.data.matchId) {
        return logger.warn('Invalid match socket event')
      }

      if (!matchHandler._matches[msg.data.matchId]) {
        return logger.warn('No match found')
      }

      matchHandler._matches[msg.data.matchId].onMessage({
        userId: socket.userId,
        event: msg.event,
        data: msg.data
      })
    } catch (err) {
      logger.error('Issue forwarding Match event', err)
    }
  })

  socket.on('leave-social', (userId) => {
    socket.leave(`social-${userId}`)
  })

  socket.on('logout', () => {
    logout(socket, io)
  })

  socket.on('disconnect', async () => {
    if (socket.userId) {
      disconnect(socket.userId)

      try {
        const queue = await Queue.getInstance()
        queue.onMessage({ userId: socket.userId, event: 'leave' })
      } catch (err) {
        logger.error('Issue handling queue-message', err)
      }
    }
  })
})
