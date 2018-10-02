var VSHADER = `
    attribute vec4 a_Position;
    void main () {
        gl_Position = a_Position;
        gl_PointSize = 10.0;

    }
`;

var FSHADER = `
    void main() {
        gl_FragColor = vec4(1.0, 0, 0.0, 1.0);
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
  var a_Position = gl.getAttribLocation(gl.program, "a_Position");

  gl.vertexAttrib3f(a_Position, 0, 0, 0);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  canvas.onmousedown = function(ev) {
    click(ev, gl, canvas, a_Position);
  };
}

var g_points = [];

function click(ev, gl, canvas, a_Position) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();
  x = (x - rect.left - canvas.height / 2) / (canvas.height / 2);
  y = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);
  // Store the coordinates to g_points array
  g_points.push(x);
  g_points.push(y);
  gl.clear(gl.COLOR_BUFFER_BIT);
  var len = g_points.length;
  for (var i = 0; i < len; i += 2) {
    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, g_points[i], g_points[i + 1], 0.0);
    // Draw a point
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}
