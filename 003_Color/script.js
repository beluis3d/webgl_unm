// script.js
var gl;
var points = [
			vec2(-1.0,-1.0),
			vec2( 1.0,-1.0),
			vec2( 0.0, 1.0)
			];
var colors = [
			vec3(1.0,0.0,0.0),
			vec3(0.0,1.0,0.0),
			vec3(0.0,0.0,1.0)
			];

var effectController;
var renderMode = 0;

var fRenderMode;

window.onload = function init() {
	setupGUI();

	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);

	var program = initShadersFromSource(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	gl.useProgram(program);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	var cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	fRenderMode = gl.getUniformLocation(program, "fRenderMode");
	gl.uniform1i(fRenderMode, renderMode);

	render();
}

function setupGUI() {
	effectController = {
		newRenderMode: renderMode
	};
	var gui = new dat.GUI();
	gui.add(effectController, "newRenderMode", {Interpolated:0, Manual:1, Bright:2, Luminance:3}).name("Render Mode").onChange(function(value) {
		if (effectController.newRenderMode !== renderMode) {
			renderMode = effectController.newRenderMode;
			update();
			render();
		}
	});
}

function update() {
	gl.uniform1i(fRenderMode, renderMode);
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES,0,points.length);
}