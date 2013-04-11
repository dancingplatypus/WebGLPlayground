/*global require, document, console, alert, canvas, Float32Array, Uint16Array, Image */

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
                    initTexture,
                    handleLoadedTexture,
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
                    texture,
                    rPyramid,       // track rotation of pyramid
                    rCube,    // track rotation of cube
                    lastTime,
                    pyramidVertexPositionBuffer,
                    pyramidVertexColorBuffer,
                    cubeVertexColorBuffer,
                    cubeVertexPositionBuffer,
                    cubeVertexIndexBuffer;

                mvMatrix = glm.mat4.create();
                pMatrix = glm.mat4.create();
                mvMatrixStack = [];

                rPyramid = 0;
                rCube = 0;
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

                animate = function () {
                    var timeNow, elapsed;

                    timeNow = new Date().getTime();
                    if (lastTime !== 0) {
                        elapsed = timeNow - lastTime;
                        rPyramid += (90 * elapsed) / 1000.0;
                        rCube += (75 * elapsed) / 1000.0;
                    }
                    lastTime = timeNow;
                };

                mvPushMatrix = function () {
                    var copy;
                    copy = glm.mat4.create();
                    glm.mat4.set(mvMatrix, copy);
                    mvMatrixStack.push(copy);
                };

                initTexture = function () {
                    texture = gl.createTexture();
                    texture.image = new Image();
                    texture.image.onload = function () {
                        handleLoadedTexture(texture);
                    };

                    texture.image.src = "imgs/nehe.gif";
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
                    initTexture();

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
                    var vertices, iLoop, iLoopInner, color, colors, unpackedColors, cubeVertexIndices;

                    pyramidVertexPositionBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
                    vertices = [
                        // front face
                        0.0,  1.0,  0.0,
                        -1.0, -1.0,  1.0,
                        1.0, -1.0,  1.0,

                        // Right face
                        0.0,  1.0,  0.0,
                        1.0, -1.0,  1.0,
                        1.0, -1.0, -1.0,

                        // Back face
                        0.0,  1.0,  0.0,
                        1.0, -1.0, -1.0,
                        -1.0, -1.0, -1.0,

                        // Left face
                        0.0,  1.0,  0.0,
                        -1.0, -1.0, -1.0,
                        -1.0, -1.0,  1.0
                    ];
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

                    pyramidVertexPositionBuffer.itemSize = 3;
                    pyramidVertexPositionBuffer.numItems = 12;

                    pyramidVertexColorBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
                    colors = [
                        // Front face
                        1.0, 0.0, 0.0, 1.0,
                        0.0, 1.0, 0.0, 1.0,
                        0.0, 0.0, 1.0, 1.0,

                        // Right face
                        1.0, 0.0, 0.0, 1.0,
                        0.0, 0.0, 1.0, 1.0,
                        0.0, 1.0, 0.0, 1.0,

                        // Back face
                        1.0, 0.0, 0.0, 1.0,
                        0.0, 1.0, 0.0, 1.0,
                        0.0, 0.0, 1.0, 1.0,

                        // Left face
                        1.0, 0.0, 0.0, 1.0,
                        0.0, 0.0, 1.0, 1.0,
                        0.0, 1.0, 0.0, 1.0
                    ];
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
                    pyramidVertexColorBuffer.itemSize = 4;
                    pyramidVertexColorBuffer.numItems = 12;

                    cubeVertexPositionBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
                    vertices = [
                        // Front face
                        -1.0, -1.0,  1.0,
                        1.0, -1.0,  1.0,
                        1.0,  1.0,  1.0,
                        -1.0,  1.0,  1.0,

                        // Back face
                        -1.0, -1.0, -1.0,
                        -1.0,  1.0, -1.0,
                        1.0,  1.0, -1.0,
                        1.0, -1.0, -1.0,

                        // Top face
                        -1.0,  1.0, -1.0,
                        -1.0,  1.0,  1.0,
                        1.0,  1.0,  1.0,
                        1.0,  1.0, -1.0,

                        // Bottom face
                        -1.0, -1.0, -1.0,
                        1.0, -1.0, -1.0,
                        1.0, -1.0,  1.0,
                        -1.0, -1.0,  1.0,

                        // Right face
                        1.0, -1.0, -1.0,
                        1.0,  1.0, -1.0,
                        1.0,  1.0,  1.0,
                        1.0, -1.0,  1.0,

                        // Left face
                        -1.0, -1.0, -1.0,
                        -1.0, -1.0,  1.0,
                        -1.0,  1.0,  1.0,
                        -1.0,  1.0, -1.0
                    ];
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
                    cubeVertexPositionBuffer.itemSize = 3;
                    cubeVertexPositionBuffer.numItems = 24;

                    cubeVertexColorBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
                    colors = [
                        [1.0, 0.0, 0.0, 1.0], // Front face
                        [1.0, 1.0, 0.0, 1.0], // Back face
                        [0.0, 1.0, 0.0, 1.0], // Top face
                        [1.0, 0.5, 0.5, 1.0], // Bottom face
                        [1.0, 0.0, 1.0, 1.0], // Right face
                        [0.0, 0.0, 1.0, 1.0]  // Left face
                    ];
                    unpackedColors = [];
                    for (iLoop in colors) {
                        if (colors.hasOwnProperty(iLoop)) {
                            color = colors[iLoop];
                            for (iLoopInner = 0; iLoopInner < 4; iLoopInner += 1) {
                                unpackedColors = unpackedColors.concat(color);
                            }
                        }
                    }
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
                    cubeVertexColorBuffer.itemSize = 4;
                    cubeVertexColorBuffer.numItems = 24;

                    cubeVertexIndexBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
                    cubeVertexIndices = [
                        0, 1, 2,      0, 2, 3,    // Front face
                        4, 5, 6,      4, 6, 7,    // Back face
                        8, 9, 10,     8, 10, 11,  // Top face
                        12, 13, 14,   12, 14, 15, // Bottom face
                        16, 17, 18,   16, 18, 19, // Right face
                        20, 21, 22,   20, 22, 23  // Left face
                    ];
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
                    cubeVertexIndexBuffer.itemSize = 1;
                    cubeVertexIndexBuffer.numItems = 36;
                };

                drawScene = function () {
                    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    glm.mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
                    glm.mat4.identity(mvMatrix);

                    glm.mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);

                    mvPushMatrix();
                    glm.mat4.rotate(mvMatrix, degToRad(rPyramid), [0, 1, 0]);
                    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
                    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
                        pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
                    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
                        pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    setMatrixUniforms();
                    gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);
                    mvPopMatrix();

                    glm.mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);

                    mvPushMatrix();
                    glm.mat4.rotate(mvMatrix, degToRad(rCube), [1, 1, 1]);
                    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
                    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
                        cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
                    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
                        cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
                    setMatrixUniforms();
                    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
                    mvPopMatrix();
                };

                webGLStart();
            });
        });
    });
}());