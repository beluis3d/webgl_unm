// script.js
var gl;
var points = [];
var curves = [];

var bMouseDown = false;
var drawColor = "ff0000";
var drawSize = 5.0;
var drawStyle = 0; //filled=0, dotted=1, dashed=2

var a_Position, u_Color, u_Size;
var vBuffer, cBuffer;

window.onload = function init() {
	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	gl.program = initShadersFromSource(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	gl.useProgram(gl.program);

	setupGui(canvas);
	setupData();
	render();
}

function setupGui(canvas) {
	window.onmousedown = function(event) { 
		if( !event.target.id || event.target.id !== "gl-canvas" ) return;

		bMouseDown = true; 
		curves.push({ start:points.length, size:0, color:drawColor, pt_size:drawSize }); 
	};
	window.onmouseup = function(event) { 
		if (bMouseDown) {
			bMouseDown = false; 
			if (drawStyle == 1) dottifyLastCurve();
			else if (drawStyle == 2) dashifyLastCurve();
		}
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
						newDrawSize: drawSize,
						newUndoDraw: undoDraw,
						newInvertColors: invertColors,
						newDrawStyle: drawStyle };
	var gui = new dat.GUI();
	var colorOpts = {Red:"ff0000", Green:"00ff00", Blue:"0000ff", Yellow: "ffff00", Cyan:"00ffff", Magenta:"ff00ff", White:"ffffff"}
	gui.add(effectController, "newDrawColor", colorOpts).name("Color").onChange(function(value) {
		if (effectController.newDrawColor !== drawColor) {
			drawColor = effectController.newDrawColor;
		}
	});
	gui.add(effectController, "newDrawSize", 3.0, 30.0).step(1.0).name("Size").onChange(function(value) {
		if (effectController.newDrawSize !== drawSize) {
			drawSize = effectController.newDrawSize;
		}
	});
	gui.add(effectController, "newUndoDraw").name("Undo Draw");
	gui.add(effectController, "newInvertColors").name("Invert Colors");
	gui.add(effectController, "newDrawStyle", {Filled:0, Dotted:1, Dashed:2}).name("Style").onChange(function(value) {
		if (effectController.newDrawStyle !== drawStyle) {
			drawStyle = effectController.newDrawStyle;
		}
	});
}

function dottifyLastCurve() {
	var lastCurve = curves[curves.length-1];
	step = 0.01*lastCurve.pt_size;
	
	for (var i = lastCurve.start; i < lastCurve.start+lastCurve.size-1; i++) {
		if (points[i] !== undefined) {
			var firstPoint = points[i];
			var _flag = true;
			for (var k = i+1; k < lastCurve.start+lastCurve.size && _flag; k++) {
				var secondPoint = points[k];
				var path_vec = subtract(secondPoint, firstPoint);
				var path_len = length(path_vec);
				
				if (path_len < step) {
					points[k] = undefined;
				} else {
					_flag = false;
				}
			}
		}
	}

	for (var i = lastCurve.start; i < lastCurve.start+lastCurve.size; i++) {
		if (points[i] === undefined) {
			points.splice(i,1);
			lastCurve.size--;
			i--;
		}
	}

	update();
	render();
}

function dashifyLastCurve() {
	var lastCurve = curves[curves.length-1];
	step = 0.01*lastCurve.pt_size;
	
	for (var i = lastCurve.start; i < lastCurve.start+lastCurve.size-1; i++) {
		if (points[i] !== undefined) {
			var firstPoint = points[i];
			var _flag = true;
			var _flag2 = true;
			for (var k = i+1; k < lastCurve.start+lastCurve.size && _flag; k++) {
				var secondPoint = points[k];
				var path_vec = subtract(secondPoint, firstPoint);
				var path_len = length(path_vec);
				
				if (_flag2) { if (path_len < step) { step=step; } else { _flag2 = false; i=k; firstPoint=secondPoint; } }
				else { if (path_len < step) { points[k] = undefined; } else { _flag = false; } }
			}
		}
	}

	for (var i = lastCurve.start; i < lastCurve.start+lastCurve.size; i++) {
		if (points[i] === undefined) {
			points.splice(i,1);
			lastCurve.size--;
			i--;
		}
	}

	update();
	render();
}

function undoDraw() {
	if (curves.length == 0)
		return;

	var poppedCurve = curves.pop();
	for(var i = 0; i < poppedCurve.size; i++)
		points.pop();


	render();
}

function invertColors() {
	for (var i = 0; i < curves.length; i++) {
		switch(curves[i].color) {
			case "ff0000": curves[i].color = "00ffff"; break;
			case "00ff00": curves[i].color = "ff00ff"; break;
			case "0000ff": curves[i].color = "ffff00"; break;
			
			case "ffff00": curves[i].color = "0000ff"; break;
			case "00ffff": curves[i].color = "ff0000"; break;
			case "ff00ff": curves[i].color = "00ff00"; break;

			case "ffffff": curves[i].color = "000000"; break;
			case "000000": curves[i].color = "ffffff"; break;
			default: break;
		}
	}

	render();
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
	if (x!==undefined && y!==undefined) calculatePoints(x,y);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
}

function calculatePoints(x,y) {
	if (curves[curves.length-1].size == 0) {
		points.push(vec2(x,y));
		curves[curves.length-1].size++;
		return;
	}

	var step = 0.01;
	var lastpoint = points[points.length-1];
	var newpoint = vec2(x,y);
	var path_vec = subtract(newpoint, lastpoint);
	var path_len = length(path_vec);

	for (var i = 1; step*i < path_len; i++) {
		var add_vec = scale( (step*i/path_len), path_vec);
		var new_vec = add(lastpoint, add_vec);
		
		points.push(new_vec);
		curves[curves.length-1].size++;
	}
	points.push(newpoint);
	curves[curves.length-1].size++;
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

