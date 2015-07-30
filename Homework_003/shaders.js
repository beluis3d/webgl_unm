// --shaders.js--
var VSHADER_SOURCE =
    "// vertex.shader\n" +
    "attribute vec4 a_Location;\n" +
    "attribute mat4 a_Affine;\n" +
    "void main() {\n" +
    "	gl_Position = a_Affine * a_Location;\n" +
    "	gl_PointSize = 15.0;\n" +
    "}\n" +
    "";

var FSHADER_SOURCE =
    "// fragment.shader\n" +
    "void main() {\n" +
    "	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n" +
    "}\n" +
    "";
