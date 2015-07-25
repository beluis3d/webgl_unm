// --shaders.js--
var VSHADER_SOURCE =
    "// vertex.shader\n" +
    "attribute vec4 a_Position;\n" +
    "uniform float u_Theta;\n" +
    "uniform bool u_TwistOn;\n" +
    "void main() {\n" +
    "	float x0 = a_Position.x;\n" +
    "	float y0 = a_Position.y;\n" +
    "\n" +
    "	float d = (u_TwistOn) ? sqrt( pow(x0,2.0) + pow(y0,2.0) ) : 1.0;\n" +
    "	float x1 = x0*cos(radians(u_Theta*d)) - y0*sin(radians(u_Theta*d));\n" +
    "	float y1 = x0*sin(radians(u_Theta*d)) + y0*cos(radians(u_Theta*d));\n" +
    "\n" +
    "	gl_Position = vec4(x1, y1, 0.0, 1.0);\n" +
    "	gl_PointSize = 5.0;\n" +
    "}\n" +
    "";

var FSHADER_SOURCE =
    "// fragment.shader\n" +
    "void main() {\n" +
    "	gl_FragColor = vec4(1.0, 0.65, 0.0, 1.0);\n" +
    "}\n" +
    "";
