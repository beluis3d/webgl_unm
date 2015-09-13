// --shaders.js--
var VSHADER_SOURCE =
    "// vertex.shader\n" +
    "attribute vec4 a_Location;\n" +
    "attribute vec4 a_Normal;\n" +
    "attribute vec2 a_Texel;\n" + 
    "uniform mat4 a_Model;\n" +
    "uniform mat4 a_View;\n" +
    "uniform mat4 a_Projection;\n" + 
    "uniform mat4 a_NormalMatrix;\n" +
    "varying vec3 v_Position;\n" + 
    "varying vec3 v_Normal;\n" +
    "varying vec3 v_eyeDirection;\n" +
    "varying vec2 v_Texel;\n" + 
    "void main() {\n" +
    "	gl_Position = a_Projection * a_View * a_Model * a_Location;\n" +
    "   vec4 eyeLocation = (a_View * a_Model * a_Location);\n" +
    "   eyeLocation.z *= -1.0;// switch to right hand system\n" + 
    "   \n" +
    "   v_eyeDirection = normalize((vec4(0.0, 0.0, 0.0, 0.0) - eyeLocation).xyz);\n" +
    "   v_Position = (a_Model * a_Location).xyz;\n" +
    "   v_Normal = vec3(a_NormalMatrix * a_Normal);\n" + 
    "   v_Texel = a_Texel;\n" + 
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
    "uniform vec4 u_MaterialColor;\n" +
    "uniform vec3 u_LightColor[2];\n" +
    "uniform vec3 u_LightLocation[2];\n" +
    "uniform float u_AttenuationOn;\n" +
    "uniform sampler2D u_Sampler;\n" + 
    "varying vec3 v_Position;\n" + 
    "varying vec3 v_Normal;\n" +
    "varying vec3 v_eyeDirection;\n" +
    "varying vec2 v_Texel;\n" + 
    "void main() {\n" +
    "   vec3 colorSum = vec3(0.0, 0.0, 0.0);\n" +
    "   vec3 normal = normalize(v_Normal);\n" + 
    "   for (int i = 0; i < 2; i++) {\n" +
    "      vec3 lightDirection = u_LightLocation[i] - v_Position;\n" + 
    "      float lightDistance = length(lightDirection);\n" + 
    "      float attenuation = (u_AttenuationOn == 1.0) ? 1.0/(pow(lightDistance/5.0+1.0,2.0)) : 1.0;\n" +
    "      lightDirection = normalize(lightDirection);\n" +
    "      float nDotL = max(dot(normal, lightDirection), 0.0);\n" + 
    "      vec3 diffuseProduct = u_MaterialColor.rgb * u_LightColor[i];\n" +
    "      colorSum += nDotL * diffuseProduct * attenuation;\n" +
    "      \n" +
    "      vec3 halfwayVector = normalize(lightDirection + normalize(v_eyeDirection));\n" + 
    "      float nDotH = max(dot(normal, halfwayVector), 0.0);\n" + 
    "      float highlightValue = (i==0) ? 10000.0: 1.0;\n" +
    "      float Ks = pow(nDotH, highlightValue);\n" + 
    "      vec3 specularProduct = u_MaterialColor.rgb * u_LightColor[i];\n" + 
    "      colorSum += Ks * specularProduct * attenuation;\n" + 
    "   }\n" +
    "   vec3 ambientColor = vec3(0.2, 0.2, 0.2);\n" + 
    "   colorSum += ambientColor;\n" + 
    "	gl_FragColor = vec4(colorSum, u_MaterialColor.a);\n" +
    "   gl_FragColor = texture2D(u_Sampler, v_Texel);\n" + 
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
