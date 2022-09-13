const app = require('../../server')
const server = require('http').createServer(app)
const MatchHandler = require('../controllers/matchHandler')
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
  console.log(`social-${userId}`)
  io.to(`social-${userId}`).emit(`SOCIAL_${event}`, data)
}

/**
 * @param {String} event - event title
 * @param {Object} data - data related to event
 */
const emitPublicEvent = (event, data) => {
  io.emit(`PUBLIC_${event}`, data)
}

/**
 * @param {String} matchId - id of match
 * @param {String} event - event title
 * @param {Object} data - data related to event
 */
const emitMatchEvent = (matchId, event, data) => {
  io.to(`matchId-${matchId}`).emit(`MATCH_${event}`, data)
}

module.exports = {
  emitPrivateEvent,
  emitSocialEvent,
  emitPublicEvent,
  emitMatchEvent
}

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

      socket.emit('authenticated')
      console.log('Joined all rooms')
    } catch (err) {
      console.log(err)
    }
  })

  socket.on('join-social', (userId) => {
    socket.join(`social-${userId}`)
  })

  socket.on('join-match', (matchId) => {
    socket.join(`match-${matchId}`)
  })

  socket.on('match-message', async (msg) => {
    if (!msg.matchId || !socket.userId || !msg.event || !msg.data) {
      return
    }

    try {
      const matchHandler = await MatchHandler.getInstance()

      if (!matchHandler.matches[msg.matchId]) {
        return console.log('Match not found')
      }

      matchHandler.matches[msg.matchId].onMessage({
        userId: socket.userId,
        event: msg.event,
        data: msg.data
      })
    } catch (err) {
      console.log('Issue forwarding Match event', err)
    }
  })

  socket.on('leave-social', (userId) => {
    socket.leave(`social-${userId}`)
  })

  socket.on('logout', () => {
    logout(socket, io)
  })

  socket.on('disconnect', () => {
    if (socket.userId) {
      disconnect(socket.userId)
    }
  })
})
