var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  'gl_Position = u_MvpMatrix * a_Position;\n' +
  'gl_PointSize = 10.0;\n' +
  'v_Color = a_Color;\n' +
  '}\n'

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec4 v_Color;\n' +
  'void main(){\n' +
  'gl_FragColor = v_Color;\n' +
  '}\n'

var canvas = document.getElementById('webgl')
if (!canvas) {
  console.log('Failed to retrieve the <canvas> element')
}

var gl = getWebGLContext(canvas)
if (!gl) {
  console.log('Failed to get the rendering context for WebGL')
}

function main() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.')
    return
  }

  var n = initVertexBuffers(gl)
  if (n < 0) {
    console.log('Failed to set the positions of the vertices')
    return
  }

  //gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST)

  //   var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
  //   var mvpMatrix = new Matrix4()
  //   mvpMatrix.setPerspective(30, 1, 1, 100)
  //   mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)
  //   gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements)

  //   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  //   gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)

  draw()

  document.addEventListener('keydown', keyPress)
}

let theta = 0
let cameraPosition = { x: 0, y: 3, z: 13 }
let objectPosition = { x: 0, z: 0 }

function draw() {
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
  var mvpMatrix = new Matrix4()
  mvpMatrix.setPerspective(30, 1, 1, 100)
  mvpMatrix.lookAt(
    13 * Math.sin(theta),
    3,
    13 * Math.cos(theta),
    0,
    0,
    0,
    0,
    1,
    0
  )
  mvpMatrix.translate(objectPosition.x, 0, objectPosition.z)

  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0)
}

function keyPress(key) {
  console.log(key)

  switch (event.key) {
    case 'ArrowLeft':
      // Left pressed
      theta -= 0.1
      break
    case 'ArrowRight':
      // Right pressed
      theta += 0.1
      break
    case 'ArrowUp':
      // Up pressed
      break
    case 'ArrowDown':
      // Down pressed
      break
  }

  switch (event.key) {
    case 's':
      // Left pressed
      objectPosition.x -= 0.1
      break
    case 'f':
      // Right pressed
      objectPosition.x += 0.1
      break
    case 'e':
      // Up pressed
      objectPosition.z -= 0.1
      break
    case 'd':
      // Down pressed
      objectPosition.z += 0.1
      break
  }

  draw()
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var verticesColors = new Float32Array([
    // Vertex coordinates and color
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0, // v0 White
    -1.0,
    1.0,
    1.0,
    1.0,
    0.0,
    1.0, // v1 Magenta
    -1.0,
    -1.0,
    1.0,
    1.0,
    0.0,
    0.0, // v2 Red
    1.0,
    -1.0,
    1.0,
    1.0,
    1.0,
    0.0, // v3 Yellow
    1.0,
    -1.0,
    -1.0,
    0.0,
    1.0,
    0.0, // v4 Green
    1.0,
    1.0,
    -1.0,
    0.0,
    1.0,
    1.0, // v5 Cyan
    -1.0,
    1.0,
    -1.0,
    0.0,
    0.0,
    1.0, // v6 Blue
    -1.0,
    -1.0,
    -1.0,
    0.0,
    0.0,
    0.0 // v7 Black
  ])

  var indices = new Uint8Array([
    0,
    1,
    2,
    0,
    2,
    3, // front
    0,
    3,
    4,
    0,
    4,
    5, // right
    0,
    5,
    6,
    0,
    6,
    1, // up
    1,
    6,
    7,
    1,
    7,
    2, // left
    7,
    4,
    3,
    7,
    3,
    2, // down
    4,
    7,
    6,
    4,
    6,
    5 // back
  ])

  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer()
  var indexBuffer = gl.createBuffer()
  if (!vertexColorBuffer || !indexBuffer) {
    return -1
  }

  // Write the vertex coordinates and color to the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW)

  var FSIZE = verticesColors.BYTES_PER_ELEMENT
  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position')
    return -1
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0)
  gl.enableVertexAttribArray(a_Position)
  // Assign the buffer object to a_Color and enable the assignment
  //   var a_Color = gl.getAttribLocation(gl.program, 'a_Color')
  //   if (a_Color < 0) {
  //     console.log('Failed to get the storage location of a_Color')
  //     return -1
  //   }
  //   gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
  //   gl.enableVertexAttribArray(a_Color)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  return indices.length
}