const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()
const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = innerWidth * devicePixelRatio
canvas.height = innerHeight * devicePixelRatio

const x = canvas.width / 2
const y = canvas.height / 2

const frontEndPlayers = {}
socket.on('updatePlayers', (backEndPlayers) => {
  for (const id in backEndPlayers) {
    const backEndPlayer = backEndPlayers[id]
    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: 10,
        color: backEndPlayer.color
      })
    } else {
      //player exists, update it
      frontEndPlayers[id].x = backEndPlayer.x
      frontEndPlayers[id].y = backEndPlayer.y

      const lastBackendInputIndex = playerInputs.findIndex((input) => {
        return backEndPlayer.sequenceNumber === input.sequenceNumber
      })

      if (lastBackendInputIndex > -1) {
        playerInputs.splice(0, lastBackendInputIndex + 1)
        playerInputs.forEach((input) => {
          frontEndPlayers[id].x += input.dx
          frontEndPlayers[id].y += input.dy
        })
      } else {
        //for other players

        gsap.to(frontEndPlayers[id], {
          x: backEndPlayer.x,
          y: backEndPlayer.y,
          duration: 0.015,
          ease: 'linear'
        })
      }
    }
    for (const id in frontEndPlayers) {
      if (!backEndPlayers[id]) {
        delete frontEndPlayers[id]
      }
    }
  }
})

let animationId

function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for (const id in frontEndPlayers) {
    const frontEndPlayer = frontEndPlayers[id]
    frontEndPlayer.draw()
  }
}

animate()
const keys = {
  arrowUp: {
    pressed: false
  },
  arrowDown: {
    pressed: false
  },
  arrowLeft: {
    pressed: false
  },
  arrowRight: {
    pressed: false
  }
}

const speed = 10
playerInputs = []
let sequenceNumber = 0
setInterval(() => {
  if (keys.arrowUp.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: -speed })
    frontEndPlayers[socket.id].y -= speed
    socket.emit('keydown', { keyCode: 'ArrowUp', sequenceNumber })
  }
  if (keys.arrowDown.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: speed })
    frontEndPlayers[socket.id].y += speed
    socket.emit('keydown', {
      keyCode: 'ArrowDown',
      sequenceNumber
    })
  }
  if (keys.arrowLeft.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: -speed, dy: 0 })
    frontEndPlayers[socket.id].x -= speed
    socket.emit('keydown', {
      keyCode: 'ArrowLeft',
      sequenceNumber
    })
  }
  if (keys.arrowRight.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: speed, dy: 0 })
    frontEndPlayers[socket.id].x += speed
    socket.emit('keydown', {
      keyCode: 'ArrowRight',
      sequenceNumber
    })
  }
}, 15)

window.addEventListener('keydown', (event) => {
  if (!frontEndPlayers[socket.id]) {
    return
  }
  switch (event.code) {
    case 'ArrowUp':
      keys.arrowUp.pressed = true
      break
    case 'ArrowDown':
      keys.arrowDown.pressed = true
      break
    case 'ArrowLeft':
      keys.arrowLeft.pressed = true
      break
    case 'ArrowRight':
      keys.arrowRight.pressed = true
      break
  }
})

window.addEventListener('keyup', (event) => {
  if (!frontEndPlayers[socket.id]) {
    return
  }
  switch (event.code) {
    case 'ArrowUp':
      keys.arrowUp.pressed = false
      break
    case 'ArrowDown':
      keys.arrowDown.pressed = false
      break
    case 'ArrowLeft':
      keys.arrowLeft.pressed = false
      break
    case 'ArrowRight':
      keys.arrowRight.pressed = false
      break
  }
})
