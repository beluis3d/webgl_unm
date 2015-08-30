// --shaders.js--
var VSHADER_SOURCE =
    "// vertex.shader\n" +
    "attribute vec4 a_Location;\n" +
    "attribute vec4 a_Normal;\n" +
    "uniform mat4 a_Model;\n" +
    "uniform mat4 a_View;\n" +
    "uniform mat4 a_Projection;\n" +
    "uniform mat4 a_NormalMatrix;\n" + 
    "uniform vec4 u_MaterialColor;\n" +
    "uniform vec3 u_LightColor[2];\n" +
    "uniform vec3 u_LightLocation[2];\n" +
    "uniform float u_AttenuationOn;\n" + 
    "varying vec4 v_Position;\n" +
    "varying vec4 v_Color;\n" +
    "void main() {\n" +
    "	gl_Position = a_Projection * a_View * a_Model * a_Location;\n" +
    "   \n" +
    "   vec3 colorSum = vec3(0.0, 0.0, 0.0);\n" +
    "   vec3 normal = normalize(vec3(a_NormalMatrix * a_Normal));\n" + 
    "   vec3 worldLoc = (a_Model * a_Location).xyz;\n" + 
    "   for (int i = 0; i < 2; i++) {\n" +
    "      vec3 lightDirection = u_LightLocation[i] - worldLoc;\n" + 
    "      float lightDistance = length(lightDirection);\n" + 
    "      float attenuation = (u_AttenuationOn == 1.0) ? 1.0/(pow(lightDistance/5.0+1.0,2.0)) : 1.0;\n" +
    "      lightDirection = normalize(lightDirection);\n" +
    "      float nDotL = max(dot(normal, lightDirection), 0.0);\n" + 
    "      vec3 colorProduct = u_MaterialColor.rgb * u_LightColor[i];\n" +
    "      colorSum += nDotL * colorProduct * attenuation;\n" +
    "   }\n" +
    "   vec3 ambientColor = vec3(0.2, 0.2, 0.2);\n" + 
    "   colorSum += ambientColor;\n" + 
    "   v_Color = vec4(colorSum, u_MaterialColor.a);\n" +
    "   \n" +
    "	gl_PointSize = 15.0;\n" +
    "	v_Position = vec4(abs(gl_Position.xyz), 1.0);\n" +
    "}\n" +
    "";

var VSHADER_SOURCE2 =
    "// vertex.shader\n" +
    "attribute vec4 a_Location;\n" +
    "uniform mat4 a_Model;\n" +
    "uniform mat4 a_View;\n" +
    "uniform mat4 a_Projection;\n" +
    "varying vec4 v_Position;\n" +
    "void main() {\n" +
    "   gl_Position = a_Projection * a_View * a_Model * a_Location;\n" +
    "   gl_PointSize = 15.0;\n" +
    "   v_Position = vec4(gl_Position.xyz, 1.0);\n" +
    "}\n" +
    "";

var FSHADER_SOURCE =
    "// fragment.shader\n" +
    "precision mediump float;\n" +
    "varying vec4 v_Position;\n" +
    "varying vec4 v_Color;\n" +
    "void main() {\n" +
    "   vec4 test = 1.0*v_Position;\n" +
    "	gl_FragColor = vec4(v_Color.xyz, 1.0);//vec4(v_Position.xyz, 1.0);//\n" +
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
