// Spinning Heart in ASCII Art
// 2025-01-05
/*
    credit for original code: https://www.youtube.com/watch?v=wsf6ORBDcfg
    i only converted from java to javascript, all math logic can be attributed to that video :salute: 
*/

function initializeArt() {

    const chars = " .,-~:;=!*#$@"; // shading from lightest to darkest
    const canvasWidth = 90;
    const canvasHeight = 50;
    const container = document.getElementById("ascii-container");

    let t = 0; // represents time 

    function renderHeart() {
        /*
        Stores depth value (z) for each pixel on the canvas. Why is this needed? 
        If two points project to the same (x,y) pos on screen, the one with a larger Z value (closer to the screen) is drawn. 
        */
        const zBuffer = Array(canvasWidth * canvasHeight).fill(0);

        let maxz = 0; // keeps track of maximum z value, used to normalize all the depth values so they can be mapped to characters set for shading

        // cosine and sine of the current time, useful for smooth perdoic changes
        const c = Math.cos(t);
        const s = Math.sin(t);

        // iterate over the y value in range [-0.5, 0.5] with a step of 0.01 (y representing vertical pos in 2d space)
        for (let y = -0.5; y <= 0.5; y += 0.01) {   
            // calcualtes radius of the heart at current y pos
            // r varies over time t, simulating a "beating" effect
            const r = 0.4 + 0.05 * Math.pow(0.5 + 0.5 * Math.sin(t * 6 + y * 2), 8);

            // iterate over the x value in range [-0.5, 0.5] with a step of 0.01 (x represents horizontal pos in 2d space)
            for (let x = -0.5; x <= 0.5; x += 0.01) {
                // z determines whether the current (x,y) lies within the hearts shape
                const z = -x * x - Math.pow(1.2 * y - Math.abs(x) * 2 / 3, 2) + r * r;
                if (z < 0) continue; // If z falls outside the hearts shape, we skip the rest of this 'x' loop and continue with the next 'x' value

                // calculate a scaled depth value for the current (x,y) point
                // points higher up (larger y) would be larger in depth, points lower would be compressed
                const sqrtZ = Math.sqrt(z) / (2 - y);
                for (let tz = -sqrtZ; tz <= sqrtZ; tz += sqrtZ / 6) {   // iterates over depth tz, which represents the depth extent of the current (x,y) in the hearts shape

                    const nx = x * c - tz * s;      // rotates current (x, tz) point around y-axis to get new x
                    const nz = x * s + tz * c;      // rotates current (z, tz) point around y-axis to get new z
                    const p = 1 + nz / 2;           // applies a perspective projection by scaling based on depth (nz)

                    const vx = Math.round((nx * p + 0.5) * canvasWidth / 2);    // projects the rotated x coordinate (nx) onto 2d canvas
                    const vy = Math.round((-y * p + 0.5) * canvasHeight / 2);   // projects vertical pos (y) onto canvas

                    const idx = vx + vy * canvasWidth;                          // maps the 2d pixel cooridnate (vx, vy) to 1d index

                    if (zBuffer[idx] <= nz) {       // checks if current depth nz at the pixel is greater than or equal to depth stored in zBuffer at this index 
                        zBuffer[idx] = nz;          // if the current point is closer to the viewer than the previous one, update it
                        if (maxz <= nz) maxz = nz;  // tracks maximum depth across entire canvas 
                    }
                }
            }
        }

        let output = ""; // Initialize empty output string
        for (let i = 0; i < zBuffer.length; i++) {
            output += i % canvasWidth !== 0     // if current index is the start of a new row
                ? chars[Math.floor((zBuffer[i] / maxz) * (chars.length - 1))] || " "  // if not at start of a new row, append approipate ascii character depending on depth value
                : "\n";                                                               // if we are at the start of a new row, append a newline character
        }

        container.textContent = output;   // contains completed ascii art output for this frame

        t += 0.01; // Increment time for animation
    }

    const interval = setInterval(renderHeart, 30);
    return interval;
}
