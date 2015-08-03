// script.js

// --- Sphere Class --- //

var Sphere = function() {
	this.solid = {
		curves: [],
		points: [],
		botPoints: [],
		topPoints: []
	};

	this.wire = {
		curves: [],
		points: [],
		botPoints: [],
		topPoints: []	
	};

	this.si = { // shader inputs
		vBufferId: undefined,  // shader buffer for the points
		wBufferId: undefined,  // shader buffer for the wireframes
		a_Location: undefined, // shader field for location of vertex
		a_Affine: mat4()       // shader field for affine transformation
	};

	this.ap = { // affineProperties
		affine: mat4(), 		// the collection of affine transformations (translate, rotate, & scale)
		translate: mat4(),
		rotate: mat4(),
		scale: mat4()
	};

	this.createPoints(); 
}

Sphere.prototype.createPoints = function() {
	var steps = 12.0;
	var di = 360.0/steps;
	var dk = 180.0/steps;
	var radius = 1.0;

	// Triangle Points
	for (var k = 0+dk; k < 180.0-dk; k+=dk) {
		var kCurve = { start: this.solid.points.length, size: 0 };
		for (var i = 0.0; i <= 360.0; i+=di) {
			var p1 = polarToCartesian(radius,i,k);
			var p2 = polarToCartesian(radius,i,k+dk);
			
			kCurve.size+=2;
			this.solid.points.push( p1, p2 );
		}
		this.solid.curves.push( kCurve );
	}
	var botPoint = polarToCartesian(radius,0.0,0.0);
	this.solid.botPoints = [botPoint];
	for(var i = 0; i <= 360.0; i+=di) {
		var p1 = polarToCartesian(radius,i,0.0+dk);
		this.solid.botPoints.push(p1);
	}
	var topPoint = polarToCartesian(radius,0.0,180.0);
	this.solid.topPoints = [topPoint];
	for(var i = 0; i <= 360.0; i+=di) {
		var p1 = polarToCartesian(radius,i,180.0-dk);
		this.solid.topPoints.push(p1);
	}

	//Wire Points
	for (var k = 0+dk; k < 180.0-dk; k+=dk) {
		var kWireCurve = { start: this.wire.points.length, size: 0 };
		for (var i = 0.0; i <= 360.0; i+=2*di) {
			var p1 = polarToCartesian(radius,i,k);
			var p2 = polarToCartesian(radius,i,k+dk);
			var p3 = polarToCartesian(radius,i+di,k+dk);
			var p4 = polarToCartesian(radius,i+di,k);
			
			kWireCurve.size+=4;
			this.wire.points.push( p1, p2, p3, p4 );
		}
		this.wire.curves.push( kWireCurve );
	}
	var botWirePoint = polarToCartesian(radius,0.0,0.0);
	for(var i = 0; i <= 360.0; i+=2*di) {
		var p1 = polarToCartesian(radius,i,0.0+dk);
		var p2 = polarToCartesian(radius,i+di,0.0+dk);
		this.wire.botPoints.push( botWirePoint, p1, p2 );
	}
	var topWirePoint = polarToCartesian(radius,0.0,180.0);
	for(var i = 0; i <= 360.0; i+=2*di) {
		var p1 = polarToCartesian(radius,i-di,180.0-dk); // this is the opposite of bottom (i-di)
		var p2 = polarToCartesian(radius,i,180.0-dk);
		this.wire.topPoints.push( topWirePoint, p1, p2 );
	}
}

Sphere.prototype.setupData = function() {
	this.si.vBufferId = gl.createBuffer();
	this.si.wBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si.vBufferId);	
	this.si.a_Location = gl.getAttribLocation(gl.program, "a_Location");
	gl.vertexAttribPointer(this.si.a_Location, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.si.a_Location);

	this.si.a_Affine = gl.getAttribLocation(gl.program, "a_Affine");
}

Sphere.prototype.translate = function(x, y, z) { 
	this.ap.translate = translate(x, y, z); 
}

