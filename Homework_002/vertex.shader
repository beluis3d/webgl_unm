// vertex.shader
attribute vec4 a_Position;
uniform float u_Size;
void main() {
	gl_Position = a_Position;
	gl_PointSize = u_Size;
}