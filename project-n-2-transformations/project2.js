// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	var r = rotation * (Math.PI / 180);
	var cos = Math.cos(r);
    var sin = Math.sin(r);
	
	return Array( scale*cos, scale*sin, 0, 
				  -scale*sin, scale*cos, 0, 
				  positionX, positionY, 1);
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	var a11 = trans2[0], a12 = trans2[3], a13 = trans2[6];
    var a21 = trans2[1], a22 = trans2[4], a23 = trans2[7];
    var a31 = trans2[2], a32 = trans2[5], a33 = trans2[8];
    var b11 = trans1[0], b12 = trans1[3], b13 = trans1[6];
    var b21 = trans1[1], b22 = trans1[4], b23 = trans1[7];
    var b31 = trans1[2], b32 = trans1[5], b33 = trans1[8];

    return Array(
        (a11 * b11) + (a12 * b21) + (a13 * b31), (a21 * b11) + (a22 * b21) + (a23 * b31), (a31 * b11) + (a32 * b21) + (a33 * b31),
        (a11 * b12) + (a12 * b22) + (a13 * b32), (a21 * b12) + (a22 * b22) + (a23 * b32), (a31 * b12) + (a32 * b22) + (a33 * b32),
        (a11 * b13) + (a12 * b23) + (a13 * b33), (a21 * b13) + (a22 * b23) + (a23 * b33), (a31 * b13) + (a32 * b23) + (a33 * b33)
    );
}