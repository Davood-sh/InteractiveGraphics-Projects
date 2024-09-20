// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
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


	var mv =  MatrixMult(MatrixMult(trans, rotationXMatrix), rotationYMatrix);;
	return mv;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		// initializations
        this.prog = InitShaderProgram(meshVS, meshFS);
        this.mvp = gl.getUniformLocation(this.prog, 'mvp');
        this.mv = gl.getUniformLocation(this.prog, 'mv');
        this.normalMatrix = gl.getUniformLocation(this.prog, 'normalMatrix');
        this.vertPos = gl.getAttribLocation(this.prog, 'pos');
        this.texCoordPos = gl.getAttribLocation(this.prog, 'texCoord');
        this.normalPos = gl.getAttribLocation(this.prog, 'normal');

        this.vertbuffer = gl.createBuffer();
        this.texCoordBuffer = gl.createBuffer();
        this.normalBuffer = gl.createBuffer();
        this.indexbuffer = gl.createBuffer();

        this.meshVertices = [];
        this.meshTexCoords = [];
        this.meshNormals = [];
        this.showTextureFlag = (document.getElementById("show-texture").value == 'on');
        this.textureUploaded = false;
        this.swapYZFlag = (document.getElementById("swap-yz").value == 'off');

        this.texture = null;
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		

		// Update the contents of the vertex buffer 
        this.meshVertices = vertPos;
        this.meshTexCoords = texCoords;
		this.meshNormals = normals;

        // Bind vertex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.meshVertices), gl.STATIC_DRAW);

        // Bind texture coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.meshTexCoords), gl.STATIC_DRAW);

		// Bind vertex normals
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.meshNormals), gl.STATIC_DRAW);

		
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		const swapUniform = gl.getUniformLocation(this.prog, 'swapYZ');
        gl.useProgram(this.prog);
        gl.uniform1i(swapUniform, swap);
		this.swapYZFlag = swap;
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw(matrixMVP, matrixMV, matrixNormal) {
		// Complete the WebGL initializations before drawing
		gl.useProgram(this.prog);

        gl.uniformMatrix4fv(this.mvp, false, matrixMVP);
        gl.uniformMatrix4fv(this.mv, false, matrixMV);
        gl.uniformMatrix4fv(this.normalMatrix, false, matrixNormal);

		// Bind vertex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vertPos);

		// Bind texture coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.vertexAttribPointer(this.texCoordPos, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.texCoordPos);

		// Bind texture normal
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(this.normalPos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.normalPos);

		// Bind texture
        if (this.texture != null && this.showTextureFlag) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        } else {
            const showTextureUniform = gl.getUniformLocation(this.prog, 'showTextureFlag');
            gl.uniform1i(showTextureUniform, this.showTextureFlag ? 1 : 0);
            const textureUploaded = gl.getUniformLocation(this.prog, 'textureUploaded');
            gl.uniform1i(textureUploaded, (this.texture != null));
        }

        this.swapYZ(this.swapYZFlag);

        gl.drawArrays(gl.TRIANGLES, 0, this.meshVertices.length / 3);
		
	}
	
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture

		// You can set the texture image data using the following command.
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

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		// set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		const showTextureUniform = gl.getUniformLocation(this.prog, 'showTextureFlag');
        gl.useProgram(this.prog);
        gl.uniform1i(showTextureUniform, show ? 1 : 0);
		const textureUploaded = gl.getUniformLocation(this.prog, 'textureUploaded');
		gl.useProgram(this.prog);
		gl.uniform1i(textureUploaded, this.textureUploaded);
		this.showTextureFlag = show;
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		const lightDirUniform = gl.getUniformLocation(this.prog, 'lightDirection');
		
        gl.useProgram(this.prog);
        gl.uniform3f(lightDirUniform, -x, -y, z);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		const shininessUniform = gl.getUniformLocation(this.prog, 'shininess');
		if (shininessUniform === null) {
			console.error('Failed to get uniform location for shininess.');
			return;
		}
        gl.useProgram(this.prog);
        gl.uniform1f(shininessUniform, shininess);
		console.log('Shininess set to:', shininess);
	}
}

// Vertex shader source code for mesh rendering
var meshVS = `
    attribute vec3 pos;
    attribute vec2 texCoord;
    attribute vec3 normal; // Add normal attribute
    varying vec2 vTexCoord;
    varying vec3 vNormal; // Declare varying normal
    uniform mat4 mvp;
	uniform mat4 mv;
	
    uniform bool swapYZ;
    void main() {
        vec3 newPos = pos;
        if (swapYZ) {
            newPos.yz = newPos.zy;
        }
        gl_Position = mvp * vec4(newPos, 1.0);
        vTexCoord = texCoord;
        vNormal = mat3(mv) * normal; // Pass normal to fragment shader
    }
`;


// Fragment shader source code for mesh rendering
var meshFS = `
    precision mediump float;
    varying vec2 vTexCoord;
    varying vec3 vNormal;
    uniform sampler2D uSampler;
    uniform bool showTextureFlag;
    uniform bool textureUploaded;
    uniform vec3 lightDirection; // Uniform for light direction
    uniform float shininess; // Uniform for shininess
    void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(lightDirection);
        float diffuse = max(dot(normal, lightDir), 0.0); // Lambertian diffuse
        vec3 viewDir = normalize(vNormal); // Assuming camera space
        vec3 halfwayDir = normalize(lightDir + viewDir); // Halfway vector for Blinn-Phong
        float specular = pow(max(dot(normal, halfwayDir), 0.0), shininess); // Specular term

        if (showTextureFlag && textureUploaded) {
            vec4 textureColor = texture2D(uSampler, vTexCoord);
            gl_FragColor = vec4(textureColor.rgb * (diffuse * vec3(1.0) + specular * vec3(1.0)), textureColor.a); // Apply lighting to texture color
        } else {
            gl_FragColor = vec4(diffuse * vec3(1.0) + specular * vec3(1.0), 1.0); // Add diffuse and specular components
        }
    }
`;



