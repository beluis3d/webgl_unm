// script.js

var gl;
var curves = [];
var points = [];
var topPoints = [];
var botPoints = [];
var wireCurves = [];
var wirePoints = [];
var topWirePoints = [];
var botWirePoints = [];
createSpherePoints();
var affine = mat4();

var effectController;
var translateVec = vec3(0.0, 0.0, 0.0);
var rotateVec = vec3(0.0, 0.0, 0.0);
var scaleVec = vec3(1.0, 1.0, 1.0);



var si = { // shader inputs
	vBufferId: undefined,
	wBufferId: undefined,
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
	gl.program2 = initShadersFromSource(gl, VSHADER_SOURCE2, FSHADER_SOURCE2);
	gl.useProgram(gl.program);

	setupGUI();
	setupData();
	update();
	requestAnimFrame(render);
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
	gui.add( effectController, 'newTranslateX', -1.0, 1.0).step(0.1).name('TranslateX').onChange(function(value) {
		if (effectController.newTranslateX !== translateVec[0]) {
			translateVec[0] = effectController.newTranslateX;
			translateSphere(translateVec[0], translateVec[1], translateVec[2]);
			update();
		}
	});
	gui.add( effectController, 'newTranslateY', -1.0, 1.0).step(0.1).name('TranslateY').onChange(function(value) {
		if (effectController.newTranslateY !== translateVec[1]) {
			translateVec[1] = effectController.newTranslateY;
			translateSphere(translateVec[0], translateVec[1], translateVec[2]);
			update();
		}
	});
	gui.add( effectController, 'newTranslateZ', -1.0, 1.0).step(0.1).name('TranslateZ').onChange(function(value) {
		if (effectController.newTranslateZ !== translateVec[2]) {
			translateVec[2] = effectController.newTranslateZ;
			translateSphere(translateVec[0], translateVec[1], translateVec[2]);
			update();
		}
	});
	gui.add( effectController, 'newRotateX', 0.0, 360.0).step(1.0).name('RotateX').onChange(function(value) {
		if (effectController.newRotateX !== rotateVec[0]) {
			rotateVec[0] = effectController.newRotateX;
			rotateSphere(rotateVec[0], rotateVec[1], rotateVec[2]);
			update();
		}
	});
	gui.add( effectController, 'newRotateY', 0.0, 360.0).step(1.0).name('RotateY').onChange(function(value) {
		if (effectController.newRotateY !== rotateVec[1]) {
			rotateVec[1] = effectController.newRotateY;
			rotateSphere(rotateVec[0], rotateVec[1], rotateVec[2]);
			update();
		}
	});
	gui.add( effectController, 'newRotateZ', 0.0, 360.0).step(1.0).name('RotateZ').onChange(function(value) {
		if (effectController.newRotateZ !== rotateVec[2]) {
			rotateVec[2] = effectController.newRotateZ;
			rotateSphere(rotateVec[0], rotateVec[1], rotateVec[2]);
			update();
		}
	});

	gui.add( effectController, 'newScaleX', 0.0, 2.0).step(0.1).name('ScaleX').onChange(function(value) {
		if (effectController.newScaleX !== scaleVec[0]) {
			scaleVec[0] = effectController.newScaleX;
			scaleSphere(scaleVec[0], scaleVec[1], scaleVec[2]);
			update();
		}
	});
	gui.add( effectController, 'newScaleY', 0.0, 2.0).step(0.1).name('ScaleY').onChange(function(value) {
		if (effectController.newScaleY !== scaleVec[1]) {
			scaleVec[1] = effectController.newScaleY;
			scaleSphere(scaleVec[0], scaleVec[1], scaleVec[2]);
			update();
		}
	});
	gui.add( effectController, 'newScaleZ', 0.0, 2.0).step(0.1).name('ScaleZ').onChange(function(value) {
		if (effectController.newScaleZ !== scaleVec[2]) {
			scaleVec[2] = effectController.newScaleZ;
			scaleSphere(scaleVec[0], scaleVec[1], scaleVec[2]);
			update();
		}
	});
}

function setupData() {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	si.vBufferId = gl.createBuffer();
	si.wBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, si.vBufferId);	
	si.a_Location = gl.getAttribLocation(gl.program, "a_Location");
	gl.vertexAttribPointer(si.a_Location, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(si.a_Location);

	si.a_Affine = gl.getAttribLocation(gl.program, "a_Affine");
}

