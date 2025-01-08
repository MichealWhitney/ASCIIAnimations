// Spinning Cube in ASCII Art
// 2025-01-03

function initializeArt() {

    const chars = " .,-~:;=!*#$@%&"; // shading from lightest to darkest
    const canvasWidth = 80;
    const canvasHeight = 80;
    const aspectRatio = canvasHeight / canvasWidth;

    let A = 0; // Rotation angle A
    let B = 0; // Rotation angle B

    const container = document.getElementById("ascii-container"); // Target the container on the page

    function renderCube() {
        /*
        Stores depth value (z) for each pixel on the canvas. Why is this needed? 
        If two points project to the same (x,y) pos on screen, the one with a larger Z value (closer to the screen) is drawn. 
        */
        const zBuffer = Array(canvasWidth * canvasHeight).fill(-Infinity);
        const output = Array(canvasWidth * canvasHeight).fill(" ");  // holds the ascii characters for current frame. will contain final characters for rendering

        const sin = Math.sin;
        const cos = Math.cos;

        // Vertices of a cube (-1 to 1 in x, y, z)
        // Defines the 8 corners of the cube in 3d space 
        const vertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // defines the back face of the cube
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]      // defines the front face of the cube
        ];

        // defines the 12 edges connecting the vertices
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // back face of the cube
            [4, 5], [5, 6], [6, 7], [7, 4], // front face of the cube
            [0, 4], [1, 5], [2, 6], [3, 7]  // connects back face to the front face; makes the cubes sides
        ];

        // Rotation matrix
        // Rotates a 3d point around 2 axes, A and B 
        const rotate = (x, y, z) => {
            // (X-Z rotation) applies rotation to matrix to rotate point around y-axis
            const xRot = x * cos(A) - z * sin(A);
            const zRot = x * sin(A) + z * cos(A);

            // (Y-Z rotation) applies a second rotation matrix to rotate the point around x-axis 
            const yRot = y * cos(B) - zRot * sin(B);
            const zFinal = y * sin(B) + zRot * cos(B);
            return [xRot, yRot, zFinal];
        };

        // Project 3D point to 2D screen
        const project = ([x, y, z]) => {
            const perspective = 1 / (z + 4);  // inversely scaling 2d coordinates with the depth (constant ensures all z values are in a valid range)

            // centers cube horizontally and scales based on perspective 
            const px = Math.floor((canvasWidth / 2) + x * perspective * canvasWidth / 2);
            // centers cube vertically and accounts for canvas aspect ratio to ensure proper scaling
            const py = Math.floor((canvasHeight / 2) - y * perspective * canvasWidth / 2 * aspectRatio);
            // returns 2d screen coordinates and perspective depth (used for shading)
            return [px, py, perspective];
        };

        // Draw edges
        for (const [start, end] of edges) {  // looping through edges array, each edge is a pair of vertices (start/end)

            // retrieve 3d coordinates of two vertices that define the edge, and rotates them
            const [x1, y1, z1] = rotate(...vertices[start]);
            const [x2, y2, z2] = rotate(...vertices[end]);

            // project these 3d vertices which we rotated onto 2d canvas 
            const [px1, py1, pz1] = project([x1, y1, z1]);
            const [px2, py2, pz2] = project([x2, y2, z2]);

            // Draw a line between px1, py1 and px2, py2
            // calculates difference in x,y coordinates between the 2 projected points
            const dx = Math.abs(px2 - px1);
            const dy = Math.abs(py2 - py1);

            // steps determines # of interpolation steps needed to draw smooth line b/w the two points, the larger difference is chosen
            const steps = Math.max(dx, dy);

            // awesome math stuff yippie
            for (let i = 0; i <= steps; i++) {
                // uses linear interpolation to calculate points between the two endpoints of the edge
                const t = i / steps;    // "t = i / steps" is linear interpolation
                const x = Math.round(px1 + t * (px2 - px1));
                const y = Math.round(py1 + t * (py2 - py1));
                const z = pz1 + t * (pz2 - pz1);
                //console.log(`z: ${z}`);

                // update zBuffer and index buffer
                const idx = x + y * canvasWidth;  // maps (x,y) pos onto canvas using index in zBuffer and output arrays

                // checks idx is within bounds, and checks zBuffer to determine if point is closer to viewer than prev. drawn points
                // if current depth is > than stored depth, updates the buffers to reflect this
                if (idx >= 0 && idx < zBuffer.length && z > zBuffer[idx]) { 
                    zBuffer[idx] = z;

                    // Normalize z and map to shading characters
                    const normalizedZ = Math.max(0, Math.min(1, (z - 0.1) / 0.9)); // Normalize z to [0, 1]
                    const charIndex = Math.floor(normalizedZ * (chars.length - 1));
                    output[idx] = chars[charIndex];   // assigns a char to represent depth of the point

                    // shader is not working exactly how I wanted it to work but we do have a spinning cube so we will take it :) 
                }
            }
        }
        // Render the frame
        let frame = "";     // store entire ascii art for current animation step as a single string
        for (let i = 0; i < output.length; i++) {   
            frame += output[i];     // for each element in output, append it to frame str (builds the art row by row)
            if ((i + 1) % canvasWidth === 0) frame += "\n";     // at the end of each row, insert a line break, creating visual seperation b/w rows
        }
        container.textContent = frame; // render the frame in the container

        // increment angles
        A += 0.05;
        B += 0.03;
    }
        const interval = setInterval(renderCube, 50); // start the cube animation
        return interval;
}
