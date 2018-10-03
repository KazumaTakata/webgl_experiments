var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color; 
    uniform mat4 u_MvpMatrix;
    varying vec4 v_Color;
    void main() {
        gl_Position = u_MvpMatrix * a_Position;
        gl_PointSize = 10.0;
        v_Color = a_Color;
    }`;

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;
    void main(){
        gl_FragColor = v_Color;
    }`;



function  main() {
    var canvas = document.getElementById("webgl");
    if (!canvas) {
        console.log("Failed to retrieve the <canvas> element");
        return;
    }

    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log("Failed to get the rendering context for WebGL");
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to initialize shaders.");
        return;
    }

    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    gl.enable(gl.DEPTH_TEST);

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COlOR_BUFFER_BIT);

    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(30, 1, 1 ,100);
    viewProjMatrix.lookAt(1, 1, 4, 0, 0, 0, 0, 1, 0);

    var currentAngle = [0.0, 0.0]; // Current rotation angle ([x-axis, y-axis] degrees)
    initEventHandlers(canvas, currentAngle);

    // gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

    var tick = function() {   // Start drawing
        draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);
        requestAnimationFrame(tick, canvas);
      };
    tick();
}


var g_MvpMatrix = new Matrix4(); // Model view projection matrix
function draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle) {
    // Caliculate The model view projection matrix and pass it to u_MvpMatrix
    g_MvpMatrix.set(viewProjMatrix);
    g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
    g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw the cube
  }

  function initEventHandlers(canvas, currentAngle) {
    var dragging = false;         // Dragging or not
    var lastX = -1, lastY = -1;   // Last position of the mouse
  
    canvas.onmousedown = function(ev) {   // Mouse is pressed
      var x = ev.clientX, y = ev.clientY;
      // Start dragging if a moue is in <canvas>
      var rect = ev.target.getBoundingClientRect();
      if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
        lastX = x; lastY = y;
        dragging = true;
      }
    };
  
    canvas.onmouseup = function(ev) { dragging = false;  }; // Mouse is released
  
    canvas.onmousemove = function(ev) { // Mouse is moved
      var x = ev.clientX, y = ev.clientY;
      if (dragging) {
        var factor = 100/canvas.height; // The rotation ratio
        var dx = factor * (x - lastX);
        var dy = factor * (y - lastY);
        // Limit x-axis rotation angle to -90 to 90 degrees
        currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
        currentAngle[1] = currentAngle[1] + dx;
      }
      lastX = x, lastY = y;
    };
  }

function initVertexBuffers(gl) {

    var vertices = new Float32Array([
        0.5,  0.5,  0.5,  0.5,  -0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5,  -0.5,  0.5, // v0, v1, v2, v3
        0.5,  0.5,  0.5, 0.5,  -0.5,  0.5,  0.5,  0.5,  -0.5 , 0.5,  -0.5,  -0.5, // v0, v1, v4, v5
        -0.5,  0.5,  0.5, -0.5,  -0.5,  0.5,  -0.5,  0.5,  -0.5 , -0.5,  -0.5,  -0.5,
        0.5,  0.5,  -0.5,  0.5,  -0.5,  -0.5,  -0.5,  0.5,  -0.5,  -0.5,  -0.5,  -0.5,
        0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,  0.5,  0.5,  -0.5,  -0.5,  0.5,  -0.5, 
        0.5,  -0.5,  0.5,  -0.5,  -0.5,  0.5,  0.5,  -0.5,  -0.5,  -0.5,  -0.5,  -0.5,
    ]);

    var colors = new Float32Array([
        1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0,  1.0, 0.0, 0.0, 1.0,  1.0, 0.0, 0.0, 1.0,
        1.0, 0.4, 0.0, 1.0, 1.0, 0.4, 0.0, 1.0, 1.0, 0.4, 0.0, 1.0, 1.0, 0.4, 0.0, 1.0,
        0.5, 0.4, 0.0, 1.0, 0.5, 0.4, 0.0, 1.0, 0.5, 0.4, 0.0, 1.0, 0.5, 0.4, 0.0, 1.0,
        0.5, 0.4, 0.5, 1.0, 0.5, 0.4, 0.5, 1.0, 0.5, 0.4, 0.5, 1.0, 0.5, 0.4, 0.5, 1.0,
        0.0, 0.0, 0.5, 1.0, 0.0, 0.0, 0.5, 1.0, 0.0, 0.0, 0.5, 1.0, 0.0, 0.0, 0.5, 1.0,
        0.4, 0.0, 0.5, 1.0, 0.4, 0.0, 0.5, 1.0, 0.4, 0.0, 0.5, 1.0, 0.4, 0.0, 0.5, 1.0,
    ])

    var indices = new Uint8Array([  
        0, 1, 2,   2, 1, 3,    // front
        4, 5, 6,  5, 6, 7,
        8, 9, 10,  9, 10, 11, 
        12, 13, 14, 13, 14, 15,
        16, 17, 18, 17, 18, 19,
        20, 21, 22, 21, 22, 23
        

    ]);


    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    var colorBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();
    if (!vertexBuffer ) {
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var FSIZE = vertices.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 3, 0);
    gl.enableVertexAttribArray(a_Position);

    
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    var FSIZE2 = colors.BYTES_PER_ELEMENT;
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, FSIZE2 * 4, 0);
    gl.enableVertexAttribArray(a_Color);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    
    return indices.length ;
}