function update() {
	updateSphereAffineMatrix();

	gl.bindBuffer(gl.ARRAY_BUFFER, si.vBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points.concat(botPoints).concat(topPoints)), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, si.wBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(wirePoints.concat(botWirePoints).concat(topWirePoints)), gl.STATIC_DRAW);
	gl.vertexAttrib4f( si.a_Affine+0, affine[0][0], affine[1][0], affine[2][0], affine[3][0] );
	gl.vertexAttrib4f( si.a_Affine+1, affine[0][1], affine[1][1], affine[2][1], affine[3][1] );
	gl.vertexAttrib4f( si.a_Affine+2, affine[0][2], affine[1][2], affine[2][2], affine[3][2] );
	gl.vertexAttrib4f( si.a_Affine+3, affine[0][3], affine[1][3], affine[2][3], affine[3][3] );
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(gl.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, si.vBufferId);
	gl.vertexAttribPointer(si.a_Location, 3, gl.FLOAT, false, 0, 0);
	for (var i = 0; i < curves.length; i++) {
		gl.drawArrays(gl.TRIANGLE_STRIP, curves[i].start, curves[i].size);	
	}
	gl.drawArrays(gl.TRIANGLE_FAN, points.length, botPoints.length);
	gl.drawArrays(gl.TRIANGLE_FAN, points.length+botPoints.length, topPoints.length);


	gl.useProgram(gl.program2);
	gl.bindBuffer(gl.ARRAY_BUFFER, si.wBufferId);
	gl.vertexAttribPointer(si.a_Location, 3, gl.FLOAT, false, 0, 0);
	for (var i = 0; i < wireCurves.length; i++) {
		gl.drawArrays(gl.LINE_STRIP, wireCurves[i].start, wireCurves[i].size);	
	}
	gl.drawArrays(gl.LINE_STRIP, wirePoints.length, botWirePoints.length);
	gl.drawArrays(gl.LINE_STRIP, wirePoints.length+botWirePoints.length, topWirePoints.length);

	requestAnimFrame(render);
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
	var steps = 12.0;
	var di = 360.0/steps;
	var dk = 180.0/steps;
	var radius = 1.0;

	// TRIANGLE POINTS
	for (var k = 0+dk; k < 180.0-dk; k+=dk) {
		var kCurve = { start: points.length, size: 0 };
		for (var i = 0.0; i <= 360.0; i+=di) {
			var p1 = polarToCartesian(radius,i,k);
			var p2 = polarToCartesian(radius,i,k+dk);
			
			kCurve.size+=2;
			points.push( p1, p2 );
		}
		curves.push( kCurve );
	}
	var botPoint = polarToCartesian(radius,0.0,0.0);
	botPoints = [botPoint];
	for(var i = 0; i <= 360.0; i+=di) {
		var p1 = polarToCartesian(radius,i,0.0+dk);
		botPoints.push(p1);
	}
	var topPoint = polarToCartesian(radius,0.0,180.0);
	topPoints = [topPoint];
	for(var i = 0; i <= 360.0; i+=di) {
		var p1 = polarToCartesian(radius,i,180.0-dk);
		topPoints.push(p1);
	}

	//WIRE POINTS
	for (var k = 0+dk; k < 180.0-dk; k+=dk) {
		var kWireCurve = { start: wirePoints.length, size: 0 };
		for (var i = 0.0; i <= 360.0; i+=2*di) {
			var p1 = polarToCartesian(radius,i,k);
			var p2 = polarToCartesian(radius,i,k+dk);
			var p3 = polarToCartesian(radius,i+di,k+dk);
			var p4 = polarToCartesian(radius,i+di,k);
			
			kWireCurve.size+=4;
			wirePoints.push( p1, p2, p3, p4 );
		}
		wireCurves.push( kWireCurve );
	}
	var botWirePoint = polarToCartesian(radius,0.0,0.0);
	for(var i = 0; i <= 360.0; i+=2*di) {
		var p1 = polarToCartesian(radius,i,0.0+dk);
		var p2 = polarToCartesian(radius,i+di,0.0+dk);
		botWirePoints.push( botWirePoint, p1, p2 );
	}
	var topWirePoint = polarToCartesian(radius,0.0,180.0);
	for(var i = 0; i <= 360.0; i+=2*di) {
		var p1 = polarToCartesian(radius,i-di,180.0-dk); // this is the opposite of bottom (i-di)
		var p2 = polarToCartesian(radius,i,180.0-dk);
		topWirePoints.push( topWirePoint, p1, p2 );
	}
}

function polarToCartesian(radius, theta, phi) {
	var x = radius*Math.cos(radians(theta))*Math.sin(radians(phi));
	var y = radius*Math.sin(radians(theta))*Math.sin(radians(phi));
	var z = radius*Math.cos(radians(phi));
	return vec3(x,y,z);

}
