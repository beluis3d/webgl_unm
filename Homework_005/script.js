// script.js

// --- Begin: Object3D Class --- //

var Object3D = function(id, className) {
	this.id = id;
	this.className = (!!className) ? className : "Object3D";

	this.si1 = { // shader inputs for program1
		a_Transformation: undefined,    // shader field for model/view transformation or light location
	};

	this.si2 = { //shader inputs for program2
		a_Transformation: undefined     // shader field for model/view transformation
	};

	this.tp = { // transformation properties
		transform: mat4(),
		translate: mat4(),
		rotate: mat4(),
		scale: mat4()
	};

	this.ui = {
		translate: vec3(0.0, 0.0, 0.0),
		rotate: vec3(0.0, 0.0, 0.0),
		scale: vec3(1.0, 1.0, 1.0)
	};
}

Object3D.prototype.toString = function() {
	return this.id;
}

// --- End: Object3D Class --- //

// --- Begin: Light Class --- //

var Light = function(id, className) {
	Object3D.call(this, id, (!!className) ? className : "Light");

	//this.si1 = {
		this.si1.u_LightColor = undefined;
		this.si1.u_AttenuationOn = undefined;
		//u_LightLocation: undefined
	//};

	this.lp = { //lightProperties
		color: vec3()
	};

	//this.ui = {
		this.ui.color = vec3();
		//location: vec3(),
		this.ui.bOn = true;			// is the light on?
	//};

}

Light.prototype = Object.create(Object3D.prototype);
Light.prototype.constructor = Light;

Light.prototype.translate = function(axis, value) { 
	this.ui.translate[axis] = value;
	// no need to change/use the transformation matrix
}

Light.prototype.updateColorVector = function() {
	this.lp.color = scale((this.ui.bOn ? 1.0 : 0.0), this.ui.color);
}

// --- End: Light Class --- //

// --- Begin: Camera Class --- //

var Camera = function(id, className) {
	Object3D.call(this, id, (!!className) ? className : "Camera");

	//this.si1 = { // shader inputs for program1
		//a_Transformation: undefined,       // shader field for view transformation
		this.si1.a_Projection = undefined;   // shader field for projection transformation
	//};

	//this.si2 = { // shader inputs for program2
		//a_Transformation: undefined,       // shader field for view transformation
		this.si2.a_Projection = undefined;   // shader field for projection transformation
	//};

	//this.tp = { // transformation properties
	//	transform: mat4(),		// the collection of view transformations (translate, & rotate)
	//	translate: mat4(),
	//	rotate: mat4()
		this.tp.projection = mat4();
	//};

	//this.ui = {
		//translate: vec3(0.0, 0.0, 0.0),
		//rotate: vec3(0.0, 0.0, 0.0),
		this.ui.left = -1.0;
		this.ui.right = 1.0;
		this.ui.bottom = -1.0;
		this.ui.top = 1.0;
		this.ui.fovy = 45.0; //degrees
		this.ui.aspect = 1.0; // width/height
		this.ui.near = -1.0;
		this.ui.far = 1.0;
		this.ui.isPerspective = false;
	//};

}

Camera.prototype = Object.create(Object3D.prototype);
Camera.prototype.constructor = Camera;

Camera.prototype.translate = function(axis, value) { 
	this.ui.translate[axis] = value;
	this.tp.translate = translate(-this.ui.translate[0], -this.ui.translate[1], -this.ui.translate[2]); 
}

Camera.prototype.rotate = function(axis, value) {
	this.ui.rotate[axis] = value;
	var _x = rotate(-this.ui.rotate[0], 1.0, 0.0, 0.0);
	var _y = rotate(-this.ui.rotate[1], 0.0, 1.0, 0.0);
	var _z = rotate(-this.ui.rotate[2], 0.0, 0.0, 1.0); 
	this.tp.rotate = mult(_z, mult(_y, _x));
}

Camera.prototype.updateViewMatrix = function() {
	this.tp.transform = mult(this.tp.translate, this.tp.rotate);
}

Camera.prototype.updateProjectionMatrix = function() {
	var canvas = document.getElementById("gl-canvas");
	this.tp.projection = (this.ui.isPerspective) ? 
		perspective(this.ui.fovy, canvas.width / canvas.height, this.ui.near, this.ui.far) : 
		ortho(this.ui.left, this.ui.right, this.ui.bottom, this.ui.top, this.ui.near, this.ui.far) ;
}

// --- End: Camera Class --- //


// --- Begin: Mesh Class --- //

