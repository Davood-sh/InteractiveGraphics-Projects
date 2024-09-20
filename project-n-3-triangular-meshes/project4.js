// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// Modify the code below to form the transformation matrix.
	
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	
	sinX = Math.sin(rotationX);
	cosX = Math.cos(rotationX);
	var rotationXMatrix = [
		1, 0, 0, 0,
		0, cosX, -sinX, 0,
		0, sinX, cosX, 0,
		0, 0, 0, 1
	];
	
	sinY = Math.sin(rotationY);
	cosY = Math.cos(rotationY);
	var rotationYMatrix = [
		cosY, 0, sinY, 0,
		0, 1, 0, 0,
		-sinY, 0, cosY, 0,
		0, 0, 0, 1
	];
	
	var transAndRot = MatrixMult(MatrixMult(trans, rotationXMatrix), rotationYMatrix);
	
	var mvp = MatrixMult( projectionMatrix, transAndRot );
	return mvp;
}


// Complete the implementation of the following class.
class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
    constructor()
	{
		// initializations
        this.prog = InitShaderProgram(meshVS, meshFS);
        this.mvp = gl.getUniformLocation(this.prog, 'mvp');
        this.vertPos = gl.getAttribLocation(this.prog, 'pos');
        this.texCoordPos = gl.getAttribLocation(this.prog, 'texCoord');

        this.vertbuffer = gl.createBuffer();
        this.texCoordBuffer = gl.createBuffer();
        this.indexbuffer = gl.createBuffer();

        this.meshVertices = [];
        this.meshTexCoords = [];
        this.showTextureFlag = (document.getElementById("show-texture").value == 'on');
		this.textureUploaded = false;
        this.swapYZFlag = (document.getElementById("swap-yz").value == 'off');

        this.texture = null;
    }

	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
    setMesh( vertPos, texCoords )
	{
		// Update the contents of the vertex buffer 
        this.meshVertices = vertPos;
        this.meshTexCoords = texCoords;

        // Bind vertex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.meshVertices), gl.STATIC_DRAW);

        // Bind texture coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.meshTexCoords), gl.STATIC_DRAW);
    }
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
    swapYZ( swap )
	{
		//Set the uniform parameter(s) of the vertex shader
        const swapUniform = gl.getUniformLocation(this.prog, 'swapYZ');
        gl.useProgram(this.prog);
        gl.uniform1i(swapUniform, swap);
		this.swapYZFlag = swap;
    }

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
    draw( trans )
	{
		// Complete the WebGL initializations before drawing
        gl.useProgram(this.prog);
        gl.uniformMatrix4fv(this.mvp, false, trans);

        // Bind vertex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vertPos);

        // Bind texture coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.vertexAttribPointer(this.texCoordPos, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.texCoordPos);
        // Bind texture
        if(this.texture != null && this.showTextureFlag)
		{
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }
		else 
		{
			const showTextureUniform = gl.getUniformLocation(this.prog, 'showTextureFlag');
			gl.uniform1i(showTextureUniform, this.showTextureFlag); // Set proper boolean value based on Show Texture checkbox
			const textureUploaded = gl.getUniformLocation(this.prog, 'textureUploaded');
			gl.uniform1i(textureUploaded, (this.texture != null)); // Set proper boolean value based on texture uploaded or not
		}

		// Set proper boolean value based on Swap Y-Z checkbox
		this.swapYZ( this.swapYZFlag );

        // Draw the mesh
        gl.drawArrays(gl.TRIANGLES, 0, this.meshVertices.length / 3);
    }

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// Bind the texture
		console.log('Setting texture...');
		var texture = gl.createTexture(); // Create a new texture object
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Set the texture image
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		gl.generateMipmap(gl.TEXTURE_2D);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

		var textureSampler = gl.getUniformLocation(this.prog, 'uSampler');
		if(textureSampler === null)
		{
			console.error('Uniform sampler not found.');
		}
		gl.useProgram(this.prog);
		// Set texture sampler uniform
		gl.uniform1i(textureSampler, 0);

		// Assign the texture object to the class property
		this.texture = texture;
		
		// Set the value of an uploaded texture
		this.textureUploaded = true;
		const textureUploaded = gl.getUniformLocation(this.prog, 'textureUploaded');
		gl.useProgram(this.prog);
		gl.uniform1i(textureUploaded, this.textureUploaded);
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
    showTexture( show )
	{
		// set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		const showTextureUniform = gl.getUniformLocation(this.prog, 'showTextureFlag');
        gl.useProgram(this.prog);
        gl.uniform1i(showTextureUniform, show ? 1 : 0);
		const textureUploaded = gl.getUniformLocation(this.prog, 'textureUploaded');
		gl.useProgram(this.prog);
		gl.uniform1i(textureUploaded, this.textureUploaded);
		this.showTextureFlag = show;
    }
}

// Vertex shader source code for mesh rendering
var meshVS = `
    attribute vec3 pos;
    attribute vec2 texCoord;
    varying vec2 vTexCoord;
    uniform mat4 mvp;
	uniform bool swapYZ;
    void main()
	{
		vec3 newPos = pos;
		if(swapYZ)
		{
			newPos.yz = newPos.zy;
		}
        gl_Position = mvp * vec4(newPos, 1.0);
        vTexCoord = texCoord;
    }
`;

// Fragment shader source code for mesh rendering
var meshFS = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform sampler2D uSampler;
    uniform bool showTextureFlag;
	uniform bool textureUploaded;

    void main()
	{
        if(showTextureFlag && textureUploaded) // If Show Texture is checked and texture is uploaded
		{
			gl_FragColor = texture2D(uSampler, vTexCoord); // Display texture
        }
		else // Otherwise show red coloring
		{
            gl_FragColor = vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1); // Adjust color based on distance from near plane
            //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red flat color
        }
    }
`;
