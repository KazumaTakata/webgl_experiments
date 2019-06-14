var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '   gl_Position = a_Position;\n' +
  '   v_TexCoord = a_TexCoord;\n' +
  '}\n'

var FSHADER_SOURCE = `
    #ifdef GL_ES
        precision mediump float;
    #endif
    uniform sampler2D u_Sampler;
  
    uniform vec2 timevar;
    uniform float time;
    varying vec2 v_TexCoord;
    float random2d (vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
    }
    float random (float x){
        return fract(sin(x)*10.0);
    }   
    void main(){
   
    vec2 st = gl_FragCoord.xy/timevar;
    vec2 ipos = floor(st);
    float rnd = random2d( ipos );
    if (random(time) > 0.5){   
        gl_FragColor = texture2D(u_Sampler, vec2( v_TexCoord.x + (rnd - 0.5) * 0.01  , v_TexCoord.y  + (rnd - 0.5) * 0.01 )  ) + 0.2 * vec4( vec3(rnd) , 1) ;
    } else {
        gl_FragColor = vec4( texture2D(u_Sampler, v_TexCoord).x, texture2D(u_Sampler, vec2(v_TexCoord.x - 0.03,v_TexCoord.y - 0.02)).y, texture2D(u_Sampler, vec2(v_TexCoord.x + 0.03,v_TexCoord.y + 0.02) ).z, 1);
    }
    
    

    
    
    }
    `

function main() {
  var canvas = document.getElementById('webgl')
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element')
    return
  }

  var gl = getWebGLContext(canvas)
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL')
    return
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.')
    return
  }

  var n = initVertexBuffers(gl)
  if (n < 0) {
    console.log('Failed to set the positions of the vertices')
    return
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  // Set texture
  if (!initTextures(gl, n)) {
    console.log('Failed to intialize the texture.')
    return
  }

  var tick = function() {
    // Start drawing
    draw(gl, n)
    requestAnimationFrame(tick, canvas)
  }
  tick()
}

let curtime = 0

function draw(gl, n) {
  var timevar = gl.getUniformLocation(gl.program, 'timevar')

  gl.uniform2fv(timevar, [
    Math.sin(Math.random()) * 100,
    Math.sin(Math.random()) * 10
  ])

  var time = gl.getUniformLocation(gl.program, 'time')
  gl.uniform1f(time, curtime)
  curtime += 0.003

  gl.clear(gl.COLOR_BUFFER_BIT) // Clear buffers
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
}

function initVertexBuffers(gl) {
  var verticesTexCoords = new Float32Array([
    -1,
    1,
    0,
    1,
    -1,
    -1,
    0,
    0,
    1,
    1,
    1.0,
    1.0,
    1,
    -1,
    1.0,
    0.0
  ])
  var n = 4

  var vertexTexCoordBuffer = gl.createBuffer()
  if (!vertexTexCoordBuffer) {
    console.log('Failed to create thie buffer object')
    return -1
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer)

  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW)

  var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position')
    return -1
  }

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0)

  gl.enableVertexAttribArray(a_Position)

  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord')
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord')
    return -1
  }

  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2)
  gl.enableVertexAttribArray(a_TexCoord)

  return n
}

function initTextures(gl, n) {
  var texture = gl.createTexture()
  if (!texture) {
    console.log('Failed to create the texture object')
    return false
  }

  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')

  var image = new Image()
  if (!image) {
    console.log('Failed to create the image object')
    return false
  }

  image.onload = function() {
    loadTexture(gl, n, texture, u_Sampler, image)
  }

  image.src = '../img/isaac-castillejos-1085401-unsplash.jpg'

  return true
}

function loadTexture(gl, n, texture, u_Sampler, image) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  gl.uniform1i(u_Sampler, 0)
  gl.activeTexture(gl.TEXTURE0)

  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)

  // gl.clear(gl.COLOR_BUFFER_BIT);

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}
