// script.js

var gl;
var points = createSpherePoints();
var affine = mat4();

var effectController;
var translateVec = vec3(0.0, 0.0, 0.0);
var rotateVec = vec3(0.0, 0.0, 0.0);
var scaleVec = vec3(1.0, 1.0, 1.0);



var si = { // shader inputs
	vBufferId: undefined,
	a_Location: undefined,
	a_Affine: mat4()
}

var ap = { // affineProperties
	translate: mat4(),
	rotate: mat4(),
	scale: mat4()
}

window.onload = function init() {
	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	gl.program = initShadersFromSource(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	gl.useProgram(gl.program);

	setupGUI();
	setupData();
	update();
	render();

}

function setupGUI() {
	var effectController = {
		newTranslateX: translateVec[0],
		newTranslateY: translateVec[1],
		newTranslateZ: translateVec[2],
		newRotateX: rotateVec[0],
		newRotateY: rotateVec[1],
		newRotateZ: rotateVec[2],
		newScaleX: scaleVec[0],
		newScaleY: scaleVec[1],
		newScaleZ: scaleVec[2]
	};

	var gui = new dat.GUI();
	gui.add( effectController, 'newTranslateX', 0.0, 1.0).step(0.1).name('TranslateX').onChange(function(value) {
		if (effectController.newTranslateX !== translateVec[0]) {
			translateVec[0] = effectController.newTranslateX;
			translateSphere(translateVec[0], translateVec[1], translateVec[2]);
			update();
			render();
		}
	});
	gui.add( effectController, 'newTranslateY', 0.0, 1.0).step(0.1).name('TranslateY').onChange(function(value) {
		if (effectController.newTranslateY !== translateVec[1]) {
			translateVec[1] = effectController.newTranslateY;
			translateSphere(translateVec[0], translateVec[1], translateVec[2]);
			update();
			render();
		}
	});
	gui.add( effectController, 'newTranslateZ', 0.0, 1.0).step(0.1).name('TranslateZ').onChange(function(value) {
		if (effectController.newTranslateZ !== translateVec[2]) {
			translateVec[2] = effectController.newTranslateZ;
			translateSphere(translateVec[0], translateVec[1], translateVec[2]);
			update();
			render();
		}
	});
	gui.add( effectController, 'newRotateX', 0.0, 360.0).step(1.0).name('RotateX').onChange(function(value) {
		if (effectController.newRotateX !== rotateVec[0]) {
			rotateVec[0] = effectController.newRotateX;
			rotateSphere(rotateVec[0], rotateVec[1], rotateVec[2]);
			update();
			render();
		}
	});
	gui.add( effectController, 'newRotateY', 0.0, 360.0).step(1.0).name('RotateY').onChange(function(value) {
		if (effectController.newRotateY !== rotateVec[1]) {
			rotateVec[1] = effectController.newRotateY;
			rotateSphere(rotateVec[0], rotateVec[1], rotateVec[2]);
			update();
			render();
		}
	});
	gui.add( effectController, 'newRotateZ', 0.0, 360.0).step(1.0).name('RotateZ').onChange(function(value) {
		if (effectController.newRotateZ !== rotateVec[2]) {
			rotateVec[2] = effectController.newRotateZ;
			rotateSphere(rotateVec[0], rotateVec[1], rotateVec[2]);
			update();
			render();
		}
	});

	gui.add( effectController, 'newScaleX', 0.0, 2.0).step(0.1).name('ScaleX').onChange(function(value) {
		if (effectController.newScaleX !== scaleVec[0]) {
			scaleVec[0] = effectController.newScaleX;
			scaleSphere(scaleVec[0], scaleVec[1], scaleVec[2]);
			update();
			render();
		}
	});
	gui.add( effectController, 'newScaleY', 0.0, 2.0).step(0.1).name('ScaleY').onChange(function(value) {
		if (effectController.newScaleY !== scaleVec[1]) {
			scaleVec[1] = effectController.newScaleY;
			scaleSphere(scaleVec[0], scaleVec[1], scaleVec[2]);
			update();
			render();
		}
	});
	gui.add( effectController, 'newScaleZ', 0.0, 2.0).step(0.1).name('ScaleZ').onChange(function(value) {
		if (effectController.newScaleZ !== scaleVec[2]) {
			scaleVec[2] = effectController.newScaleZ;
			scaleSphere(scaleVec[0], scaleVec[1], scaleVec[2]);
			update();
			render();
		}
	});
}

function setupData() {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	si.vBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, si.vBufferId);	
	si.a_Location = gl.getAttribLocation(gl.program, "a_Location");
	gl.vertexAttribPointer(si.a_Location, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(si.a_Location);

	si.a_Affine = gl.getAttribLocation(gl.program, "a_Affine");
}

function update() {

	updateSphereAffineMatrix();

	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	gl.vertexAttrib4f( si.a_Affine+0, affine[0][0], affine[1][0], affine[2][0], affine[3][0] );
	gl.vertexAttrib4f( si.a_Affine+1, affine[0][1], affine[1][1], affine[2][1], affine[3][1] );
	gl.vertexAttrib4f( si.a_Affine+2, affine[0][2], affine[1][2], affine[2][2], affine[3][2] );
	gl.vertexAttrib4f( si.a_Affine+3, affine[0][3], affine[1][3], affine[2][3], affine[3][3] );
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.POINTS, 0, points.length);	
}

function translateSphere(x, y, z) { 
	ap.translate = translate(x, y, z); 
}
function rotateSphere(x, y, z) { 
	var _x = rotate(x, 1.0, 0.0, 0.0);
	var _y = rotate(y, 0.0, 1.0, 0.0);
	var _z = rotate(z, 0.0, 0.0, 1.0); 
	ap.rotate = mult(_z, mult(_y, _x));
}
function scaleSphere(x, y, z) { 
	ap.scale = scalem(x, y, z); 
}
function updateSphereAffineMatrix() {
	affine = mult(ap.translate, mult(ap.rotate, ap.scale));
}

function createSpherePoints() {
	var steps = 10.0;
	var delta = 360.0/steps;
	var radius = 1.0;

	var ret = [];
	for (var i = 0.0; i <= 360.0; i+=delta) {
		var x = radius*Math.cos(radians(i));
		var y = radius*Math.sin(radians(i));
		ret.push( vec3(x,y,0.0) );
	}

	return ret;
}
