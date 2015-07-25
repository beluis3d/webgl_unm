var gl;
var points;

window.onload = function init() {

    var canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );    
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// Three Vertices
	var vertices = [
	        vec2( -1, -1 ),
	        vec2(  0,  0 ),
	        vec2(  1, -1 )
	];

	//  Configure WebGL   
	//    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );     

	//  Load shaders and initialize attribute buffers
    var program = initShadersFromSource( gl, VSHADER_SOURCE, FSHADER_SOURCE );
    gl.useProgram( program );        


    // Six Vertices
    var vertices2 = [
            vec2( -1, -1 ),
            vec2(  0,  0 ),
            vec2(  1, -1 ),
            vec2( -1,  0 ),
            vec2(  0,  1 ),
            vec2(  1,  0 )
    ];

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices2), gl.STATIC_DRAW );
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 6 );

	/*
    // Load the data into the GPU        
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );    
    //render();

    gl.clear( gl.COLOR_BUFFER_BIT ); 
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

    gl.disableVertexAttribArray( vPosition );
    gl.deleteBuffer( bufferId );

    // Three Vertices
    var vertices2 = [
            vec2( -1,  0 ),
            vec2(  0,  1 ),
            vec2(  1,  0 )
    ];

    // Load the data into the GPU        
    var bufferId2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices2), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition ); 

    //gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
    */
};

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT ); 
  	gl.drawArrays( gl.TRIANGLES, 0, 3 );
}