/*global require, document, console, alert, canvas, Float32Array */

/*
 * LESSON 3 -- http://learningwebgl.com/blog/?p=239
 */

(function () {
    "use strict";
    require(["_common"], function () {
        require(["jquery", "glmatrix", "glut",
                'text!../shaders/v/v_lesson2.glsl',
                'text!../shaders/f/f_lesson2.glsl'
            ], function ($, glm, glut, shader_v, shader_f) {
            $(function () {
                var gl,
                    webGLStart,
                    initBuffers,
                    initGL,
                    initShaders,
                    tick,
                    animate,
                    pMatrix,
                    mvMatrix,
                    mvPushMatrix,
                    mvPopMatrix,
                    mvMatrixStack,
                    degToRad,
                    getShader,
                    drawScene,
                    setMatrixUniforms,
                    shaderProgram,
                    rTri,       // track rotation of triangle
                    rSquare,    // track rotation of square
                    lastTime,
                    triangleVertexColorBuffer,
                    squareVertexColorBuffer,
                    triangleVertexPositionBuffer,
                    squareVertexPositionBuffer;

                mvMatrix = glm.mat4.create();
                pMatrix = glm.mat4.create();
                mvMatrixStack = [];

                rTri = 0;
                rSquare = 0;
                lastTime = 0;

                setMatrixUniforms = function () {
                    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
                    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
                };

                tick = function () {
                    glut.requestAnimFrame(tick);
                    drawScene();
                    animate();
                };

                animate = function() {
                    var timeNow, elapsed;

                    timeNow = new Date().getTime();
                    if (lastTime !== 0) {
                        elapsed = timeNow - lastTime;
                        rTri += (90 * elapsed) / 1000.0;
                        rSquare += (75 * elapsed) / 1000.0;
                    }
                    lastTime = timeNow;
                };

                mvPushMatrix = function () {
                    var copy;
                    copy = glm.mat4.create();
                    glm.mat4.set(mvMatrix, copy);
                    mvMatrixStack.push(copy);
                };

                mvPopMatrix = function () {
                    if (mvMatrixStack.length === 0) {
                        throw "Invalid popMatrix";
                    }
                    mvMatrix = mvMatrixStack.pop();
                };

                degToRad = function (degrees) {
                    return degrees * Math.PI / 180;
                };

                webGLStart = function () {
                    var canvas;
                    canvas = document.getElementById("lesson1-canvas");
                    initGL(canvas);
                    initShaders();
                    initBuffers();

                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.enable(gl.DEPTH_TEST);

                    tick();
                };

                getShader = function (gl, theType, str) {
                    var shader;
                    shader = gl.createShader((theType === 'fragment') ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER);
                    gl.shaderSource(shader, str);
                    gl.compileShader(shader);
                    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                        alert(gl.getShaderInfoLog(shader));
                        return null;
                    }
                    return shader;
                };

                initGL = function (canvas) {
                    try {
                        gl = canvas.getContext("experimental-webgl");
                        gl.viewportWidth = canvas.width;
                        gl.viewportHeight = canvas.height;
                    } catch (e) {
                        console.log(e);
                    }
                    if (!gl) {
                        alert('Could not initialize WebGL.');
                    }
                };

                initShaders = function () {
                    var fragmentShader, vertexShader;
                    fragmentShader = getShader(gl, 'fragment', shader_f);
                    vertexShader = getShader(gl, 'vertex', shader_v);
                    shaderProgram = gl.createProgram();
                    gl.attachShader(shaderProgram, vertexShader);
                    gl.attachShader(shaderProgram, fragmentShader);
                    gl.linkProgram(shaderProgram);

                    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                        alert("Could not initialize shaders");
                    }

                    gl.useProgram(shaderProgram);

                    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
                    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

                    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
                    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

                    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
                    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
                };

                initBuffers = function () {
                    var vertices, iLoop, colors;

                    triangleVertexPositionBuffer = gl.createBuffer();
                    vertices = [
                        0.0, 1.0, 0.0,
                        -1.0, -1.0, 0.0,
                        1.0, -1.0, 0.0
                    ];
                    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

                    triangleVertexPositionBuffer.itemSize = 3;
                    triangleVertexPositionBuffer.numItems = 3;

                    triangleVertexColorBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
                    colors = [
                        1.0, 0.0, 0.0, 1.0,
                        0.0, 1.0, 0.0, 1.0,
                        0.0, 0.0, 1.0, 1.0
                    ];
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
                    triangleVertexColorBuffer.itemSize = 4;
                    triangleVertexColorBuffer.numItems = 3;

                    squareVertexPositionBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
                    vertices = [
                        1.0, 1.0, 0.0,
                        -1.0, 1.0, 0.0,
                        1.0, -1.0, 0.0,
                        -1.0, -1.0, 0.0
                    ];

                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
                    squareVertexPositionBuffer.itemSize = 3;
                    squareVertexPositionBuffer.numItems = 4;

                    squareVertexColorBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
                    colors = [];
                    for (iLoop = 0; iLoop < 4; iLoop += 1) {
                        colors = colors.concat([0.5, 0.5, 1.0, 1.0]);
                    }
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
                    squareVertexColorBuffer.itemSize = 4;
                    squareVertexColorBuffer.numItems = 4;

                };

                drawScene = function () {
                    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    glm.mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
                    glm.mat4.identity(mvMatrix);

                    glm.mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);

                    mvPushMatrix();
                    glm.mat4.rotate(mvMatrix, degToRad(rTri), [0, 1, 0]);
                    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
                    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
                        triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
                    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
                        triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    setMatrixUniforms();
                    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
                    mvPopMatrix();

                    glm.mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);

                    mvPushMatrix();
                    glm.mat4.rotate(mvMatrix, degToRad(rSquare), [1,0,0]);
                    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
                    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
                        squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
                    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
                        squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    setMatrixUniforms();
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
                    mvPopMatrix();
                };

                webGLStart();
            });
        });
    });
}());