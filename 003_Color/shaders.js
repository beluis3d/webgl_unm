// --shaders.js--
var VSHADER_SOURCE =
    "// vertex.shader\n" +
    "attribute vec4 vPosition;\n" +
    "attribute vec4 vColor;\n" +
    "varying vec4 fColor;\n" +
    "void main() {\n" +
    "	gl_Position = vPosition;\n" +
    "	fColor = vColor;\n" +
    "}\n" +
    "";

var FSHADER_SOURCE =
    "// fragment.shader\n" +
    "precision mediump float;\n" +
    "varying vec4 fColor;\n" +
    "uniform int fRenderMode;\n" +
    "void main() {\n" +
    "	if (fRenderMode == 0) {\n" +
    "		gl_FragColor = fColor;\n" +
    "	} else if (fRenderMode >= 1) {\n" +
    "		//vec4 temp = (1.0/511.0) * vec4(511.0-gl_FragCoord.x, gl_FragCoord.x, gl_FragCoord.y, 1.0);\n" +
    "		//temp.w = 1.0;\n" +
    "		//gl_FragColor = temp;\n" +
    "		gl_FragColor.g = gl_FragCoord.x/511.0;\n" +
    "		gl_FragColor.b = gl_FragCoord.y/511.0;\n" +
    "		gl_FragColor.r = 1.0 - gl_FragColor.g - gl_FragColor.b;\n" +
    "		gl_FragColor.a = 1.0;\n" +
    "	} \n" +
    "\n" +
    "	if (fRenderMode >= 2) {\n" +
    "		float maxim = max( max(gl_FragColor.r, gl_FragColor.g), gl_FragColor.b);\n" +
    "		gl_FragColor *= (1.0/maxim);\n" +
    "		gl_FragColor.a = 1.0;\n" +
    "	} \n" +
    "	if (fRenderMode >=3) {\n" +
    "		vec4 rgba = gl_FragColor;\n" +
    "		float lumin = rgba.r*0.299 + rgba.g*0.587 + rgba.b*0.114;\n" +
    "		gl_FragColor = vec4(lumin,lumin,lumin,1.0);\n" +
    "	}\n" +
    "}\n" +
    "";
