// --shaders.js--
var VSHADER_SOURCE =
    "attribute vec4 vPosition;\n" +
    "void main(){\n" +
    "  gl_Position = vPosition;\n" +
    "}\n" +
    "";

var FSHADER_SOURCE =
    "precision mediump float;\n" +
    "void main(){\n" +
    "    gl_FragColor = vec4( 0.0, 1.0, 0.0, 1.0 );\n" +
    "}\n" +
    "";