Sphere.prototype.rotate = function(x, y, z) { 
	var _x = rotate(x, 1.0, 0.0, 0.0);
	var _y = rotate(y, 0.0, 1.0, 0.0);
	var _z = rotate(z, 0.0, 0.0, 1.0); 
	this.ap.rotate = mult(_z, mult(_y, _x));
}

Sphere.prototype.scale = function(x, y, z) { 
	this.ap.scale = scalem(x, y, z);
}

Sphere.prototype.updateAffineMatrix = function() {
	this.ap.affine = mult(this.ap.translate, mult(this.ap.rotate, this.ap.scale));
}

Sphere.prototype.update = function() {
	this.updateAffineMatrix();
	
	var allSolidPoints = this.solid.points.concat(this.solid.botPoints).concat(this.solid.topPoints);
	var allWirePoints = this.wire.points.concat(this.wire.botPoints).concat(this.wire.topPoints);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si.vBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(allSolidPoints), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si.wBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(allWirePoints), gl.STATIC_DRAW);
	
	var a_Affine = this.si.a_Affine;
	var affine = this.ap.affine;
	gl.vertexAttrib4f( a_Affine+0, affine[0][0], affine[1][0], affine[2][0], affine[3][0] );
	gl.vertexAttrib4f( a_Affine+1, affine[0][1], affine[1][1], affine[2][1], affine[3][1] );
	gl.vertexAttrib4f( a_Affine+2, affine[0][2], affine[1][2], affine[2][2], affine[3][2] );
	gl.vertexAttrib4f( a_Affine+3, affine[0][3], affine[1][3], affine[2][3], affine[3][3] );
}

Sphere.prototype.render = function() {
	gl.useProgram(gl.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si.vBufferId);
	gl.vertexAttribPointer(this.si.a_Location, 3, gl.FLOAT, false, 0, 0);
	for (var i = 0; i < this.solid.curves.length; i++) {
		gl.drawArrays(gl.TRIANGLE_STRIP, this.solid.curves[i].start, this.solid.curves[i].size);	
	}
	gl.drawArrays(gl.TRIANGLE_FAN, this.solid.points.length, this.solid.botPoints.length);
	gl.drawArrays(gl.TRIANGLE_FAN, this.solid.points.length+this.solid.botPoints.length, this.solid.topPoints.length);


	gl.useProgram(gl.program2);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si.wBufferId);
	gl.vertexAttribPointer(this.si.a_Location, 3, gl.FLOAT, false, 0, 0);
	for (var i = 0; i < this.wire.curves.length; i++) {
		gl.drawArrays(gl.LINE_STRIP, this.wire.curves[i].start, this.wire.curves[i].size);	
	}
	gl.drawArrays(gl.LINE_STRIP, this.wire.points.length, this.wire.botPoints.length);
	gl.drawArrays(gl.LINE_STRIP, this.wire.points.length+this.wire.botPoints.length, this.wire.topPoints.length);
}

// --- Sphere Class --- //

var gl;
var spheres = [];
var bUpdate = true;

var effectController;
var activeIndex = 0;
var translateVec = vec3(0.0, 0.0, 0.0);
var rotateVec = vec3(0.0, 0.0, 0.0);
var scaleVec = vec3(1.0, 1.0, 1.0);

