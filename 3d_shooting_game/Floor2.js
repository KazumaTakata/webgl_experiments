let VSHADER_SOURCE = null
let FSHADER_SOURCE = null

let x_length = 50
let y_length = 50

let vertices = createVertexData(x_length, y_length)
let colorsData = createColorData(x_length, y_length)

let theta = 0
let cameraPosition = { x: 0, y: 3, z: 13 }
let objectPosition = { x: 0, z: 0 }

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

function start() {
  let program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE)
  useProgram(gl, program)
  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  let MMatrix = new Matrix4()
  MMatrix.translate(-25, 0, -25)

  let floor = new RenderObject(
    program,
    {
      a_Position: vertices,
      a_Color: colorsData
    },
    MMatrix
  )

  floor.bindBuffer('a_Position', 3, 3, 0)
  floor.bindBuffer('a_Color', 1, 1, 0)

  let n = vertices.length / 3
  drawElement(n, floor)
}

function drawElement(n, object) {
  let c_time = Date.now()
  var vpMatrix = createVP()
  //   mvpMatrix.translate(objectPosition.x, 0, objectPosition.z)

  object.setUniform1f('u_time', c_time)
  setVpMatrix(vpMatrix.elements, object.program)
  //   object.setUniformMatrix4fv('u_vpMatrix', mvpMatrix.elements)
  object.setUniformMatrix4fv('u_mMatrix', object.MMatrix.elements)
  gl.drawArrays(gl.TRIANGLES, 0, n)
}

function setVpMatrix(val, program) {
  var u_val = gl.getUniformLocation(program, 'u_vpMatrix')
  gl.uniformMatrix4fv(u_val, false, val)
}

function createVP() {
  var vpMatrix = new Matrix4()

  vpMatrix.setPerspective(30, 1, 1, 100)
  vpMatrix.lookAt(
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
  return vpMatrix
}

// create data

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
