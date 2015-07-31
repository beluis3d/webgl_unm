// vertex.shader
attribute vec4 a_Location;
attribute mat4 a_Affine;
varying vec4 v_Position;
void main() {
	gl_Position = a_Affine * a_Location;
	gl_PointSize = 15.0;
	v_Position = vec4(abs(gl_Position.xyz), 1.0);
}