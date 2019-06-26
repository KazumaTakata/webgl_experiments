let VSHADER_SOURCE = null
let FSHADER_SOURCE = null

let x_length = 50
let y_length = 50

let sectorCount = 36
let stackCount = 18
let radius = 1
let sectorStep = (2 * Math.PI) / sectorCount
let stackStep = Math.PI / stackCount

let vertices = createVertexData(x_length, y_length)
let colorsData = createColorData(x_length, y_length)
let cubeVertices = createCubeVertexData()
let cubeIndices = createCubeIndexData()
let cubeColors = createCubeColorData()

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

let cubeHeight = 0.5

function start() {
  let program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE)
  useProgram(gl, program)
  gl.enable(gl.DEPTH_TEST)

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

  let MMatrixCube = new Matrix4()
  MMatrixCube.translate(0, cubeHeight, 0)
  let cube = new RenderObject(
    program,
    {
      a_Position: cubeVertices,
      index: cubeIndices,
      a_Color: cubeColors
    },
    MMatrixCube
  )

  var vpMatrix = createVP()
  setVpMatrix(vpMatrix.elements, program)

  var tick = function() {
    draw(floor, cube)
    requestAnimationFrame(tick)
  }
  tick()
}

function draw(floor, cube) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  floor.bindBuffer('a_Position', 3, 3, 0)
  floor.bindBuffer('a_Color', 1, 1, 0)
  drawElement(vertices.length / 3, floor)

  let MMatrixCube = new Matrix4()
  MMatrixCube.translate(0, Math.sin(cubeHeight) + 1.5, 0)
  cube.MMatrix = MMatrixCube

  cube.bindBuffer('a_Position', 3, 3, 0)
  cube.bindBuffer('a_Color', 1, 1, 0)
  cube.bindIndexBuffer()
  drawElementWithIndex(cubeIndices.length, cube)

  cubeHeight += 0.05
}

function drawElement(n, object) {
  object.setUniformMatrix4fv('u_mMatrix', object.MMatrix.elements)
  gl.drawArrays(gl.TRIANGLES, 0, n)
}

function drawElementWithIndex(n, object) {
  object.setUniformMatrix4fv('u_mMatrix', object.MMatrix.elements)
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0)
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
    4,
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

function createCubeColorData() {
  let colors = new Float32Array(cubeIndices.length)
  for (let i = 0; i < cubeIndices.length; i++) {
    colors[i] = 0
  }
  return colors
}

function createCubeVertexData() {
  let verticesArray = new Array()
  for (let i = 0; i <= stackCount; i++) {
    let stackAngle = Math.PI / 2 - i * stackStep
    let xy = radius * Math.cos(stackAngle) // r * cos(u)
    let z = radius * Math.sin(stackAngle) // r * sin(u)

    // add (sectorCount+1) vertices per stack
    // the first and last vertices have same position and normal, but different tex coords
    for (let j = 0; j <= sectorCount; j++) {
      let sectorAngle = j * sectorStep // starting from 0 to 2pi

      // vertex position (x, y, z)
      let x = xy * Math.cos(sectorAngle) // r * cos(u) * cos(v)
      let y = xy * Math.sin(sectorAngle) // r * cos(u) * sin(v)
      verticesArray.push(x)
      verticesArray.push(y)
      verticesArray.push(z)
    }
  }

  let vertices = new Float32Array(verticesArray.length)

  for (let i = 0; i < verticesArray.length; i++) {
    vertices[i] = verticesArray[i]
  }

  return vertices
}

function createCubeIndexData() {
  let indicesArray = new Array()
  for (let i = 0; i < stackCount; ++i) {
    let k1 = i * (sectorCount + 1) // beginning of current stack
    let k2 = k1 + sectorCount + 1 // beginning of next stack

    for (let j = 0; j < sectorCount; ++j, ++k1, ++k2) {
      // 2 triangles per sector excluding first and last stacks
      // k1 => k2 => k1+1
      if (i != 0) {
        indicesArray.push(k1)
        indicesArray.push(k2)
        indicesArray.push(k1 + 1)
      }

      // k1+1 => k2 => k2+1
      if (i != stackCount - 1) {
        indicesArray.push(k1 + 1)
        indicesArray.push(k2)
        indicesArray.push(k2 + 1)
      }
    }
  }

  let indices = new Uint16Array(indicesArray.length)

  for (let i = 0; i < indicesArray.length; i++) {
    indices[i] = indicesArray[i]
  }

  return indices
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
