document.addEventListener("DOMContentLoaded", function(event) {
    var c = document.getElementById("gameOfLifeCanvas");
    var g = document.getElementById("gridCanvas");
    var overLayHeight = g.height;
    var overLayWidth = g.width;
    var gridHeight = c.height;
    var gridWidth = c.width;
    var theGrid = createArray(gridWidth);
    var mirrorGrid = createArray(gridWidth);
    var ctx = c.getContext("2d");
    var overlayCtx = g.getContext("2d");
    var requestId,
        fpsInterval,
        then,
        startTime,
        now,
        elapsed,
        SQUARE_SIZE = 20
    ctx.fillStyle = "#000000";

    fillRandom(); //create the starting state for the grid by filling it with random cells
    drawGrid();
    initGrid();
    //startAnimating(20);
    //tick(); //call main loop

    // initialize the timer variables and start the animation

    function startAnimating(fps) {
        fpsInterval = FPSINTERVALNUM / fps;
        then = Date.now();
        startTime = then;
        animate();
    }

    // the animation loop calculates time elapsed since the last loop
    // and only draws if your specified fps interval is achieved

    function animate() {

        // request another frame

        requestId = window.requestAnimationFrame(animate);

        // calc elapsed time since last loop

        now = Date.now();
        elapsed = now - then;

        // if enough time has elapsed, draw the next frame

        if (elapsed > fpsInterval) {

            // Get ready for next frame by setting then=now, but also adjust for your
            // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
            then = now - (elapsed % fpsInterval);

            // Put your drawing code here
            drawGrid();
            updateGrid();

        }
    }

    function stop() {
        if (requestId) {
            window.cancelAnimationFrame(requestId);
            requestId = undefined;
        }
    }

    c.onclick = function(evt) {
        var posRaw = getMousePos(c, evt);
        var pos = {
            x: Math.floor(posRaw.x / SQUARE_SIZE) * SQUARE_SIZE,
            y: Math.floor(posRaw.y / SQUARE_SIZE) * SQUARE_SIZE
        };
        theGrid[pos.x][pos.y] = 1 - theGrid[pos.x][pos.y];
        drawGrid();

    };

    document.getElementById("animateButton").onclick = function() {
        startAnimating(document.getElementById("animationSpeed").value || 20);
    };

    document.getElementById("stopButton").onclick = function() {
        stop();
    };

    document.getElementById("resetButton").onclick = function() {
        fillRandom();
        drawGrid();
    };
    document.getElementById("clearButton").onclick = function() {
        clearGrid();
    };



    function fillRandom() { //fill the grid randomly
        for (var j = SQUARE_SIZE; j < gridHeight - SQUARE_SIZE; j += SQUARE_SIZE) { //iterate through rows
            for (var k = SQUARE_SIZE; k < gridWidth - SQUARE_SIZE; k += SQUARE_SIZE) { //iterate through columns
                theGrid[j][k] = Math.round(Math.random());
            }
        }
    }

    function clearGrid() {
        ctx.clearRect(0, 0, gridHeight, gridWidth);
        for (var j = SQUARE_SIZE; j < gridHeight - SQUARE_SIZE; j += SQUARE_SIZE) { //iterate through rows
            for (var k = SQUARE_SIZE; k < gridWidth - SQUARE_SIZE; k += SQUARE_SIZE) { //iterate through columns
                theGrid[j][k] = 0;
            }
        }
    }

    function initGrid() {
        for (var k = 0; k <= gridWidth; k += SQUARE_SIZE) { //iterate through columns
            overlayCtx.beginPath();
            overlayCtx.moveTo(k, 0);
            overlayCtx.lineTo(k, gridHeight);
            overlayCtx.stroke();
            overlayCtx.closePath();
        }
        for (var j = 0; j <= gridHeight; j += SQUARE_SIZE) { //iterate through rows
            overlayCtx.beginPath();
            overlayCtx.moveTo(0, j);
            overlayCtx.lineTo(gridWidth, j);
            overlayCtx.stroke();
            overlayCtx.closePath();
        }
    }

    function drawGrid() { //draw the contents of the grid onto a canvas
        var liveCount = 0;
        ctx.clearRect(0, 0, gridHeight, gridWidth); //this should clear the canvas ahead of each redraw
        for (var j = SQUARE_SIZE; j < gridHeight; j += SQUARE_SIZE) { //iterate through rows
            for (var k = SQUARE_SIZE; k < gridWidth; k += SQUARE_SIZE) { //iterate through columns
                if (theGrid[j][k] === 1) {
                    ctx.fillRect(j, k, SQUARE_SIZE, SQUARE_SIZE);
                    liveCount++;
                }
            }
        }
        //console.log(liveCount / SQUARE_SIZE0);
    }

    function updateGrid() { //perform one iteration of grid update

        for (var j = SQUARE_SIZE; j < gridHeight - SQUARE_SIZE; j += SQUARE_SIZE) { //iterate through rows
            for (var k = SQUARE_SIZE; k < gridWidth - SQUARE_SIZE; k += SQUARE_SIZE) { //iterate through columns
                var totalCells = 0;
                //add up the total values for the surrounding cells
                totalCells += theGrid[j - SQUARE_SIZE][k - SQUARE_SIZE]; //top left
                totalCells += theGrid[j - SQUARE_SIZE][k]; //top center
                totalCells += theGrid[j - SQUARE_SIZE][k + SQUARE_SIZE]; //top right

                totalCells += theGrid[j][k - SQUARE_SIZE]; //middle left
                totalCells += theGrid[j][k + SQUARE_SIZE]; //middle right

                totalCells += theGrid[j + SQUARE_SIZE][k - SQUARE_SIZE]; //bottom left
                totalCells += theGrid[j + SQUARE_SIZE][k]; //bottom center
                totalCells += theGrid[j + SQUARE_SIZE][k + SQUARE_SIZE]; //bottom right

                //apply the rules to each cell
                switch (totalCells) {
                    case 2:
                        mirrorGrid[j][k] = theGrid[j][k];

                        break;
                    case 3:
                        mirrorGrid[j][k] = 1; //live

                        break;
                    default:
                        mirrorGrid[j][k] = 0; //
                }
            }
        }

        //mirror edges to create wraparound effect

        for (var l = SQUARE_SIZE; l < gridHeight - 1; l += SQUARE_SIZE) { //iterate through rows
            //top and bottom
            mirrorGrid[l][0] = mirrorGrid[l][gridHeight - SQUARE_SIZE * 3];
            mirrorGrid[l][gridHeight - SQUARE_SIZE] = mirrorGrid[l][SQUARE_SIZE];
            //left and right
            mirrorGrid[0][l] = mirrorGrid[gridHeight - SQUARE_SIZE * 3][l];
            mirrorGrid[gridHeight - SQUARE_SIZE][l] = mirrorGrid[SQUARE_SIZE][l];

        }


        //swap grids
        var temp = theGrid;
        theGrid = mirrorGrid;
        mirrorGrid = temp;
    }

});