var Mesh = function(id, className, camera, lights) {
	Object3D.call(this, id, (!!className) ? className : "Mesh");
	this.camera = camera;
	this.lights = lights;

	this.solid = {
		curves: [],
		points: [],
		botPoints: [],
		topPoints: []
	};

	this.faces = []; // each element has three vertices of vec3
	this.faceNormals = []; // each element is a vec3 normal of a face
	this.botFaces = [];
	this.botFaceNormals = [];
	this.topFaces = [];
	this.topFaceNormals = [];
	this.materialColor = vec3(Math.random(), Math.random(), Math.random());

	this.sphereTexels = [];
	this.botSphereTexels = [];
	this.topSphereTexels = [];

	this.planeTexels = [];
	this.botPlaneTexels = [];
	this.topPlaneTexels = [];

	this.wire = {
		curves: [],
		points: [],
		botPoints: [],
		topPoints: []	
	};

	//this.si1 = { // shader inputs
		//a_Transformation: undefined,   // shader field for model transformation
		this.si1.vBufferId = undefined;  // shader buffer for the points		
		this.si1.nBufferId = undefined;  // shader buffer for the normals
		this.si1.tBufferId = undefined;  // shader buffer for the texels
		this.si1.a_Location = undefined; // shader field for location of vertex	
		this.si1.a_Normal = undefined;   // shader field for normal of the vertex
		this.si1.a_Texel = undefined;    // shader field for texel of the vertex
		this.si1.a_NormalMatrix = undefined; // shader field for normal transformation
		this.si1.u_MaterialColor = undefined; // shader field for material color
	//};
	
	//this.si2 = { // shader inputs for program2
		//a_Transformation: undefined,   // shader field for model transformation
		this.si2.wBufferId = undefined;  // shader buffer for the wireframes
		this.si2.a_Location = undefined; // shader field for location of vertex
	//};

	//this.tp = { // transformation properties
		//transform: mat4(),   		 // the collection of model transformations (translate, rotate, & scale)
		this.tp.normal = mat4();     // the normal matrix (aka, the inverse transpose of the model matrix)
		//translate: mat4(),
		//rotate: mat4(),
		//scale: mat4()
	//};

	this.setupData();
	this.createPoints(); 
	//this.createNormals();
}

Mesh.prototype = Object.create(Object3D.prototype);
Mesh.prototype.constructor = Mesh;

Mesh.prototype.setupData = function() {
	this.si1.vBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si1.vBufferId);
	this.si1.a_Location = gl.getAttribLocation(gl.program, "a_Location");
	gl.vertexAttribPointer(this.si1.a_Location, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.si1.a_Location);
	
	this.si2.wBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si2.wBufferId);
	this.si2.a_Location = gl.getAttribLocation(gl.program2, "a_Location");
	gl.vertexAttribPointer(this.si2.a_Location, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.si2.a_Location);
	
	this.si1.nBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si1.nBufferId);
	this.si1.a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
	gl.vertexAttribPointer(this.si1.a_Normal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.si1.a_Normal);

	this.si1.tBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si1.tBufferId);
	this.si1.a_Texel = gl.getAttribLocation(gl.program, "a_Texel");
	gl.vertexAttribPointer(this.si1.a_Texel, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(this.si1.a_Texel);

	this.si1.a_Transformation = gl.getUniformLocation(gl.program, "a_Model");
	this.si2.a_Transformation = gl.getUniformLocation(gl.program2, "a_Model");

	this.camera.si1.a_Transformation = gl.getUniformLocation(gl.program, "a_View");
	this.camera.si2.a_Transformation = gl.getUniformLocation(gl.program2, "a_View");

	this.camera.si1.a_Projection = gl.getUniformLocation(gl.program, "a_Projection");
	this.camera.si2.a_Projection = gl.getUniformLocation(gl.program2, "a_Projection");

	this.si1.a_NormalMatrix = gl.getUniformLocation(gl.program, "a_NormalMatrix");

	this.si1.u_MaterialColor = gl.getUniformLocation(gl.program, "u_MaterialColor");

	for (var i = 0; i < this.lights.length; i++) {
		this.lights[i].si1.u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
		this.lights[i].si1.u_AttenuationOn = gl.getUniformLocation(gl.program, "u_AttenuationOn");
		this.lights[i].si1.a_Transformation = gl.getUniformLocation(gl.program, "u_LightLocation");
	}

	this.initTextureCheckerboard();//this.initTexture("Homework_005/moon.gif");//
}

Mesh.prototype.translate = function(axis, value) { 
	this.ui.translate[axis] = value;
	this.tp.translate = translate(this.ui.translate[0], this.ui.translate[1], this.ui.translate[2]); 
}

