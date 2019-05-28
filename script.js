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
let distanceBetweenPoints = 20
let mouse = {x: 0, y: 0}

const computeMatrix = (sequence1, sequence2) => {
  let matrix = Array(sequence1.length).fill().map( () => Array(sequence2.length).fill(10000))
  matrix[0][0] = Math.abs(sequence1[0].y - sequence2[0].y)
  for (let i = 1; i < sequence1.length; i++) {
    let cost = Math.abs(sequence1[i].y - sequence2[0].y)
    matrix[i][0] = cost + matrix[i-1][0]
  }
  for (let i = 1; i < sequence2.length; i++) {
    let cost = Math.abs(sequence1[0].y - sequence2[i].y)
    matrix[0][i] = cost + matrix[0][i-1]
  }
  for (let i = 1; i < sequence1.length; i++) {
    for (let j = 1; j < sequence2.length; j++) {
      let cost = Math.abs(sequence1[i].y - sequence2[j].y)
      matrix[i][j] = cost + Math.min( matrix[i-1][j], matrix[i][j-1], matrix[i-1][j-1])
    }
  }
  // console.table(matrix)
  return matrix
}

const getOptimalPath = (matrix, sequence1, sequence2) => {
  let bestPath = [{s1: sequence1.length-1, s2: sequence2.length-1}]
  let i = sequence1.length-1
  let j = sequence2.length-1
  while (i > 0 || j > 0) {
    // let min = Math.min( matrix[i-1][j] || 10000, matrix[i][j-1] || 10000, matrix[i-1][j-1] || 10000)

    let min
    if (i === 0) { // Sur la bordure haute
      min = matrix[i][j-1]
    }
    else if (j === 0) { // Sur la bordure gauche
      min = matrix[i-1][j]
    }
    else { // Classique
      min = Math.min( matrix[i-1][j], matrix[i][j-1], matrix[i-1][j-1])
    }

    if (i === 0) {
      bestPath.push( {s1: i, s2: j-1} )
      j--
    }
    else if (j === 0) {
      bestPath.push( {s1: i-1, s2: j} )
      i--
    }
    else {
      bestPath.push( {s1: i-1, s2: j-1} )
      i--
      j--
    }
  }
  return bestPath.reverse()
}

// let s1 = [1,4,8,3,3,1,4]
// let s2 = [3,7,3,4,0]
// let matrix = computeMatrix(s1, s2)
// getOptimalPath(matrix, s1, s2)

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
      // console.table(matrix)
      let opt = getOptimalPath(matrix, sequence1, sequence2)
      console.log(opt)
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
    ctx.moveTo(sequence1[opt[i].s1].x, sequence1[opt[i].s1].y)
    ctx.lineTo(sequence2[opt[i].s2].x, sequence2[opt[i].s2].y)
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
