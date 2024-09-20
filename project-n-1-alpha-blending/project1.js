// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite(bgImg, fgImg, fgOpac, fgPos) {
    var bgData = bgImg.data;
    var fgData = fgImg.data;
    var bgWidth = bgImg.width;
    var fgWidth = fgImg.width;
    var fgHeight = fgImg.height;
    var bgHeight = bgImg.height;
    
    // Loop through each pixel of the foreground image
    for (var y = 0; y < fgHeight; y++) {
        for (var x = 0; x < fgWidth; x++) {
            // Calculate the position in the background image
            var bgX = x + fgPos.x;
            var bgY = y + fgPos.y;

            // If the pixel is within the bounds of the background image
            if (bgX >= 0 && bgX < bgWidth && bgY >= 0 && bgY < bgHeight) {
                // Calculate the positions in the data arrays
                var bgIndex = (bgY * bgWidth + bgX) * 4;
                var fgIndex = (y * fgWidth + x) * 4;
                
                // Apply opacity to the foreground pixel
                var alpha = fgData[fgIndex + 3] / 255 * fgOpac;
                
                // Composite the foreground pixel onto the background pixel
                for (var i = 0; i < 3; i++) {
                    bgData[bgIndex + i] = fgData[fgIndex + i] * alpha + bgData[bgIndex + i] * (1 - alpha);
                }
                
                // Update alpha channel of the background pixel
                bgData[bgIndex + 3] = 255 - (1 - alpha) * (255 - bgData[bgIndex + 3]);
            }
        }
    }
}

