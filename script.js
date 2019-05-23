'use strict';

var ctx, canvas

const initCanvas = () => {
  canvas = document.getElementById('gameCanvas')
  ctx = canvas.getContext('2d')

  let sizeCanvas = document.getElementsByClassName('game')

  ctx.canvas.width = window.innerWidth
  ctx.canvas.height = window.innerHeight

  canvas.addEventListener('mousedown', startDraw)
  canvas.addEventListener('mouseup', stopDraw)
  canvas.addEventListener('mousemove', draw)
  window.setInterval(recordDrawing, intervalRecordTime)

  loop()
}

let drawing = false
let intervalRecordTime = 50
let mouse = {x: 0, y: 0}

const computeMatrix = (sequence1, sequence2) => {
  let matrix = Array(sequence1.length + 1).fill().map( () => Array(sequence2.length + 1).fill(0))
  for (let i = 0; i < sequence1.length; i++) { // Ajout sequence 1
    matrix[sequence1.length - 1 - i][0] = sequence1[i]
  }
  for (let i = 0; i < sequence2.length; i++) { // Ajout sequence 2
    matrix[sequence1.length][i+1] = sequence2[i]
  }
  matrix[sequence1.length-1][1] = Math.abs(matrix[sequence1.length-1][0] - matrix[sequence1.length][1]) // Ajout angle en bas départ
  for (let i = 1; i < sequence1.length; i++) { // Ajout premiere colonne
    matrix[sequence1.length-1-i][1] = Math.abs(matrix[sequence1.length-1-i][0] - matrix[sequence1.length][1]) + matrix[sequence1.length-i][1]
  }
  for (let i = 1; i < sequence2.length; i++) { // Ajout derniere ligne
    matrix[sequence1.length-1][i+1] = Math.abs(matrix[sequence1.length-1][0] - matrix[sequence1.length][1+i]) + matrix[sequence1.length-1][i]
  }

  // Full remplissage :
  for (let i = 1; i < sequence2.length; i++) {
    for (let j = 1; j < sequence1.length; j++) {
      let abs = Math.abs(matrix[sequence1.length-1-j][0] - matrix[sequence1.length][1+i])
      matrix[sequence1.length-1-j][i+1] = abs + Math.min( matrix[sequence1.length-1-j][i], matrix[sequence1.length-j][i], matrix[sequence1.length-j][i+1] )
    }
  }
  console.table(matrix)

  return matrix
}

const getOptimalPath = matrix => {
  let y = 0 // matrix.length - 1 // vertical
  let x = matrix[0].length - 1 // horizontal
  let sequence = []

  // while (y != matrix.length - 1 && x != 0) {
  //   sequence.push({x: x, y: y})
  //   (if on a choisi dia go) {
  //     y++
  //     x--
  //   }
  //   if (gauche ) {
  //     x--
  //   }
  //   if (bas){
  //     y--
  //   }
  // }
  console.log(sequence)
}

let matrix = computeMatrix([3,7,3,4,0], [1,4,8,3,3,1,4])
getOptimalPath(matrix)

let s1 = []
const startDraw = event => drawing = true
const stopDraw = event => drawing = false
const draw = event => {
  mouse = {x: event.clientX, y: event.clientY}
}
const recordDrawing = () => {
  if (drawing){
    console.log(mouse)
    s1.push({x: mouse.x, y: mouse.y})
  }
}

const click = event => console.log(event)
const loop = () => {

  dessin()
  requestAnimationFrame(loop);
}

const dessin = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Dessin limites bases
  ctx.strokeStyle = "#000000"
  if (s1.length > 0) {
    ctx.beginPath()
    ctx.moveTo(s1[0].x, s1[0].y)
    s1.forEach( point => ctx.lineTo(point.x, point.y))
    ctx.stroke()
  }

}

window.addEventListener('load', initCanvas)
