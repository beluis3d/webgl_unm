// fragment.shader
precision mediump float;
varying vec4 v_Position;
void main() {
	gl_FragColor = vec4(v_Position.xyz, 1.0);
}