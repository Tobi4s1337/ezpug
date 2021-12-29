const app = require('../../server')
const server = require('http').createServer(app)
server.listen(process.env.SOCKETIO_PORT || 3003)

// require events
const { authenticate, disconnect, logout } = require('./events')

// require helper functions
const { joinRooms } = require('./helpers')

// set up socket
const io = require('socket.io')(server, {
  path: '/socket',
  cors: {
    origin: '*'
  }
})

// use same socketio version as client
io.on('connection', (socket) => {
  socket.authenticated = false
  // Authenticates the socket by using JWT and getting the user id from it
  // If authentication is successful user gets added to the relevant rooms
  socket.on('authenticate', async (data) => {
    try {
      await authenticate(socket, data)
      await joinRooms(socket)
      console.log('Joined all rooms')
    } catch (err) {
      console.log(err)
    }
  })
  socket.on('logout', () => {
    logout(socket, io)
  })
  socket.on('disconnect', disconnect)
})
console.log('loaded socket')

module.exports = io