Mesh.prototype.rotate = function(axis, value) {
	this.ui.rotate[axis] = value;
	var _x = rotate(this.ui.rotate[0], 1.0, 0.0, 0.0);
	var _y = rotate(this.ui.rotate[1], 0.0, 1.0, 0.0);
	var _z = rotate(this.ui.rotate[2], 0.0, 0.0, 1.0); 
	this.tp.rotate = mult(_z, mult(_y, _x));
}

Mesh.prototype.scale = function(axis, value) {
	this.ui.scale[axis] = value; 
	this.tp.scale = scalem(this.ui.scale[0], this.ui.scale[1], this.ui.scale[2]);
}

Mesh.prototype.updateModelMatrix = function() {
	this.tp.transform = mult(this.tp.translate, mult(this.tp.rotate, this.tp.scale));
}

Mesh.prototype.updateNormalMatrix = function() {
	this.tp.normal = normalMatrix(this.tp.transform);
}

Mesh.prototype.update = function() {
	this.updateModelMatrix();
	this.camera.updateViewMatrix();
	this.camera.updateProjectionMatrix();
	this.updateNormalMatrix();
	for (var  i = 0; i < this.lights.length; i++) {
		this.lights[i].updateColorVector();
	}
	
	

	//---
	
}

Mesh.prototype.render = function() {
	gl.useProgram(gl.program);
	//---
	var allSolidPoints = this.solid.points.concat(this.solid.botPoints).concat(this.solid.topPoints);
	var allFaceNormals = this.faceNormals.concat(this.botFaceNormals).concat(this.topFaceNormals);
	var allSphereTexels = (bApplyPlaneMapping) ? this.planeTexels : this.sphereTexels.concat(this.botSphereTexels).concat(this.topSphereTexels);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si1.vBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(allSolidPoints), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si1.nBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(allFaceNormals), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si1.tBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(allSphereTexels), gl.STATIC_DRAW);
	
	gl.uniformMatrix4fv( this.si1.a_Transformation, false, flatten(this.tp.transform) ); // Model Matrix
	gl.uniformMatrix4fv( this.camera.si1.a_Transformation, false, flatten(this.camera.tp.transform) ); // View Matrix
	gl.uniformMatrix4fv( this.camera.si1.a_Projection, false, flatten(this.camera.tp.projection) ); // Projection Matrix
	gl.uniformMatrix4fv( this.si1.a_NormalMatrix, false, flatten(this.tp.normal) ); // Normal Matrix

	gl.uniform4f(this.si1.u_MaterialColor, this.materialColor[0], this.materialColor[1], this.materialColor[2], 1.0);
	
	var lightColors = [];
	var lightLocations = [];
	for (var i = 0; i < this.lights.length; i++) {
		lightColors.push(this.lights[i].lp.color);
		lightLocations.push(this.lights[i].ui.translate); // taken straight out of ui, since only need translate
	}
	var u_LightColor = this.lights[0].si1.u_LightColor; 
	var u_AttenuationOn = this.lights[0].si1.u_AttenuationOn;
	var u_LightLocation = this.lights[0].si1.a_Transformation;
	gl.uniform3fv(u_LightColor, flatten(lightColors));
	gl.uniform1f(u_AttenuationOn, bAttenuationOn ? 1.0 : 0.0);
	gl.uniform3fv(u_LightLocation, flatten(lightLocations));
	//---
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si1.vBufferId);
	gl.vertexAttribPointer(this.si1.a_Location, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si1.nBufferId);
	gl.vertexAttribPointer(this.si1.a_Normal, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si1.tBufferId);
	gl.vertexAttribPointer(this.si1.a_Texel, 2, gl.FLOAT, false, 0, 0);
	for (var i = 0; i < this.solid.curves.length; i++) {
		gl.drawArrays(gl.TRIANGLE_STRIP, this.solid.curves[i].start, this.solid.curves[i].size);	
	}
	gl.drawArrays(gl.TRIANGLE_FAN, this.solid.points.length, this.solid.botPoints.length);
	gl.drawArrays(gl.TRIANGLE_FAN, this.solid.points.length+this.solid.botPoints.length, this.solid.topPoints.length);


	if (!bWireframesOn) {return;}
	gl.useProgram(gl.program2);
	//---
	var allWirePoints = this.wire.points.concat(this.wire.botPoints).concat(this.wire.topPoints);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si2.wBufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(allWirePoints), gl.STATIC_DRAW);

	gl.uniformMatrix4fv( this.si2.a_Transformation, false, flatten(this.tp.transform) ); // Model Matrix
	gl.uniformMatrix4fv( this.camera.si2.a_Transformation, false, flatten(this.camera.tp.transform) ); // View Matrix
	gl.uniformMatrix4fv( this.camera.si2.a_Projection, false, flatten(this.camera.tp.projection) ); // Projection Matrix
	//---
	gl.bindBuffer(gl.ARRAY_BUFFER, this.si2.wBufferId);
	gl.vertexAttribPointer(this.si2.a_Location, 3, gl.FLOAT, false, 0, 0);
	for (var i = 0; i < this.wire.curves.length; i++) {
		gl.drawArrays(gl.LINE_STRIP, this.wire.curves[i].start, this.wire.curves[i].size);	
	}
	gl.drawArrays(gl.LINE_STRIP, this.wire.points.length, this.wire.botPoints.length);
	gl.drawArrays(gl.LINE_STRIP, this.wire.points.length+this.wire.botPoints.length, this.wire.topPoints.length);
}

