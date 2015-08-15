// script.js


// --- Begin: Object3D Class --- //

var Object3D = function(id, className) {
	this.id = id;
	this.className = (!!className) ? className : "Object3D";

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
		a_Model: mat4()        // shader field for model transformation
	};

	this.mp = { // modelProperties
		model: mat4(), 		// the collection of model transformations (translate, rotate, & scale)
		translate: mat4(),
		rotate: mat4(),
		scale: mat4()
	};

	this.ui = {
		translate: vec3(0.0, 0.0, 0.0),
		rotate: vec3(0.0, 0.0, 0.0),
		scale: vec3(1.0, 1.0, 1.0)
	}

	this.setupData();
	this.createPoints(); 
}

Object3D.prototype.setupData = function() {
	this.si.vBufferId = gl.createBuffer();
	this.si.wBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si.vBufferId);	
	this.si.a_Location = gl.getAttribLocation(gl.program, "a_Location");
	gl.vertexAttribPointer(this.si.a_Location, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.si.a_Location);

	this.si.a_Model = gl.getAttribLocation(gl.program, "a_Model");
}

Object3D.prototype.translate = function(axis, value) { 
	this.ui.translate[axis] = value;
	this.mp.translate = translate(this.ui.translate[0], this.ui.translate[1], this.ui.translate[2]); 
}

Object3D.prototype.rotate = function(axis, value) {
	this.ui.rotate[axis] = value;
	var _x = rotate(this.ui.rotate[0], 1.0, 0.0, 0.0);
	var _y = rotate(this.ui.rotate[1], 0.0, 1.0, 0.0);
	var _z = rotate(this.ui.rotate[2], 0.0, 0.0, 1.0); 
	this.mp.rotate = mult(_z, mult(_y, _x));
}

Object3D.prototype.scale = function(axis, value) {
	this.ui.scale[axis] = value; 
	this.mp.scale = scalem(this.ui.scale[0], this.ui.scale[1], this.ui.scale[2]);
}

Object3D.prototype.updateModelMatrix = function() {
	this.mp.model = mult(this.mp.translate, mult(this.mp.rotate, this.mp.scale));
}

Object3D.prototype.update = function() {
	this.updateModelMatrix();
	
	var allSolidPoints = this.solid.points.concat(this.solid.botPoints).concat(this.solid.topPoints);
	var allWirePoints = this.wire.points.concat(this.wire.botPoints).concat(this.wire.topPoints);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si.vBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(allSolidPoints), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si.wBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(allWirePoints), gl.STATIC_DRAW);
	
	var a_Model = this.si.a_Model;
	var model = this.mp.model;
	gl.vertexAttrib4f( a_Model+0, model[0][0], model[1][0], model[2][0], model[3][0] );
	gl.vertexAttrib4f( a_Model+1, model[0][1], model[1][1], model[2][1], model[3][1] );
	gl.vertexAttrib4f( a_Model+2, model[0][2], model[1][2], model[2][2], model[3][2] );
	gl.vertexAttrib4f( a_Model+3, model[0][3], model[1][3], model[2][3], model[3][3] );
}

