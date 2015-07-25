#Run command #1: python glsl2js.py vertex.shader fragment.shader shaders.js
# The output directory will be the current directory
#
#Run command #2: python glsl2js.py
# This assumes that your vertex and fragment shader files have the default names
# This also assumes that your output file is the default name
import sys
vertexShaderFile = sys.argv[1] if len(sys.argv) > 1 else "vertex.shader"
fragmentShaderFile = sys.argv[2] if len(sys.argv) > 2 else "fragment.shader"
outputFile = sys.argv[3] if len(sys.argv) > 3 else "shaders.js"

output_arr = []
output_arr.append("// --shaders.js--");

output_arr.append("var VSHADER_SOURCE =");
for line in open(vertexShaderFile):
	output_arr.append("    \"" + line.rstrip('\n') + "\\n\" +")
output_arr.append("    \"\";");
output_arr.append("");

output_arr.append("var FSHADER_SOURCE =");
for line in open(fragmentShaderFile):
	output_arr.append("    \"" + line.rstrip('\n') + "\\n\" +")
output_arr.append("    \"\";");
output_arr.append("");

output_string = '\n'.join(output_arr)
of = open(outputFile, 'w')
of.write(output_string);
