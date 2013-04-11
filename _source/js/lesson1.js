/*global require, document, console, alert, canvas, Float32Array */

console.log("Made it here");

(function () {
    "use strict";
    require(["_common"], function () {
        require(["jquery", "glmatrix",
                'text!../shaders/v/v_null.glsl',
                'text!../shaders/f/f_null.glsl'
            ], function ($, glm, shader_v, shader_f) {
            $(function () {
                var gl,
                    webGLStart,
                    initBuffers,
                    initGL,
                    initShaders,
                    pMatrix,
                    mvMatrix,
                    getShader,
                    drawScene,
                    setMatrixUniforms,
                    shaderProgram,
                    triangleVertexPositionBuffer,
                    squareVertexPositionBuffer;

                mvMatrix = glm.mat4.create();
                pMatrix = glm.mat4.create();

                setMatrixUniforms = function () {
                    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
                    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
                };

                webGLStart = function () {
                    var canvas;
                    canvas = document.getElementById("lesson1-canvas");
                    initGL(canvas);
                    initShaders();
                    initBuffers();

                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.enable(gl.DEPTH_TEST);

                    drawScene();
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

                    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
                    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
                };

                initBuffers = function () {
                    var vertices;

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
                };

                drawScene = function () {
                    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    glm.mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
                    glm.mat4.identity(mvMatrix);
                    glm.mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
                    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
                    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
                        triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    setMatrixUniforms();
                    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
                    glm.mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
                    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
                    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
                        squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    setMatrixUniforms();
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
                };

                webGLStart();
            });
        });
    });
}());