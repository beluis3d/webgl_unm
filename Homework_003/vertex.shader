// vertex.shader
attribute vec4 a_Location;
attribute mat4 a_Affine;
void main() {
	gl_Position = a_Affine * a_Location;
	gl_PointSize = 15.0;
}