Mesh.prototype.debugString = function() {
	return this._debugString(this, "");
}

Mesh.prototype._debugString = function(obj, indent) {
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

Mesh.prototype.createNormals = function() {
	for (var k = 0; k < this.solid.curves.length; k++) {
		var kCurve = this.solid.curves[k];
		for (var i = 0; i < kCurve.size; i++) {
			var ind0 = ((i+0)%kCurve.size) + kCurve.start;
			var ind1 = ((i+1)%kCurve.size) + kCurve.start;
			var ind2 = ((i+2)%kCurve.size) + kCurve.start;

			this.faces.push([
				this.solid.points[ind0],
				this.solid.points[ind1],
				this.solid.points[ind2]]);
		}
	}
	var botPoint = this.solid.botPoints[0];
	this.botFaces.push([
		this.solid.botPoints[3],
		this.solid.botPoints[1],
		this.solid.botPoints[2]]); // flat face for botVertex
	for (var i = 0; i < this.solid.botPoints.length-1; i++) {
		var ind0 = ((i+0)%(this.solid.botPoints.length-1)) + 1;
		var ind1 = ((i+1)%(this.solid.botPoints.length-1)) + 1;
		this.botFaces.push([
			botPoint,
			this.solid.botPoints[ind0],
			this.solid.botPoints[ind1]]);
	}
	var topPoint = this.solid.topPoints[0];
	this.topFaces.push([
		this.solid.topPoints[3],
		this.solid.topPoints[1],
		this.solid.topPoints[2]]); // flat face for topVertex
	for (var i = 0; i < this.solid.topPoints.length-1; i++) {
		var ind0 = ((i+0)%(this.solid.topPoints.length-1)) + 1;
		var ind1 = ((i+1)%(this.solid.topPoints.length-1)) + 1;
		this.topFaces.push([
			topPoint,
			this.solid.topPoints[ind0],
			this.solid.topPoints[ind1]]);
	}


	for (var ii = 0; ii < this.faces.length; ii++) {
		var iFace = this.faces[ii];
		var vecA = subtract(iFace[0], iFace[1]);
		var vecB = subtract(iFace[2], iFace[1]);
		var iNormal = normalize( cross(vecA, vecB) );
		if (ii%2 == 1) iNormal = negate(iNormal);
		this.faceNormals.push(iNormal);
	}
	for (var ii = 0; ii < this.botFaces.length; ii++) {
		var iFace = this.botFaces[ii];
		var vecA = subtract(iFace[2], iFace[1]);
		var vecB = subtract(iFace[0], iFace[1]);
		var iNormal = normalize( cross(vecA, vecB) );
		iNormal = negate(iNormal);
		this.botFaceNormals.push(iNormal);
	}
	for (var ii = 0; ii < this.topFaces.length; ii++) {
		var iFace = this.topFaces[ii];
		var vecA = subtract(iFace[2], iFace[1]);
		var vecB = subtract(iFace[0], iFace[1]);
		var iNormal = normalize( cross(vecA, vecB) );
		// no need to negate here
		this.topFaceNormals.push(iNormal);
	}
}

// --- End: Mesh Class --- //


// --- Begin: Sphere Class --- //

var Sphere = function(id, camera, lights) { Mesh.call(this, id, "Sphere", camera, lights); }
Sphere.prototype = Object.create(Mesh.prototype);
Sphere.prototype.constructor = Sphere;

Sphere.prototype.createPoints = function() {
	var steps = 48.0;
	var di = 360.0/steps;
	var dk = 180.0/steps;
	var radius = 1.0;

	// Triangle Points
	for (var k = 180.0-0.0; k > 0.0+0.0; k-=dk) {//for (var k = 180.0-dk; k > 0.0+dk; k-=dk) {
		var kCurve = { start: this.solid.points.length, size: 0 };
		for (var i = 0.0; i <= 360.0; i+=di) {
			var p1 = polarToCartesian(radius,i,k);
			var p2 = polarToCartesian(radius,i,k-dk);
			var n1 = polarToCartesianNormal(i,k);
			var n2 = polarToCartesianNormal(i,k-dk);
			var t1 = polarToTexel(i,k);
			var t2 = polarToTexel(i,k-dk);
			var tp1 = vec2(n1[0], n1[1]);
			var tp2 = vec2(n2[0], n2[1]);
			
			kCurve.size+=2;
			this.solid.points.push( p1, p2 );
			this.faceNormals.push( n1, n2 );
			this.sphereTexels.push( t1, t2 );
			this.planeTexels.push( tp1, tp2 );
		}
		this.solid.curves.push( kCurve );
	}
	this.solid.botPoints = [];
	this.botFaceNormals = [];
	this.botSphereTexels = [];
	this.solid.topPoints = [];
	this.topFaceNormals = [];
	this.topSphereTexels = [];

	this.botPlaneTexels = []; // TODO: add this to below
	this.topPlaneTexels = []; // TODO: add this to below
	/*
	var botPoint = polarToCartesian(radius,0.0,180.0);
	this.solid.botPoints = [botPoint];
	var botNormal = polarToCartesianNormal(0.0,180.0);
	this.botFaceNormals = [botNormal];
	var botTexel = polarToTexel(0.0,180.0);
	this.botSphereTexels = [botTexel];
	for(var i = 0; i <= 360.0; i+=di) {
		var p1 = polarToCartesian(radius,i,180.0-dk);
		this.solid.botPoints.push(p1);
		var n1 = polarToCartesianNormal(i,180.0-dk);
		this.botFaceNormals.push(n1);
		var t1 = polarToTexel(i,180.0-dk);
		this.botSphereTexels.push(t1);
	}
	var topPoint = polarToCartesian(radius,0.0,0.0);
	this.solid.topPoints = [topPoint];
	var topNormal = polarToCartesianNormal(0.0,0.0);
	this.topFaceNormals = [topNormal];
	var topTexel = polarToTexel(0.0,0.0);
	this.topSphereTexels = [topTexel];
	for(var i = 0; i <= 360.0; i+=di) {
		var p1 = polarToCartesian(radius,i,0.0+dk);
		this.solid.topPoints.push(p1);
		var n1 = polarToCartesianNormal(i,0.0+dk);
		this.topFaceNormals.push(n1);
		var t1 = polarToTexel(i,0.0+dk);
		this.topSphereTexels.push(t1);
	}
	*/


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

Mesh.prototype.initTexture = function(filename) {
    var texture = gl.createTexture();
    var u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
	var fileImage = new Image();

    fileImage.onload = function() {
        loadTexture( texture, u_Sampler, fileImage );
        bUpdate = true;
    };
    fileImage.onerror = function() {
    	console.error('Unable to load image: ' + filename);
    };
    fileImage.src = filename;
}

Mesh.prototype.initTextureCheckerboard = function() {
	var texture = gl.createTexture();
    var u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
	
    var steps = 64;
    var checks = 8;
    var sdc = steps/checks;
	var patternImage = new Uint8Array(4*steps*steps);
    
    for (var i = 0; i < steps; i++) {
        for (var j = 0; j < steps; j++) {
        	var bX = Math.floor(i/sdc) % 2 == 1;
          	var bY = Math.floor(j/sdc) % 2 == 1;

          	if ( (bX&&(!bY)) || ((!bX)&&bY) ) {
            	patternImage[4*i*steps+4*j] = 255;
          		patternImage[4*i*steps+4*j+1] = 0;
          		patternImage[4*i*steps+4*j+2] = 0;
          		patternImage[4*i*steps+4*j+3] = 255;
          	} else {
            	patternImage[4*i*steps+4*j] = 0;
          		patternImage[4*i*steps+4*j+1] = 255;
          		patternImage[4*i*steps+4*j+2] = 0;
          		patternImage[4*i*steps+4*j+3] = 255;
          	}
        }
    }

    loadTexture(texture, u_Sampler, patternImage, steps);
}

var loadTexture = function(texture, u_Sampler, image, steps) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	if (steps === undefined)
    	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
	else
    	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, steps, steps, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler, 0);
}