Object3D.prototype.render = function() {
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

Object3D.prototype.toString = function() {
	return this.id;
}

Object3D.prototype.debugString = function() {
	return this._debugString(this, "");
}

Object3D.prototype._debugString = function(obj, indent) {
	if (!obj) return "undefined";

	var retStr = "";
	for (var key in obj) {
  		if (obj.hasOwnProperty(key)) {
  			var value = obj[key];
  			
  			if (!(value instanceof Object)) {
    			retStr += indent + (key + " -> " + value) + "\n";
    		} else {
    			retStr += indent + (key + " -> ") + "\n"
    			retStr += this._debugString(value, indent+"\t");
    		}

  		}
	}

	return retStr;
}

// --- End: Object3D Class --- //


// --- Begin: Sphere Class --- //

var Sphere = function(id) { Object3D.call(this, id, "Sphere"); }
Sphere.prototype = Object.create(Object3D.prototype);
Sphere.prototype.constructor = Sphere;

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

// --- End: Sphere Class --- //


// --- Begin: Cylinder Class --- //

var Cylinder = function(id) { Object3D.call(this, id, "Cylinder"); }
Cylinder.prototype = Object.create(Object3D.prototype);
Cylinder.prototype.constructor = Cylinder;

Cylinder.prototype.createPoints = function() {
	var steps = 12.0;
	var height = 1.0;
	var di = 360.0/steps;
	var dk = height/steps;
	var radius = 1.0;
	var EPSILON = 0.5*dk;

	// Triangle Points
	for (var k = -0.5*height; k < 0.5*height-EPSILON; k+=dk) {
		var kCurve = { start: this.solid.points.length, size: 0 };
		for (var i = 0.0; i <= 360.0; i+=di) {
			var p1 = polarToCartesian2D(radius,i,k);
			var p2 = polarToCartesian2D(radius,i,k+dk);
			
			kCurve.size+=2;
			this.solid.points.push( p1, p2 );
		}
		this.solid.curves.push( kCurve );
	}
	var botPoint = vec3(0.0,0.0,-0.5*height);
	this.solid.botPoints = [botPoint];
	for(var i = 0; i <= 360.0; i+=di) {
		var p1 = polarToCartesian2D(radius,i,-0.5*height);
		this.solid.botPoints.push(p1);
	}
	var topPoint = vec3(0.0,0.0,0.5*height);
	this.solid.topPoints = [topPoint];
	for(var i = 0; i <= 360.0; i+=di) {
		var p1 = polarToCartesian2D(radius,i,0.5*height);
		this.solid.topPoints.push(p1);
	}

	//Wire Points
	for (var k = -0.5*height; k < 0.5*height-EPSILON; k+=dk) {
		var kWireCurve = { start: this.wire.points.length, size: 0 };
		for (var i = 0.0; i <= 360.0; i+=2*di) {
			var p1 = polarToCartesian2D(radius,i,k);
			var p2 = polarToCartesian2D(radius,i,k+dk);
			var p3 = polarToCartesian2D(radius,i+di,k+dk);
			var p4 = polarToCartesian2D(radius,i+di,k);
			
			kWireCurve.size+=4;
			this.wire.points.push( p1, p2, p3, p4 );
		}
		this.wire.curves.push( kWireCurve );
	}
	var botWirePoint = vec3(0.0,0.0,-0.5*height);
	for(var i = 0; i <= 360.0; i+=2*di) {
		var p1 = polarToCartesian2D(radius,i,-0.5*height);
		var p2 = polarToCartesian2D(radius,i+di,-0.5*height);
		this.wire.botPoints.push( botWirePoint, p1, p2 );
	}
	var topWirePoint = vec3(0.0,0.0,0.5*height);
	for(var i = 0; i <= 360.0; i+=2*di) {
		var p1 = polarToCartesian2D(radius,i-di,0.5*height); // this is the opposite of bottom (i-di)
		var p2 = polarToCartesian2D(radius,i,0.5*height);
		this.wire.topPoints.push( topWirePoint, p1, p2 );
	}
}

// --- End: Cylinder Class --- //


// --- Begin: Cone Class --- //

var Cone = function(id) { Object3D.call(this, id, "Cone"); }
Cone.prototype = Object.create(Object3D.prototype);
Cone.prototype.constructor = Cone;

Cone.prototype.createPoints = function() {
	var steps = 12.0;
	var height = 2.0;
	var di = 360.0/steps;
	var dk = height/steps;
	var radius = 1.0;
	var EPSILON = 0.5*dk;

	// Triangle Points
	for (var k = -0.5*height+dk; k < 0.5*height-EPSILON; k+=dk) {
		var kCurve = { start: this.solid.points.length, size: 0 };
		for (var i = 0.0; i <= 360.0; i+=di) {
			var p1 = polarToCartesianCone(radius,i,k, height);
			var p2 = polarToCartesianCone(radius,i,k+dk, height);
			
			kCurve.size+=2;
			this.solid.points.push( p1, p2 );
		}
		this.solid.curves.push( kCurve );
	}
	var botPoint = vec3(0.0,0.0,-0.5*height);
	this.solid.botPoints = [botPoint];
	for(var i = 0; i <= 360.0; i+=di) {
		var p1 = polarToCartesianCone(radius,i,-0.5*height+dk, height);
		this.solid.botPoints.push(p1);
	}
	var topPoint = vec3(0.0,0.0,0.5*height);
	this.solid.topPoints = [topPoint];
	for(var i = 0; i <= 360.0; i+=di) {
		var p1 = polarToCartesianCone(radius,i,0.5*height, height);
		this.solid.topPoints.push(p1);
	}

	//Wire Points
	for (var k = -0.5*height+dk; k < 0.5*height-EPSILON; k+=dk) {
		var kWireCurve = { start: this.wire.points.length, size: 0 };
		for (var i = 0.0; i <= 360.0; i+=2*di) {
			var p1 = polarToCartesianCone(radius,i,k, height);
			var p2 = polarToCartesianCone(radius,i,k+dk, height);
			var p3 = polarToCartesianCone(radius,i+di,k+dk, height);
			var p4 = polarToCartesianCone(radius,i+di,k, height);
			
			kWireCurve.size+=4;
			this.wire.points.push( p1, p2, p3, p4 );
		}
		this.wire.curves.push( kWireCurve );
	}
	var botWirePoint = vec3(0.0,0.0,-0.5*height);
	for(var i = 0; i <= 360.0; i+=2*di) {
		var p1 = polarToCartesianCone(radius,i,-0.5*height+dk, height);
		var p2 = polarToCartesianCone(radius,i+di,-0.5*height+dk, height);
		this.wire.botPoints.push( botWirePoint, p1, p2 );
	}
	var topWirePoint = vec3(0.0,0.0,0.5*height);
	for(var i = 0; i <= 360.0; i+=2*di) {
		var p1 = polarToCartesianCone(radius,i-di,0.5*height, height); // this is the opposite of bottom (i-di)
		var p2 = polarToCartesianCone(radius,i,0.5*height, height);
		this.wire.topPoints.push( topWirePoint, p1, p2 );
	}
}

// --- End: Cone Class --- //


// -- Begin: GUI -- //

function setupGUI() {
	var effectController = {
		newAddSphere: addSphere,
		newAddCylinder: addCylinder,
		newAddCone: addCone,
		newActiveIndex: activeIndex,
		newTranslateX: 0.0,
		newTranslateY: 0.0,
		newTranslateZ: 0.0,
		newRotateX: 0.0,
		newRotateY: 0.0,
		newRotateZ: 0.0,
		newScaleX: 1.0,
		newScaleY: 1.0,
		newScaleZ: 1.0,
		newUndo: undoAdd,
		newOutputToConsole: outputToConsole,
		newRenderActiveOnly: bRenderActiveOnly
	};

	var gui = new dat.GUI();
	var f0 = gui.addFolder('Add');
	function addSphere() {
		geomObjects.push( new Sphere(geomObjects.length) );
		updateActiveIndexControl();
		bUpdate = true;
	}
	function addCylinder() {
		geomObjects.push( new Cylinder(geomObjects.length) );
		updateActiveIndexControl();
		bUpdate = true;
	}
	function addCone() {
		geomObjects.push( new Cone(geomObjects.length) );
		updateActiveIndexControl();
		bUpdate = true;
	}
	function undoAdd() {
		geomObjects.pop();
		updateActiveIndexControl();
		bUpdate = true;
	}
	f0.add(effectController, "newAddSphere").name("Add Sphere");
	f0.add(effectController, "newAddCylinder").name("Add Cylinder");
	f0.add(effectController, "newAddCone").name("Add Cone");
	var f1 = gui.addFolder('Current');
	function updateActiveIndexControl() {
		f1.remove(activeIndexControl);
		activeIndexControl = f1.add(effectController, 'newActiveIndex', geomObjects).name("Active Element").listen().onChange(activeElementOnChange);
		
		effectController.newActiveIndex = geomObjects.length-1;
		activeElementOnChange(null);
	}
	function activeElementOnChange(value) {
		if (effectController.newActiveIndex !== activeIndex) {
			activeIndex = effectController.newActiveIndex;

			effectController.newTranslateX = (activeIndex == -1) ? (0.0) : geomObjects[activeIndex].ui.translate[0];
			effectController.newTranslateY = (activeIndex == -1) ? (0.0) : geomObjects[activeIndex].ui.translate[1];
			effectController.newTranslateZ = (activeIndex == -1) ? (0.0) : geomObjects[activeIndex].ui.translate[2];
			effectController.newRotateX = (activeIndex == -1) ? (0.0) : geomObjects[activeIndex].ui.rotate[0];
			effectController.newRotateY = (activeIndex == -1) ? (0.0) : geomObjects[activeIndex].ui.rotate[1];
			effectController.newRotateZ = (activeIndex == -1) ? (0.0) : geomObjects[activeIndex].ui.rotate[2];
			effectController.newScaleX = (activeIndex == -1) ? (1.0) : geomObjects[activeIndex].ui.scale[0];
			effectController.newScaleY = (activeIndex == -1) ? (1.0) : geomObjects[activeIndex].ui.scale[1];
			effectController.newScaleZ = (activeIndex == -1) ? (1.0) : geomObjects[activeIndex].ui.scale[2];

			if (bRenderActiveOnly)
				bUpdate = true;
		}
	}
	var activeIndexControl = f1.add(effectController, 'newActiveIndex', geomObjects).name("Active Element").listen().onChange(activeElementOnChange);
	var f2 = gui.addFolder('Edit');
	f2.add( effectController, 'newTranslateX', -1.0, 1.0).step(0.1).name('TranslateX').listen().onChange(function(value) {
		if (effectController.newTranslateX !== geomObjects[activeIndex].ui.translate[0]) {
			geomObjects[activeIndex].translate(0, effectController.newTranslateX);
			bUpdate = true;
		}
	});
	f2.add( effectController, 'newTranslateY', -1.0, 1.0).step(0.1).name('TranslateY').listen().onChange(function(value) {
		if (effectController.newTranslateY !== geomObjects[activeIndex].ui.translate[1]) {
			geomObjects[activeIndex].translate(1, effectController.newTranslateY);
			bUpdate = true;
		}
	});
	f2.add( effectController, 'newTranslateZ', -1.0, 1.0).step(0.1).name('TranslateZ').listen().onChange(function(value) {
		if (effectController.newTranslateZ !== geomObjects[activeIndex].ui.translate[2]) {
			geomObjects[activeIndex].translate(2, effectController.newTranslateZ);
			bUpdate = true;
		}
	});
	f2.add( effectController, 'newRotateX', -180.0, 180.0).step(1.0).name('RotateX').listen().onChange(function(value) {
		if (effectController.newRotateX !== geomObjects[activeIndex].ui.rotate[0]) {
			geomObjects[activeIndex].rotate(0, effectController.newRotateX);
			bUpdate = true;
		}
	});
	f2.add( effectController, 'newRotateY', -180.0, 180.0).step(1.0).name('RotateY').listen().onChange(function(value) {
		if (effectController.newRotateY !== geomObjects[activeIndex].ui.rotate[1]) {
			geomObjects[activeIndex].rotate(1, effectController.newRotateY);
			bUpdate = true;
		}
	});
	f2.add( effectController, 'newRotateZ', -180.0, 180.0).step(1.0).name('RotateZ').listen().onChange(function(value) {
		if (effectController.newRotateZ !== geomObjects[activeIndex].ui.rotate[2]) {
			geomObjects[activeIndex].rotate(2, effectController.newRotateZ);
			bUpdate = true;
		}
	});
	f2.add( effectController, 'newScaleX', 0.0, 2.0).step(0.1).name('ScaleX').listen().onChange(function(value) {
		if (effectController.newScaleX !== geomObjects[activeIndex].ui.scale[0]) {
			geomObjects[activeIndex].scale(0, effectController.newScaleX);
			bUpdate = true;
		}
	});
	f2.add( effectController, 'newScaleY', 0.0, 2.0).step(0.1).name('ScaleY').listen().onChange(function(value) {
		if (effectController.newScaleY !== geomObjects[activeIndex].ui.scale[1]) {
			geomObjects[activeIndex].scale(1, effectController.newScaleY);
			bUpdate = true;
		}
	});
	f2.add( effectController, 'newScaleZ', 0.0, 2.0).step(0.1).name('ScaleZ').listen().onChange(function(value) {
		if (effectController.newScaleZ !== geomObjects[activeIndex].ui.scale[2]) {
			geomObjects[activeIndex].scale(2, effectController.newScaleZ);
			bUpdate = true;
		}
	});
	var f3 = gui.addFolder('Extras');
	f3.add(effectController, "newUndo").name("Undo Add");
	f3.add(effectController, "newOutputToConsole").name("Console Print");
	f3.add( effectController, "newRenderActiveOnly").name("Active Only").onChange(function(value) {
		if (effectController.newRenderActiveOnly != bRenderActiveOnly) {
			bRenderActiveOnly = effectController.newRenderActiveOnly;
			bUpdate = true;
		}
	});

	f0.open();
	f1.open();
	f2.open();
	f3.open();
}

function outputToConsole() {
	for (var i = 0; i < geomObjects.length; i++) {
		console.log( geomObjects[i].debugString() );
	}
}

// -- End: GUI -- //

var gl;
var geomObjects = [];
var bUpdate = true;
var activeIndex = -1;
var bRenderActiveOnly = false;

window.onload = function init() {
	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	gl.program = initShadersFromSource(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	gl.program2 = initShadersFromSource(gl, VSHADER_SOURCE2, FSHADER_SOURCE2);
	gl.useProgram(gl.program);

	setupGUI();
	setupData();
	requestAnimFrame(updateAndRender);
}

function setupData() {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
}

function updateAndRender() {
	if (!bUpdate) {
		requestAnimFrame(updateAndRender);
		return;
	}

	bUpdate = false;
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	if (!bRenderActiveOnly) {
		for (var i = 0; i < geomObjects.length; i++) {
			geomObjects[i].update();
			geomObjects[i].render();
		}
	} else {
		geomObjects[activeIndex].update();
		geomObjects[activeIndex].render();
	}
	requestAnimFrame(updateAndRender);
}

function polarToCartesian(radius, theta, phi) {
	var x = radius*Math.cos(radians(theta))*Math.sin(radians(phi));
	var y = radius*Math.sin(radians(theta))*Math.sin(radians(phi));
	var z = radius*Math.cos(radians(phi));
	return vec3(x,y,z);
}

function polarToCartesian2D(radius, theta, height) {
	var x = radius*Math.cos(radians(theta));
	var y = radius*Math.sin(radians(theta));
	var z = height;
	return vec3(x,y,z);
}

function polarToCartesianCone(radius, theta, currentHeight, totalHeight) {
	var heightRatio = (currentHeight+0.5*totalHeight)/totalHeight;
	var x = heightRatio*radius*Math.cos(radians(theta));
	var y = heightRatio*radius*Math.sin(radians(theta));
	var z = currentHeight;
	return vec3(x,y,z);
}

