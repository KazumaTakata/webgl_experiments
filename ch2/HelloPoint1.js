var VSHADER = `
    void main () {
        gl_Position = vec4(0.0,0.0,0.0,1.0);
        gl_PointSize = 10.0;

    }
`;

var FSHADER = `
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;

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
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.POINTS, 0, 1);
}