// --- End: Sphere Class --- //


// --- Begin: Cylinder Class --- //

var Cylinder = function(id, camera, lights) { Mesh.call(this, id, "Cylinder", camera, lights); }
Cylinder.prototype = Object.create(Mesh.prototype);
Cylinder.prototype.constructor = Cylinder;

Cylinder.prototype.createPoints = function() {
	// TODO: create normals here
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

var Cone = function(id, camera, lights) { Mesh.call(this, id, "Cone", camera, lights); }
Cone.prototype = Object.create(Mesh.prototype);
Cone.prototype.constructor = Cone;

Cone.prototype.createPoints = function() {
	//TODO: create normals here
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

var gui = {
	activeIndexControl: null,
	effectController: null,
	datGui: null,
	f0: null,
	f1: null,
	f2: null,
	f3: null
};

function setupGUI() {
	gui.effectController = {
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
		newLightOn: true,
		newUndo: undoAdd,
		newOutputToConsole: outputToConsole,
		newRenderActiveOnly: bRenderActiveOnly,
		newPerspectiveOn: false,
		newLightAnimationOn: true,
		newWireframesOn: false,
		newAttenuationOn: true,
		newApplyTexture: applyTexture,
		newApplyPlaneMapping: applyPlaneMapping
	};

	gui.datGui = new dat.GUI();
	gui.f0 = gui.datGui.addFolder('Textures');
	gui.f0.add(gui.effectController, "newApplyTexture").name("Apply Image File");
	gui.f0.add(gui.effectController, "newApplyPlaneMapping").name("Plane Mapping");
	//gui.f0.add(gui.effectController, "newAddSphere").name("Add Sphere");
	//gui.f0.add(gui.effectController, "newAddCylinder").name("Add Cylinder");
	//gui.f0.add(gui.effectController, "newAddCone").name("Add Cone");
	gui.f1 = gui.datGui.addFolder('Current');
	var activeIndexList = generateActiveIndexList();
	gui.activeIndexControl = gui.f1.add(gui.effectController, 'newActiveIndex', activeIndexList).name("Active Element").listen().onChange(activeElementOnChange);
	gui.f2 = gui.datGui.addFolder('Edit');
	gui.f2.add( gui.effectController, 'newTranslateX', -1.0, 1.0).step(0.1).name('TranslateX').listen().onChange(function(value) {
		if (gui.effectController.newTranslateX !== geomObjects[activeIndex].ui.translate[0]) {
			geomObjects[activeIndex].translate(0, gui.effectController.newTranslateX);
			bUpdate = true;
		}
	});
	gui.f2.add( gui.effectController, 'newTranslateY', -1.0, 1.0).step(0.1).name('TranslateY').listen().onChange(function(value) {
		if (gui.effectController.newTranslateY !== geomObjects[activeIndex].ui.translate[1]) {
			geomObjects[activeIndex].translate(1, gui.effectController.newTranslateY);
			bUpdate = true;
		}
	});
	gui.f2.add( gui.effectController, 'newTranslateZ', -10.0, 10.0).step(0.1).name('TranslateZ').listen().onChange(function(value) {
		if (gui.effectController.newTranslateZ !== geomObjects[activeIndex].ui.translate[2]) {
			geomObjects[activeIndex].translate(2, gui.effectController.newTranslateZ);
			bUpdate = true;
		}
	});
	gui.f2.add( gui.effectController, 'newRotateX', -180.0, 180.0).step(1.0).name('RotateX').listen().onChange(function(value) {
		if (gui.effectController.newRotateX !== geomObjects[activeIndex].ui.rotate[0]) {
			geomObjects[activeIndex].rotate(0, gui.effectController.newRotateX);
			bUpdate = true;
		}
	});
	gui.f2.add( gui.effectController, 'newRotateY', -180.0, 180.0).step(1.0).name('RotateY').listen().onChange(function(value) {
		if (gui.effectController.newRotateY !== geomObjects[activeIndex].ui.rotate[1]) {
			geomObjects[activeIndex].rotate(1, gui.effectController.newRotateY);
			bUpdate = true;
		}
	});
	gui.f2.add( gui.effectController, 'newRotateZ', -180.0, 180.0).step(1.0).name('RotateZ').listen().onChange(function(value) {
		if (gui.effectController.newRotateZ !== geomObjects[activeIndex].ui.rotate[2]) {
			geomObjects[activeIndex].rotate(2, gui.effectController.newRotateZ);
			bUpdate = true;
		}
	});
	gui.f2.add( gui.effectController, 'newScaleX', 0.0, 2.0).step(0.1).name('ScaleX').listen().onChange(function(value) {
		if (gui.effectController.newScaleX !== geomObjects[activeIndex].ui.scale[0]) {
			geomObjects[activeIndex].scale(0, gui.effectController.newScaleX);
			bUpdate = true;
		}
	});
	gui.f2.add( gui.effectController, 'newScaleY', 0.0, 2.0).step(0.1).name('ScaleY').listen().onChange(function(value) {
		if (gui.effectController.newScaleY !== geomObjects[activeIndex].ui.scale[1]) {
			geomObjects[activeIndex].scale(1, gui.effectController.newScaleY);
			bUpdate = true;
		}
	});
	gui.f2.add( gui.effectController, 'newScaleZ', 0.0, 2.0).step(0.1).name('ScaleZ').listen().onChange(function(value) {
		if (gui.effectController.newScaleZ !== geomObjects[activeIndex].ui.scale[2]) {
			geomObjects[activeIndex].scale(2, gui.effectController.newScaleZ);
			bUpdate = true;
		}
	});
	gui.f2.add( gui.effectController, 'newLightOn' ).name("Light On").listen().onChange(function(value) {
		if ( gui.effectController.newLightOn != geomObjects[activeIndex].ui.bOn ) {
			geomObjects[activeIndex].ui.bOn = gui.effectController.newLightOn;
			bUpdate = true;
		}
	});
	gui.f3 = gui.datGui.addFolder('Extras');
	//gui.f3.add(gui.effectController, "newUndo").name("Undo Add");
	gui.f3.add(gui.effectController, "newOutputToConsole").name("Console Print");
	gui.f3.add( gui.effectController, "newRenderActiveOnly").name("Active Only").onChange(function(value) {
		if (gui.effectController.newRenderActiveOnly != bRenderActiveOnly) {
			bRenderActiveOnly = gui.effectController.newRenderActiveOnly;
			bUpdate = true;
		}
	});
	gui.f3.add( gui.effectController, "newPerspectiveOn").name("Perspective On").onChange(function(value) {
		if (gui.effectController.newPerspectiveOn != camera.ui.isPerspective) {
			camera.ui.isPerspective = gui.effectController.newPerspectiveOn;
			bUpdate = true;
		}
	});
	gui.f3.add( gui.effectController, "newLightAnimationOn" ).name("Animation On").onChange(function(value) {
		if (gui.effectController.newLightAnimationOn != bLightAnimationOn) {
			oldLightTime = (new Date()).getTime();
			bLightAnimationOn = gui.effectController.newLightAnimationOn;
			bUpdate = true;
		}
	});
	gui.f3.add( gui.effectController, "newWireframesOn" ).name("Wireframes On").onChange(function(value){
		if (gui.effectController.newWireframesOn != bWireframesOn) {
			bWireframesOn = gui.effectController.newWireframesOn;
			bUpdate = true;
		}
	});
	gui.f3.add( gui.effectController, "newAttenuationOn" ).name("Attenuation On").onChange(function(value) {
		if (gui.effectController.newAttenuationOn != bAttenuationOn) {
			bAttenuationOn = gui.effectController.newAttenuationOn;
			bUpdate = true;
		}
	});

	gui.f0.open();
	gui.f1.open();
	gui.f2.open();
	gui.f3.open();
	addCamera();

	addLight();
	addLight();
	lights[0].ui.color = vec3(1.0, 1.0, 1.0);
	lights[0].ui.translate = vec3(0.7, 1.0, 1.0);
	lights[0].ui.bOn = true;
	lights[1].ui.color = vec3(1.0, 1.0, 1.0);
	lights[1].ui.translate = vec3(-0.7, -1.0, 1.0);
	lights[1].ui.bOn = true;
	addSphere();
}

var bApplyTexture = false;
function applyTexture() {
	if (bApplyTexture) return;
	bApplyTexture = true;

	geomObjects[3].initTexture("Homework_005/moon.gif");
	bUpdate = true;
}

var bApplyPlaneMapping = false;
function applyPlaneMapping() {
	if (bApplyPlaneMapping) return;
	
	bApplyPlaneMapping = true;
	bUpdate = true;
}

function addSphere() {
	geomObjects.push( new Sphere(geomObjects.length, camera, lights) );
	updateActiveIndexControl();
	bUpdate = true;
}

function addCylinder() {
	geomObjects.push( new Cylinder(geomObjects.length, camera, lights) );
	updateActiveIndexControl();
	bUpdate = true;
}

function addCone() {
	geomObjects.push( new Cone(geomObjects.length, camera, lights) );
	updateActiveIndexControl();
	bUpdate = true;
}

function addCamera() {
	geomObjects.push( camera );
	updateActiveIndexControl();
	bUpdate = true;
}

function addLight() {
	var newLight = new Light(geomObjects.length);
	lights.push( newLight );
	geomObjects.push( newLight );
	updateActiveIndexControl();
	bUpdate = true;
}

function undoAdd() {
	if (geomObjects.length <= 3) {return;}
	geomObjects.pop();
	updateActiveIndexControl();
	bUpdate = true;
}

function updateActiveIndexControl() {
	gui.f1.remove(gui.activeIndexControl);
	var activeIndexList = generateActiveIndexList();
	gui.activeIndexControl = gui.f1.add(gui.effectController, 'newActiveIndex', activeIndexList).name("Active Element").listen().onChange(activeElementOnChange);
	
	gui.effectController.newActiveIndex = geomObjects.length-1;
	activeElementOnChange(null);
}

function generateActiveIndexList() {
	var retBlock = {};
	for (var i = 0; i < geomObjects.length; i++) {
		retBlock["" + geomObjects[i].className + "_" + geomObjects[i].id] = geomObjects[i].id;
	}
	return retBlock;
}

function activeElementOnChange(value) {
	if (gui.effectController.newActiveIndex !== activeIndex) {
		activeIndex = gui.effectController.newActiveIndex;

		gui.effectController.newTranslateX = (activeIndex == -1) ? (0.0) : geomObjects[activeIndex].ui.translate[0];
		gui.effectController.newTranslateY = (activeIndex == -1) ? (0.0) : geomObjects[activeIndex].ui.translate[1];
		gui.effectController.newTranslateZ = (activeIndex == -1) ? (0.0) : geomObjects[activeIndex].ui.translate[2];
		gui.effectController.newRotateX = (activeIndex == -1) ? (0.0) : geomObjects[activeIndex].ui.rotate[0];
		gui.effectController.newRotateY = (activeIndex == -1) ? (0.0) : geomObjects[activeIndex].ui.rotate[1];
		gui.effectController.newRotateZ = (activeIndex == -1) ? (0.0) : geomObjects[activeIndex].ui.rotate[2];
		gui.effectController.newScaleX = (activeIndex == -1) ? (1.0) : geomObjects[activeIndex].ui.scale[0];
		gui.effectController.newScaleY = (activeIndex == -1) ? (1.0) : geomObjects[activeIndex].ui.scale[1];
		gui.effectController.newScaleZ = (activeIndex == -1) ? (1.0) : geomObjects[activeIndex].ui.scale[2];
		gui.effectController.newLightOn = (activeIndex == -1 
			|| !(geomObjects[activeIndex] instanceof Light) ) ? false : geomObjects[activeIndex].ui.bOn;

		if (bRenderActiveOnly)
			bUpdate = true;
	}
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
var bLightAnimationOn = true;
var bAttenuationOn = true;
var bWireframesOn = false;
var camera = new Camera(0);
var lights = [];

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

var oldLightTime = (new Date()).getTime();
var lightRate = [0.3, 0.3];
function updateLightsAnimation() {
	var newLightTime = (new Date()).getTime();
	var timePassed = (newLightTime - oldLightTime)/1000.0;
	oldLightTime = newLightTime;
	for (var i = 0; i < lights.length; i++) {
		var light = lights[i];
		var oldLightHeight = light.ui.translate[1];
		var newLightHeight = oldLightHeight + lightRate[i]*timePassed;
		if (newLightHeight < -1.0 || newLightHeight > 1.0) {
			lightRate[i] *= -1.0;
			newLightHeight = oldLightHeight + lightRate[i]*timePassed;
		}

		light.ui.translate[1] = newLightHeight;
		bUpdate = true;
	}
}

function updateAndRender() {
	if (!bUpdate) {
		requestAnimFrame(updateAndRender);
		return;
	}

	bUpdate = false;
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	if (!(bRenderActiveOnly && (geomObjects[activeIndex] instanceof Mesh))) {
		for (var i = 0; i < geomObjects.length; i++) {
			if (geomObjects[i] instanceof Mesh) {
				geomObjects[i].update();
				geomObjects[i].render();
			}
		}
	} else {
		geomObjects[activeIndex].update();
		geomObjects[activeIndex].render();
	}

	if (bLightAnimationOn)
		updateLightsAnimation();

	requestAnimFrame(updateAndRender);
}

function polarToCartesian(radius, theta, phi) {
	var x = radius*Math.cos(radians(theta))*Math.sin(radians(phi));
	var y = radius*Math.sin(radians(theta))*Math.sin(radians(phi));
	var z = radius*Math.cos(radians(phi));
	return vec3(x,y,z);
}

function polarToCartesianNormal(theta, phi) {
	var x = Math.cos(radians(theta))*Math.sin(radians(phi));
	var y = Math.sin(radians(theta))*Math.sin(radians(phi));
	var z = Math.cos(radians(phi));
	return vec3(x,y,z);
}

function polarToTexel(theta, phi) {
	return vec2(1.0-theta/360.0, 1.0-phi/180.0);
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