window.onload = function init() {
	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	gl.program = initShadersFromSource(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	gl.program2 = initShadersFromSource(gl, VSHADER_SOURCE2, FSHADER_SOURCE2);
	gl.useProgram(gl.program);

	spheres.push( new Sphere() );
	spheres.push( new Sphere() );

	setupGUI();
	setupData();
	requestAnimFrame(updateAndRender);
}

function setupGUI() {
	var effectController = {
		newActiveIndex: activeIndex,
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
	gui.add(effectController, 'newActiveIndex', {First:0, Second:1}).name("Active Element").onChange(function(value) {
		if (effectController.newActiveIndex !== activeIndex) {
			activeIndex = effectController.newActiveIndex;
			//TODO: make all of the variables update to the correct object's parameters
			//update();
		}
	});

	gui.add( effectController, 'newTranslateX', -1.0, 1.0).step(0.1).name('TranslateX').onChange(function(value) {
		if (effectController.newTranslateX !== translateVec[0]) {
			translateVec[0] = effectController.newTranslateX;
			spheres[activeIndex].translate(translateVec[0], translateVec[1], translateVec[2]);
			bUpdate = true;
		}
	});
	gui.add( effectController, 'newTranslateY', -1.0, 1.0).step(0.1).name('TranslateY').onChange(function(value) {
		if (effectController.newTranslateY !== translateVec[1]) {
			translateVec[1] = effectController.newTranslateY;
			spheres[activeIndex].translate(translateVec[0], translateVec[1], translateVec[2]);
			bUpdate = true;
		}
	});
	gui.add( effectController, 'newTranslateZ', -1.0, 1.0).step(0.1).name('TranslateZ').onChange(function(value) {
		if (effectController.newTranslateZ !== translateVec[2]) {
			translateVec[2] = effectController.newTranslateZ;
			spheres[activeIndex].translate(translateVec[0], translateVec[1], translateVec[2]);
			bUpdate = true;
		}
	});
	gui.add( effectController, 'newRotateX', -180.0, 180.0).step(1.0).name('RotateX').onChange(function(value) {
		if (effectController.newRotateX !== rotateVec[0]) {
			rotateVec[0] = effectController.newRotateX;
			spheres[activeIndex].rotate(rotateVec[0], rotateVec[1], rotateVec[2]);
			bUpdate = true;
		}
	});
	gui.add( effectController, 'newRotateY', -180.0, 180.0).step(1.0).name('RotateY').onChange(function(value) {
		if (effectController.newRotateY !== rotateVec[1]) {
			rotateVec[1] = effectController.newRotateY;
			spheres[activeIndex].rotate(rotateVec[0], rotateVec[1], rotateVec[2]);
			bUpdate = true;
		}
	});
	gui.add( effectController, 'newRotateZ', -180.0, 180.0).step(1.0).name('RotateZ').onChange(function(value) {
		if (effectController.newRotateZ !== rotateVec[2]) {
			rotateVec[2] = effectController.newRotateZ;
			spheres[activeIndex].rotate(rotateVec[0], rotateVec[1], rotateVec[2]);
			bUpdate = true;
		}
	});

	gui.add( effectController, 'newScaleX', 0.0, 2.0).step(0.1).name('ScaleX').onChange(function(value) {
		if (effectController.newScaleX !== scaleVec[0]) {
			scaleVec[0] = effectController.newScaleX;
			spheres[activeIndex].scale(scaleVec[0], scaleVec[1], scaleVec[2]);
			bUpdate = true;
		}
	});
	gui.add( effectController, 'newScaleY', 0.0, 2.0).step(0.1).name('ScaleY').onChange(function(value) {
		if (effectController.newScaleY !== scaleVec[1]) {
			scaleVec[1] = effectController.newScaleY;
			spheres[activeIndex].scale(scaleVec[0], scaleVec[1], scaleVec[2]);
			bUpdate = true;
		}
	});
	gui.add( effectController, 'newScaleZ', 0.0, 2.0).step(0.1).name('ScaleZ').onChange(function(value) {
		if (effectController.newScaleZ !== scaleVec[2]) {
			scaleVec[2] = effectController.newScaleZ;
			spheres[activeIndex].scale(scaleVec[0], scaleVec[1], scaleVec[2]);
			bUpdate = true;
		}
	});
}

function setupData() {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	for (var i = 0; i < spheres.length; i++) {
		spheres[i].setupData();
	}
}

function updateAndRender() {
	if (!bUpdate) {
		requestAnimFrame(updateAndRender);
		return;
	}

	bUpdate = false;
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	for (var i = 0; i < spheres.length; i++) {
		spheres[i].update();
		spheres[i].render();
	}
	requestAnimFrame(updateAndRender);
}

function polarToCartesian(radius, theta, phi) {
	var x = radius*Math.cos(radians(theta))*Math.sin(radians(phi));
	var y = radius*Math.sin(radians(theta))*Math.sin(radians(phi));
	var z = radius*Math.cos(radians(phi));
	return vec3(x,y,z);
}
