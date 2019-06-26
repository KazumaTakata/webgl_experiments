var VSHADER_SOURCE = null
var FSHADER_SOURCE = null

function main() {
  canvas = document.getElementById('webgl')
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element')
  }

  gl = getWebGLContext(canvas)
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL')
  }

  readShaderFile(gl, 'shader/f_shader.glsl', gl.FRAGMENT_SHADER)
  readShaderFile(gl, 'shader/v_shader.glsl', gl.VERTEX_SHADER)
}

function RenderObject(program, data) {
  this.program = program
  this.data = data
  this.buffer = undefined
}

RenderObject.prototype.bindBuffer = function(
  gl,
  attribute_name,
  data_size,
  step_size,
  offset
) {
  if (this.buffer == undefined) {
    this.buffer = gl.createBuffer()
  }

  // Write the vertex coordinates and color to the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
  gl.bufferData(gl.ARRAY_BUFFER, this.data[attribute_name], gl.STATIC_DRAW)

  var FSIZE = this.data[attribute_name].BYTES_PER_ELEMENT
  // Assign the buffer object to a_Position and enable the assignment
  var attribute = gl.getAttribLocation(this.program, attribute_name)
  if (attribute < 0) {
    console.log('Failed to get the storage location of attribute')
    return -1
  }
  gl.vertexAttribPointer(
    attribute,
    data_size,
    gl.FLOAT,
    false,
    FSIZE * step_size,
    offset
  )
  gl.enableVertexAttribArray(attribute)
}

RenderObject.prototype.setUniform1f = function(u_name, val) {
  var u_val = gl.getUniformLocation(this.program, u_name)
  gl.uniform1f(u_val, val)
}

RenderObject.prototype.setUniformMatrix4fv = function(u_name, val) {
  var u_val = gl.getUniformLocation(this.program, u_name)
  gl.uniformMatrix4fv(u_val, false, val)
}

function start() {
  let program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE)
  useProgram(gl, program)

  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  var n = initVertexBuffers(gl)
  drawElement({ x: -25, z: -25 }, n)
}

let theta = 0
let cameraPosition = { x: 0, y: 3, z: 13 }
let objectPosition = { x: 0, z: 0 }

function drawElement(objectPosition, n) {
  let c_time = Date.now()
  var mvpMatrix = new Matrix4()
  mvpMatrix.setPerspective(30, 1, 1, 100)
  mvpMatrix.lookAt(
    14 * Math.sin(theta),
    3,
    14 * Math.cos(theta),
    0,
    0,
    0,
    0,
    1,
    0
  )
  mvpMatrix.translate(objectPosition.x, 0, objectPosition.z)

  setUniform1f(gl, 'u_time', c_time)
  setUniformMatrix4fv(gl, 'u_MvpMatrix', mvpMatrix.elements)

  gl.drawArrays(gl.TRIANGLES, 0, n)
}

function initVertexBuffers(gl) {
  let x_length = 50
  let y_length = 50

  let vertices = createVertexData(x_length, y_length)
  var colorsData = createColorData(x_length, y_length)

  bindBuffer(gl, vertices, 'a_Position', 3, 3, 0)
  bindBuffer(gl, colorsData, 'a_Color', 1, 1, 0)

  return vertices.length / 3
}

function createColorData(x_length, y_length) {
  var colorsData = new Float32Array(6 * x_length * y_length)
  for (let w = 0; w < y_length; w++) {
    for (let j = 0; j < x_length; j++) {
      let color = 1 - 0.5 * Math.random()
      for (let i = 0; i < 6; i++) {
        colorsData[i + 6 * j + 6 * x_length * w] = color
      }
    }
  }
  return colorsData
}

function createVertexData(x_length, y_length) {
  var verticesData = new Float32Array([
    0.0,
    0.0,
    0.0,

    1.0,
    0.0,
    0.0,

    0.0,
    0.0,
    1.0,

    1.0,
    0.0,
    0.0,

    0.0,
    0.0,
    1.0,

    1.0,
    0.0,
    1.0
  ])

  let vertices = new Float32Array(3 * 6 * x_length * y_length)
  for (let w = 0; w < y_length; w++) {
    for (let j = 0; j < x_length; j++) {
      for (let i = 0; i < 18; i++) {
        if (i % 3 == 0) {
          vertices[i + j * 18 + w * x_length * 18] = verticesData[i] + j
        } else if (i % 3 == 2) {
          vertices[i + j * 18 + w * x_length * 18] = verticesData[i] + w
        } else {
          vertices[i + j * 18 + w * x_length * 18] = verticesData[i]
        }
      }
    }
  }

  return vertices
}
