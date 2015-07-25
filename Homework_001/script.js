// script.js

var gl;
var points;

var effectController;
var radius = 1.0;
var subdivide = 4;
var isGasket = false;
var angle = 30; //degrees
var isTwist = true;
var isFan = false;
var sides = 3;

var u_Theta;
var u_TwistOn;

window.onload = function() {
	setupGui();

	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	var program = initShadersFromSource(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	gl.useProgram(program);
	setupData(program);
	update();
}

function setupGui() {
	effectController = {
		newRadius: radius,
		newSubdivide: subdivide,
		newIsGasket: isGasket,
		newAngle: angle,
		newIsTwist: isTwist,
		newIsFan: isFan,
		newSides: sides
	};

	var gui = new dat.GUI();
	gui.add( effectController, "newRadius", 0.1, 1.0).step(0.1).name("Radius").onChange(function(value){
		if(effectController.newRadius != radius) {
			radius = effectController.newRadius;
			update();
		}
	});
	gui.add( effectController, "newSubdivide", 0, 7).step(1.0).name("Subdivisions").onChange(function(value){
		if(effectController.newSubdivide != subdivide) {
			subdivide = effectController.newSubdivide;
			update();
		}
	});
	gui.add( effectController, "newIsGasket").name("Gasket").onChange(function(value) {
		if (effectController.newIsGasket != isGasket) {
			isGasket = effectController.newIsGasket;
			update();
		}
	});
	gui.add( effectController, "newAngle", -180, 180).step(1.0).name("Rotation (degrees)").onChange(function(value){
		if(effectController.newAngle != angle) {
			angle = effectController.newAngle;
			update();
		}
	});
	gui.add( effectController, "newIsTwist").name("Twist").onChange(function(value) {
		if (effectController.newIsTwist != isTwist) {
			isTwist = effectController.newIsTwist;
			update();
		}
	});
	gui.add( effectController, "newIsFan").name("Fan").listen().onChange(function(value) {
		if (effectController.newIsFan != isFan) {
			if (sides > 3) effectController.newSides = sides = 3;
			isFan = effectController.newIsFan;
			update();
		}
	});
	gui.add( effectController, "newSides", 3, 8).step(1).name("Sides").listen().onChange(function(value){
		if(effectController.newSides != sides) {
			if (!isFan) effectController.newIsFan = isFan = true;
			sides = effectController.newSides;
			update();
		}
	});

}

function setupData(program) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	
	var bufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	gl.bufferData(gl.ARRAY_BUFFER, 5242880, gl.STATIC_DRAW);
	
	var a_Position = gl.getAttribLocation(program, "a_Position");
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
	
	u_Theta = gl.getUniformLocation(program, "u_Theta");
	
	u_TwistOn = gl.getUniformLocation(program, "u_TwistOn");
}

function calcInitPoints(sides) {
	var retList = [];
	var angle_delta = 360.0/sides;
	var x0 = 0.0;
	var y0 = radius;

	for (var i = 0; i < sides; i++) {
		var _theta = radians(angle_delta*i);
		var xi = x0*Math.cos(_theta)-y0*Math.sin(_theta);
		var yi = x0*Math.sin(_theta)+y0*Math.cos(_theta);
		retList.push( vec2(xi,yi) );
	}

	return retList;
}

function calcInitFanPoints(sides) {
	var retList = [];
	var angle_delta = 360.0/sides;
	
	var xc = 0.0;
	var yc = 0.0;
	var x0 = 0.0;
	var y0 = radius;

	var xi, yi;
	for (var j = 0; j <= sides; j++) {
		var _theta = radians(angle_delta*j);
		var xj = x0*Math.cos(_theta)-y0*Math.sin(_theta);
		var yj = x0*Math.sin(_theta)+y0*Math.cos(_theta);
		
		if (xi !== undefined && yi !==undefined) 
			retList.push( vec2(xc,yc), vec2(xi,yi), vec2(xj,yj) );
		
		xi = xj;
		yi = yj;
	}

	return retList;
}

function calculatePoints(divide, a, b, c) {
	if (divide == 0) {
		points.push(a, b, c);
		return;
	}

	var ab = add(a, scale(0.5, subtract(b,a)));
	var bc = add(b, scale(0.5, subtract(c,b)));
	var ca = add(c, scale(0.5, subtract(a,c)));

	divide--;
	calculatePoints( divide, ca, bc, c  );
	calculatePoints( divide, a,  ab, ca );
	if (!isGasket) calculatePoints(divide, bc, ca, ab);
	calculatePoints( divide, ab, b,  bc );
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

function update() {
	points = [];
	if (!isFan) {
		var initPoints = calcInitPoints(sides);
		calculatePoints(subdivide, initPoints[0], initPoints[1], initPoints[2]);
	} else {
		var initPoints = calcInitFanPoints(sides);
		for (var ii = 0; ii < initPoints.length; ii+=3)
			calculatePoints(subdivide, initPoints[ii+0], initPoints[ii+1], initPoints[ii+2]);
	}
	
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
	gl.uniform1f(u_Theta, angle);
	gl.uniform1f(u_TwistOn, isTwist);
	
	render();
}