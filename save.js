'use strict';

var ctx, canvas

const initCanvas = () => {
  canvas = document.getElementById('gameCanvas')
  ctx = canvas.getContext('2d')
  ctx.canvas.width = window.innerWidth
  ctx.canvas.height = window.innerHeight

  canvas.addEventListener('mousedown', startDraw)
  canvas.addEventListener('mouseup', stopDraw)
  canvas.addEventListener('mousemove', draw)
}

let drawing = false
let distanceBetweenPoints = 10
let mouse = {x: 0, y: 0}

const computeMatrix = (sequence1, sequence2) => {
  console.log(sequence1.length)
  console.log(sequence2.length)
  let matrix = Array(sequence1.length + 1).fill().map( () => Array(sequence2.length + 1).fill(0))
  for (let i = 0; i < sequence1.length; i++) { // Ajout sequence 1
    matrix[sequence1.length - 1 - i][0] = sequence1[i].y
  }
  for (let i = 0; i < sequence2.length; i++) { // Ajout sequence 2
    matrix[sequence1.length][i+1] = sequence2[i].y
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
  // console.table(matrix)

  return matrix
}

const getOptimalPath = matrix => {
  let y = 0 // matrix.length - 1 // vertical
  let x = matrix[0].length - 1 // horizontal
  // let sequence = [{x: matrix[matrix.length-1][x], y: matrix[0][0]}] // Initialisation en haut a droite matrice
  let sequence = [{x: x, y: matrix.length-1 - y}] // Initialisation en haut a droite matrice

  while (y != matrix.length - 1 && x != 0) {
    // console.log("oui")
    let min
    if ( x-1 === 0) { // Sur la bordure à gauche
      min = matrix[y+1][x]
    }
    else if ( y+2 === matrix.length ) { // Sur la bordure en bas
      min = matrix[y][x-1]
    }
    else { // Classique
      min = Math.min(matrix[y][x-1], matrix[y+1][x], matrix[y+1][x-1])
    }

    // console.log(min)
    if (matrix[y][x-1] === min) {
      // sequence.push({x: matrix[matrix.length-1][x-1], y: matrix[y][0]})
      sequence.push({x: x-1, y: matrix.length-1 - y})
      x--
    }
    else if (matrix[y+1][x] === min) {
      // sequence.push({x: matrix[matrix.length-1][x], y: matrix[y+1][0]})
      sequence.push({x: x, y: matrix.length-1 - y-1})

      y++
    }
    else {
      // sequence.push({x: matrix[matrix.length-1][x-1], y: matrix[y+1][0]})
      sequence.push({x: x-1, y: matrix.length-1 - y-1})
      x--
      y++
    }
  }

  sequence[sequence.length-1] = {x: matrix[matrix.length-1][1], y: matrix[matrix.length-2][0]} // gestion fin dans l'angle
  sequence[sequence.length-1] = {x: 1, y: 1} // gestion fin dans l'angle
  console.log(sequence)
  return sequence.reverse()
}

let sequence1 = []
let sequence2 = []
let drawingS1 = true
let drawingS2 = false

const startDraw = event => drawing = true
const stopDraw = event => drawing = false
let distanceSinceLastPoint = 0
const draw = event => {
  distanceSinceLastPoint += Math.abs(event.movementX) + Math.abs(event.movementY)
  if (distanceSinceLastPoint > distanceBetweenPoints && drawing) {
    mouse = {x: event.clientX, y: event.clientY}
    recordDrawing()
    distanceSinceLastPoint = 0
  }

}

const recordDrawing = () => {
  if (drawing){
    if (drawingS1) sequence1.push({x: mouse.x, y: mouse.y})
    else if (drawingS2) sequence2.push({x: mouse.x, y: mouse.y})
    drawSequences()
    if (sequence1.length > 0 && sequence2.length > 0) {
      let matrix = computeMatrix(sequence1, sequence2)
      let opt = getOptimalPath(matrix)
      drawOpt(opt, sequence1, sequence2)
    }
  }
}

const drawSequences = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = "#000000"
  if (sequence1.length > 0) {
    ctx.beginPath()
    ctx.moveTo(sequence1[0].x, sequence1[0].y)
    sequence1.forEach( point => ctx.lineTo(point.x, point.y))
    ctx.stroke()
  }
  ctx.strokeStyle = "#ff0000"
  if (sequence2.length > 0) {
    ctx.beginPath()
    ctx.moveTo(sequence2[0].x, sequence2[0].y)
    sequence2.forEach( point => ctx.lineTo(point.x, point.y))
    ctx.stroke()
  }
}

const drawOpt = (opt, sequence1, sequence2) => {
  ctx.strokeStyle = "#00ff00"
  for (let i = 0; i < opt.length; i++) {
    ctx.beginPath()
    ctx.moveTo(sequence2[opt[i].x-1].x, sequence2[opt[i].x-1].y) // s1
    ctx.lineTo(sequence1[opt[i].y-1].x, sequence1[opt[i].y-1].y)
    ctx.stroke()
  }
}

document.addEventListener("keypress", key => {
  if (key.key === "a") {
    drawingS1 = true
    drawingS2 = false
  }
  if (key.key === "z") {
    drawingS1 = false
    drawingS2 = true
  }
})
window.addEventListener('load', initCanvas)
