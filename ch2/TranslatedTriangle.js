/// <reference path="webgl.d.ts" />

var VSHADER = `
    attribute vec4 a_Position;
    uniform vec4 u_Translation;
    void main() {
        gl_Position = a_Position + u_Translation;
    }
`;

var FSHADER = `
 void main() {
        gl_FragColor = vec4(1.0, 0, 0.0, 1.0);
    }
`;

var Tx = 0.5;
var Ty = 0.5;
var Tz = 0;

function main() {
  var canvas = document.getElementById("webgl");

  var gl = getWebGLContext(canvas);

  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  if (!initShaders(gl, VSHADER, FSHADER)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log("Failed to set the positons of the vertices");
    return;
  }

  var u_Translation = gl.getUniformLocation(gl.program, "u_Translation");
  gl.uniform4f(u_Translation, Tx, Ty, Tz, 0.0);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);

  var n = 3;

  var vertexBuffer = gl.createBuffer();

  if (!vertexBuffer) {
    console.log("failed to create the buffer object");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, "a_Position");

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_Position);

  return n;
}
