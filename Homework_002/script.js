// script.js
var gl;
var points = [];
var curves = [];
var colors = [];

var bMouseDown = false;
var drawColor = "ff0000";
var drawSize = 5.0;

var a_Position, u_Color, u_Size;
var vBuffer, cBuffer;

window.onload = function init() {
	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	gl.program = initShadersFromSource(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	gl.useProgram(gl.program);

	setupGui(canvas);
	setupData();
	//update(x,y);
	render();
}

function setupGui(canvas) {
	window.onmousedown = function(event) { 
		if( !event.target.id || event.target.id !== "gl-canvas" ) return;

		bMouseDown = true; 
		curves.push({ start:points.length, size:0, color:drawColor, pt_size:drawSize }); 
	};
	window.onmouseup = function(event) { 
		bMouseDown = false; 
	};
	window.onmousemove = function(event) { 
		if (bMouseDown) {
			var x = event.clientX;
			var y = event.clientY;
			var rect = event.target.getBoundingClientRect();

			x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
			y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
			
			update(x,y);
			render();
		}
	};

	effectController = {newDrawColor: drawColor,
						newDrawSize: drawSize };
	var gui = new dat.GUI();
	var colorOpts = {Red:"ff0000", Green:"00ff00", Blue:"0000ff", Yellow: "ffff00", Cyan:"00ffff", Magenta:"ff00ff", White:"ffffff"}
	gui.add(effectController, "newDrawColor", colorOpts).name("Color").onChange(function(value) {
		if (effectController.newDrawColor !== drawColor) {
			drawColor = effectController.newDrawColor;
		}
	});
	gui.add(effectController, "newDrawSize", 1.0, 30.0).step(1.0).name("Size").onChange(function(value) {
		if (effectController.newDrawSize !== drawSize) {
			drawSize = effectController.newDrawSize;
		}
	});
}

function setupData() {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	a_Position = gl.getAttribLocation(gl.program, "a_Position");
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	u_Size = gl.getUniformLocation(gl.program, "u_Size");
	u_Color = gl.getUniformLocation(gl.program, "u_Color");
}

function update(x,y) {
	points.push(vec2(x,y));
	var rgb = hexToRgb(drawColor);
	colors.push(vec3( rgb.r, rgb.g, rgb.b ));
	curves[curves.length-1].size++;

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	for (var ii = 0; ii < curves.length; ii++) {
		gl.uniform1f(u_Size, curves[ii].pt_size);
		var rgb = hexToRgb(curves[ii].color);
		gl.uniform3f(u_Color, rgb.r, rgb.g, rgb.b);
		gl.drawArrays(gl.POINTS, curves[ii].start, curves[ii].size);
	}
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: (parseInt(result[1], 16)/255.0),
        g: (parseInt(result[2], 16)/255.0),
        b: (parseInt(result[3], 16)/255.0)
    } : null;
}

