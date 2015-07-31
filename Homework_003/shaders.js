// --shaders.js--
var VSHADER_SOURCE =
    "// vertex.shader\n" +
    "attribute vec4 a_Location;\n" +
    "attribute mat4 a_Affine;\n" +
    "varying vec4 v_Position;\n" +
    "void main() {\n" +
    "	gl_Position = a_Affine * a_Location;\n" +
    "	gl_PointSize = 15.0;\n" +
    "	v_Position = vec4(abs(gl_Position.xyz), 1.0);//vec4(abs(gl_Position.x), abs(gl_Position.y), abs(gl_Position.z), 1.0);\n" +
    "}\n" +
    "";

var FSHADER_SOURCE =
    "// fragment.shader\n" +
    "precision mediump float;\n" +
    "varying vec4 v_Position;\n" +
    "void main() {\n" +
    "	gl_FragColor = vec4(v_Position.xyz, 1.0);\n" +
    "}\n" +
    "";

var FSHADER_SOURCE2 =
    "// fragment.shader\n" +
    "precision mediump float;\n" +
    "varying vec4 v_Position;\n" +
    "void main() {\n" +
    "   gl_FragColor = vec4(v_Position.zxy, 1.0);\n" +
    "}\n" +
    "";
