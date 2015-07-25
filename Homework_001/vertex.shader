// vertex.shader
attribute vec4 a_Position;
uniform float u_Theta;
uniform bool u_TwistOn;
void main() {
	float x0 = a_Position.x;
	float y0 = a_Position.y;

	float d = (u_TwistOn) ? sqrt( pow(x0,2.0) + pow(y0,2.0) ) : 1.0;
	float x1 = x0*cos(radians(u_Theta*d)) - y0*sin(radians(u_Theta*d));
	float y1 = x0*sin(radians(u_Theta*d)) + y0*cos(radians(u_Theta*d));

	gl_Position = vec4(x1, y1, 0.0, 1.0);
	gl_PointSize = 5.0;
}