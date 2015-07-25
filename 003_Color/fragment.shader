// fragment.shader
precision mediump float;
varying vec4 fColor;
uniform int fRenderMode;
void main() {
	if (fRenderMode == 0) {
		gl_FragColor = fColor;
	} else if (fRenderMode >= 1) {
		//vec4 temp = (1.0/511.0) * vec4(511.0-gl_FragCoord.x, gl_FragCoord.x, gl_FragCoord.y, 1.0);
		//temp.w = 1.0;
		//gl_FragColor = temp;
		gl_FragColor.g = gl_FragCoord.x/511.0;
		gl_FragColor.b = gl_FragCoord.y/511.0;
		gl_FragColor.r = 1.0 - gl_FragColor.g - gl_FragColor.b;
		gl_FragColor.a = 1.0;
	} 

	if (fRenderMode >= 2) {
		float maxim = max( max(gl_FragColor.r, gl_FragColor.g), gl_FragColor.b);
		gl_FragColor *= (1.0/maxim);
		gl_FragColor.a = 1.0;
	} 
	if (fRenderMode >=3) {
		vec4 rgba = gl_FragColor;
		float lumin = rgba.r*0.299 + rgba.g*0.587 + rgba.b*0.114;
		gl_FragColor = vec4(lumin,lumin,lumin,1.0);
	}
}