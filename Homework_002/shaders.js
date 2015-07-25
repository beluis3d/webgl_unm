// --shaders.js--
var VSHADER_SOURCE =
    "// vertex.shader\n" +
    "attribute vec4 a_Position;\n" +
    "uniform float u_Size;\n" +
    "void main() {\n" +
    "	gl_Position = a_Position;\n" +
    "	gl_PointSize = u_Size;\n" +
    "}\n" +
    "";

var FSHADER_SOURCE =
    "// fragment.shader\n" +
    "precision mediump float;\n" +
    "uniform vec3 u_Color;\n" +
    "void main() {\n" +
    "	gl_FragColor = vec4(u_Color, 1.0);\n" +
    "}\n" +
    "";
