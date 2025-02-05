const express = require('express')
const app = express()

//socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const backEndPlayers = {}

io.on('connection', (socket) => {
  console.log('a user connected')
  backEndPlayers[socket.id] = {
    x: 500 * Math.random(),
    y: 500 * Math.random(),
    color: `hsl(${Math.random() * 360}, 50%, 50%)`
  }

  io.emit('updatePlayers', backEndPlayers)

  socket.on('disconnect', () => {
    delete backEndPlayers[socket.id]
    io.emit('updatePlayers', backEndPlayers)
  })
  const speed = 10
  socket.on('keydown', ({ keyCode, sequenceNumber }) => {
    backEndPlayers[socket.id].sequenceNumber = sequenceNumber
    console.log(keyCode)
    switch (keyCode) {
      case 'ArrowUp':
        backEndPlayers[socket.id].y -= speed
        break
      case 'ArrowDown':
        backEndPlayers[socket.id].y += speed
        break
      case 'ArrowLeft':
        backEndPlayers[socket.id].x -= speed
        break
      case 'ArrowRight':
        backEndPlayers[socket.id].x += speed
        break
    }
  })
  console.log(backEndPlayers)
})

setInterval(() => {
  io.emit('updatePlayers', backEndPlayers)
}, 15)
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
