function setUniform1f(gl, u_name, val) {
  var u_val = gl.getUniformLocation(gl.program, u_name)
  gl.uniform1f(u_val, val)
}

function setUniformMatrix4fv(gl, u_name, val) {
  var u_val = gl.getUniformLocation(gl.program, u_name)
  gl.uniformMatrix4fv(u_val, false, val)
}

function bindBuffer(gl, data, attributeName, data_size, step_size, offset) {
  var Buffer = gl.createBuffer()

  // Write the vertex coordinates and color to the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, Buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

  var FSIZE = data.BYTES_PER_ELEMENT
  // Assign the buffer object to a_Position and enable the assignment
  var attribute = gl.getAttribLocation(gl.program, attributeName)
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

function readShaderFile(gl, fileName, shader) {
  var request = new XMLHttpRequest()

  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status !== 404) {
      onReadShader(gl, request.responseText, shader)
    }
  }
  request.open('GET', fileName, true) // Create a request to acquire the file
  request.send() // Send the request
}

// The shader is loaded from file
function onReadShader(gl, fileString, shader) {
  if (shader == gl.VERTEX_SHADER) {
    // Vertex shader
    VSHADER_SOURCE = fileString
  } else if (shader == gl.FRAGMENT_SHADER) {
    // Fragment shader
    FSHADER_SOURCE = fileString
  }
  // When both are available, call start().
  if (VSHADER_SOURCE && FSHADER_SOURCE) start(gl)
}

function RenderObject(program, data, MMatrix) {
  this.program = program
  this.data = data
  this.MMatrix = MMatrix
  this.buffer = {}
}

RenderObject.prototype.bindIndexBuffer = function() {
  if (this.buffer['index'] == undefined) {
    this.buffer['index'] = gl.createBuffer()
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer['index'])
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.data['index'], gl.STATIC_DRAW)
}

RenderObject.prototype.bindBuffer = function(
  attribute_name,
  data_size,
  step_size,
  offset
) {
  if (this.buffer[attribute_name] == undefined) {
    this.buffer[attribute_name] = gl.createBuffer()
  }

  // Write the vertex coordinates and color to the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer[attribute_name])
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
