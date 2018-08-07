(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var GRID_SIZE;

document.getElementById('_drawMaze').onclick = drawMaze;
document.getElementById('_drawMaze').click();

function drawMaze() {
    var canvasContainer = document.getElementById('mazeCanvasContainer');
    canvasContainer.style.margin = '10px';
    GRID_SIZE = +document.getElementById('_gridSize').value;
    var oldCanvas = document.getElementById('mazeCanvas');
    if (!!oldCanvas) {
        canvasContainer.removeChild(oldCanvas);
    }
    var m = document.createElement('canvas');
    // m.style.border = '1px solid black';
    m.id = "mazeCanvas";
    m.width = +document.getElementById('_mazeWidth').value * GRID_SIZE;
    m.height = +document.getElementById('_mazeHeight').value * GRID_SIZE;
    m.style.zIndex = 8;
    canvasContainer.append(m);

    var mazeHeight = m.clientHeight,
        mazeWidth = m.clientWidth,
        gridSize = +document.getElementById('_gridSize').value;
    ctx = m.getContext('2d');
    mazeHeight = mazeHeight / GRID_SIZE;
    mazeWidth = mazeWidth / GRID_SIZE;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = 'rgb(0, 0, 0, 1)';;
    ctx.lineWidth = 2;

    var image = m.toDataURL("image/png").replace("image/png", "image/octet-stream"); // here is the most important part because if you dont replace you will get a DOM 18 exception.
    document.getElementById('_saveCanvas').onclick = function () {
        var link = document.getElementById('_canvasSaveAs');
        var fileName = document.getElementById('_fileName').value;
        if (fileName === null || fileName.length == 0) {
            fileName = 'MyMaze';
        }
        link.setAttribute('download', fileName + '.png');
        link.setAttribute('href', m.toDataURL("image/png").replace("image/png", "image/octet-stream"));
        link.click();
    };

    var data = {
        mazeHeight: mazeHeight,
        mazeWidth: mazeWidth,
        gridSize: gridSize
    };
    fetch('/maze', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        // console.log(response)
        return response.json();
    }).then(function (mTm) {
        ANIMATE = false;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = 'rgb(0, 0, 0, 1)';
        mazeToMake = mTm;
        initGrid(ctx, mTm, mazeHeight, mazeWidth);
    });
};

function initGrid(ctx, mazeToMake, mazeHeight, mazeWidth) {
    ctx.fillRect(
    /*x1*/
    0,
    /*y1*/
    0,
    /*width*/
    mazeWidth * GRID_SIZE,
    /*height*/
    mazeHeight * GRID_SIZE);
    if (!document.getElementById('_hideLines').checked) {
        for (var k = 0; k <= mazeWidth * GRID_SIZE; k += GRID_SIZE) {
            //iterate through columns
            ctx.beginPath();
            ctx.moveTo(k, 0);
            ctx.lineTo(k, mazeHeight * GRID_SIZE);
            ctx.stroke();
            ctx.closePath();
        }
        for (var j = 0; j <= mazeHeight * GRID_SIZE; j += GRID_SIZE) {
            //iterate through rows
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(mazeWidth * GRID_SIZE, j);
            ctx.stroke();
            ctx.closePath();
        }
    }
    for (var i = 0; i < mazeHeight; i++) {
        for (var n = 0; n < mazeWidth; n++) {
            mazeToMake[i][n].visited = false;
            if (!document.getElementById('_hideLines').checked) {
                for (var dir in mazeToMake[i][n].brokenWalls) {
                    breakWall(mazeToMake[i][n], mazeToMake[i][n].brokenWalls[dir], ctx);
                }
            }
        }
    }
}

function breakWall(node, direction, ctx) {
    // console.log("Break " + direction, node.id)
    // node.brokenWall = direction;
    if (direction == 'east') {
        // console.log("Break East", node.wallX);
        // console.log("Node width,height", (node.wallX - node.wallX + GRID_SIZE), (node.wallY - node.wallY + GRID_SIZE));
        //Break right wall

        ctx.fillRect(
        /*x1*/
        node.wallX + GRID_SIZE - 4,
        /*y1*/
        node.wallY + 1,
        /*width*/
        8,
        /*height*/
        GRID_SIZE - 2);
    }
    if (direction == 'west') {
        // console.log("Break West", node.wallX);
        //Break left wall
        ctx.fillRect(
        /*x1*/
        node.wallX - 4,
        /*y1*/
        node.wallY + 1,
        /*width*/
        8,
        /*height*/
        GRID_SIZE - 2);
    }
    if (direction == 'north') {
        // console.log("Break North", node.wallY);
        //Break left wall
        ctx.fillRect(
        /*x1*/
        node.wallX + 1,
        /*y1*/
        node.wallY - 4,
        /*width*/
        GRID_SIZE - 2,
        /*height*/
        8);
    }
    if (direction == 'south') {
        // console.log("Break South", node.wallY);
        //Break left wall
        ctx.fillRect(
        /*x1*/
        node.wallX + 1,
        /*y1*/
        node.wallY + GRID_SIZE - 4,
        /*width*/
        GRID_SIZE - 2,
        /*height*/
        8);
    }
}

},{}],2:[function(require,module,exports){
"use strict";

document.addEventListener("DOMContentLoaded", function (event) {
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
        SQUARE_SIZE = 20;
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
            then = now - elapsed % fpsInterval;

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

    c.onclick = function (evt) {
        var posRaw = getMousePos(c, evt);
        var pos = {
            x: Math.floor(posRaw.x / SQUARE_SIZE) * SQUARE_SIZE,
            y: Math.floor(posRaw.y / SQUARE_SIZE) * SQUARE_SIZE
        };
        theGrid[pos.x][pos.y] = 1 - theGrid[pos.x][pos.y];
        drawGrid();
    };

    document.getElementById("animateButton").onclick = function () {
        startAnimating(document.getElementById("animationSpeed").value || 20);
    };

    document.getElementById("stopButton").onclick = function () {
        stop();
    };

    document.getElementById("resetButton").onclick = function () {
        fillRandom();
        drawGrid();
    };
    document.getElementById("clearButton").onclick = function () {
        clearGrid();
    };

    function fillRandom() {
        //fill the grid randomly
        for (var j = SQUARE_SIZE; j < gridHeight - SQUARE_SIZE; j += SQUARE_SIZE) {
            //iterate through rows
            for (var k = SQUARE_SIZE; k < gridWidth - SQUARE_SIZE; k += SQUARE_SIZE) {
                //iterate through columns
                theGrid[j][k] = Math.round(Math.random());
            }
        }
    }

    function clearGrid() {
        ctx.clearRect(0, 0, gridHeight, gridWidth);
        for (var j = SQUARE_SIZE; j < gridHeight - SQUARE_SIZE; j += SQUARE_SIZE) {
            //iterate through rows
            for (var k = SQUARE_SIZE; k < gridWidth - SQUARE_SIZE; k += SQUARE_SIZE) {
                //iterate through columns
                theGrid[j][k] = 0;
            }
        }
    }

    function initGrid() {
        for (var k = 0; k <= gridWidth; k += SQUARE_SIZE) {
            //iterate through columns
            overlayCtx.beginPath();
            overlayCtx.moveTo(k, 0);
            overlayCtx.lineTo(k, gridHeight);
            overlayCtx.stroke();
            overlayCtx.closePath();
        }
        for (var j = 0; j <= gridHeight; j += SQUARE_SIZE) {
            //iterate through rows
            overlayCtx.beginPath();
            overlayCtx.moveTo(0, j);
            overlayCtx.lineTo(gridWidth, j);
            overlayCtx.stroke();
            overlayCtx.closePath();
        }
    }

    function drawGrid() {
        //draw the contents of the grid onto a canvas
        var liveCount = 0;
        ctx.clearRect(0, 0, gridHeight, gridWidth); //this should clear the canvas ahead of each redraw
        for (var j = SQUARE_SIZE; j < gridHeight; j += SQUARE_SIZE) {
            //iterate through rows
            for (var k = SQUARE_SIZE; k < gridWidth; k += SQUARE_SIZE) {
                //iterate through columns
                if (theGrid[j][k] === 1) {
                    ctx.fillRect(j, k, SQUARE_SIZE, SQUARE_SIZE);
                    liveCount++;
                }
            }
        }
        //console.log(liveCount / SQUARE_SIZE0);
    }

    function updateGrid() {
        //perform one iteration of grid update

        for (var j = SQUARE_SIZE; j < gridHeight - SQUARE_SIZE; j += SQUARE_SIZE) {
            //iterate through rows
            for (var k = SQUARE_SIZE; k < gridWidth - SQUARE_SIZE; k += SQUARE_SIZE) {
                //iterate through columns
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

        for (var l = SQUARE_SIZE; l < gridHeight - 1; l += SQUARE_SIZE) {
            //iterate through rows
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

},{}],3:[function(require,module,exports){
'use strict';

var _drawMaze = require('./drawMaze.js');

var drawMaze = _interopRequireWildcard(_drawMaze);

var _playMaze = require('./playMaze.js');

var playMaze = _interopRequireWildcard(_playMaze);

var _solveMaze = require('./solveMaze.js');

var solveMaze = _interopRequireWildcard(_solveMaze);

var _gameOfLife = require('./gameOfLife.js');

var gameOfLife = _interopRequireWildcard(_gameOfLife);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

},{"./drawMaze.js":1,"./gameOfLife.js":2,"./playMaze.js":4,"./solveMaze.js":5}],4:[function(require,module,exports){
'use strict';

var mazeControls = {
    38: {
        direction: 'north',
        newX: function newX(oldX) {
            return oldX;
        },
        newY: function newY(oldY) {
            return oldY - 1;
        }
    },
    37: {
        direction: 'west',
        newX: function newX(oldX) {
            return oldX - 1;
        },
        newY: function newY(oldY) {
            return oldY;
        }
    },
    39: {
        direction: 'east',
        newX: function newX(oldX) {
            return oldX + 1;
        },
        newY: function newY(oldY) {
            return oldY;
        }
    },
    40: {
        direction: 'south',
        newX: function newX(oldX) {
            return oldX;
        },
        newY: function newY(oldY) {
            return oldY + 1;
        }
    }
};

var dirOpposite = {
    'east': 'west',
    'west': 'east',
    'north': 'south',
    'south': 'north'
};

var mazePlayer = {
    startPlaying: function startPlaying() {
        var cur;
        var ctx = document.getElementById('mazeCanvas').getContext('2d');
        mazeToMake[0][0].fill(ctx, 'red');
        cur = {
            x: 0,
            y: 0
        };
        window.addEventListener('keydown', function (e) {
            // space and arrow keys
            if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }

            if (!!mazeControls[e.keyCode]) {
                if (!!mazeToMake[cur.y][cur.x].brokenWalls && mazeToMake[cur.y][cur.x].brokenWalls.indexOf(mazeControls[e.keyCode].direction) > -1) {
                    mazeToMake[cur.y][cur.x].fill(ctx, 'white');
                    cur.y = mazeControls[e.keyCode].newY(cur.y);
                    cur.x = mazeControls[e.keyCode].newX(cur.x);
                    if (!!mazeToMake[cur.y][cur.x].brokenWalls && mazeToMake[cur.y][cur.x].brokenWalls.indexOf(dirOpposite[mazeControls[e.keyCode].direction])) {
                        mazeToMake[cur.y][cur.x].brokenWalls.push(dirOpposite[mazeControls[e.keyCode].direction]);
                    } else if (!mazeToMake[cur.y][cur.x].brokenWalls) {

                        mazeToMake[cur.y][cur.x].brokenWalls = [dirOpposite[mazeControls[e.keyCode].direction]];
                    }
                    mazeToMake[cur.y][cur.x].fill(ctx, 'red');
                }
            }
        }, false);
    }
};

document.getElementById('_playMaze').onclick = mazePlayer.startPlaying;

},{}],5:[function(require,module,exports){
'use strict';

var mazeToSolve;
var mazeHeight;
var mazeWidth;
var currentNode;
var stack = [];
var directionsArr = ['east', 'west', 'north', 'south'];
var GRID_SIZE;
var SQUARE_MULTIPLYER = 1;

function init() {
    mazeToSolve = mazeToMake;
    mazeHeight = mazeToSolve.length;
    mazeWidth = mazeToSolve[0].length;
    GRID_SIZE = +document.getElementById('_gridSize').value;
    currentNode = mazeToSolve[0][0];
    currentNode.visited = true;
    ANIMATE = true;
    SQUARE_MULTIPLYER = !!document.getElementById('_squareSize').value ? document.getElementById('_squareSize').value : 1;

    Object.getPrototypeOf(mazeToMake[0][0]).fill = function (ctx, color) {
        var drawSizeH = GRID_SIZE * SQUARE_MULTIPLYER;
        var drawSizeW = GRID_SIZE * SQUARE_MULTIPLYER;
        if (document.getElementById('_randomSize').checked) {
            drawSizeH = Math.floor(Math.random() * (GRID_SIZE * SQUARE_MULTIPLYER));
            drawSizeW = Math.floor(Math.random() * (GRID_SIZE * SQUARE_MULTIPLYER));
        }
        ctx.fillStyle = color;
        ctx.fillRect(
        /*x1*/
        this.wallX + 1,
        /*y1*/
        this.wallY + 1,
        /*width*/
        drawSizeW - 2,
        /*height*/
        drawSizeH - 2);
    };

    Object.getPrototypeOf(currentNode).fillPath = function (ctx, color, fromDir) {
        var drawSizeH = GRID_SIZE * SQUARE_MULTIPLYER;
        var drawSizeW = GRID_SIZE * SQUARE_MULTIPLYER;
        if (document.getElementById('_randomSize').checked) {
            drawSizeH = Math.floor(Math.random() * (GRID_SIZE * SQUARE_MULTIPLYER));
            drawSizeW = Math.floor(Math.random() * (GRID_SIZE * SQUARE_MULTIPLYER));
        }
        ctx.fillStyle = color;
        if (fromDir == 'east') {
            ctx.fillRect(
            /*x1*/
            this.wallX - 1,
            /*y1*/
            this.wallY + 1,
            /*width*/
            2,
            /*height*/
            drawSizeH - 2);
        }
        if (fromDir == 'west') {
            ctx.fillRect(
            /*x1*/
            this.wallX + GRID_SIZE - 1,
            /*y1*/
            this.wallY + 1,
            /*width*/
            2,
            /*height*/
            drawSizeH - 2);
        }
        if (fromDir == 'north') {
            ctx.fillRect(
            /*x1*/
            this.wallX + 1,
            /*y1*/
            this.wallY + GRID_SIZE - 1,
            /*width*/
            drawSizeW - 2,
            /*height*/
            2);
        }
        if (fromDir == 'south') {
            ctx.fillRect(
            /*x1*/
            this.wallX + 1,
            /*y1*/
            this.wallY - 1,
            /*width*/
            drawSizeW - 2,
            /*height*/
            2);
        }
    };
    var color = document.getElementById('_color').value;
    currentNode.fill(ctx, color);
    stack.push(currentNode);
    window.requestAnimationFrame(draw);
}

function draw() {
    var ctx = document.getElementById('mazeCanvas').getContext('2d');
    var unvisitedNeighbors = nextUnvisited(currentNode);
    var randomUnvisited = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];

    unvisitedNeighbors = nextUnvisited(currentNode);

    if (unvisitedNeighbors.length) {
        stack.push(currentNode);
        randomUnvisited = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
        if (ANIMATE) {
            currentNode = move(currentNode, randomUnvisited);
            if (document.getElementById('_randomColor').checked) {
                currentNode.fill(ctx, '#' + Math.floor(Math.random() * 16777215).toString(16));
            } else {
                var color = document.getElementById('_color').value;
                currentNode.fill(ctx, color);
                currentNode.fillPath(ctx, color, randomUnvisited);
            }
        }
        // currentNode.fillPath(ctx, '#' + Math.floor(Math.random() * 16777215).toString(16), randomUnvisited);

        currentNode.fromDir = randomUnvisited;
    } else {
        currentNode.fill(ctx, '#ffffff');
        currentNode.fillPath(ctx, '#ffffff', currentNode.fromDir);

        currentNode = stack.pop();
    }

    if ((currentNode.x != mazeWidth - 1 || currentNode.y != mazeHeight - 1) && ANIMATE) {
        window.requestAnimationFrame(draw);
    }
}

function move(node, direction) {
    var nextNode = getNextNode(direction, node);
    if (!nextNode) {
        return false;
    }
    nextNode.visited = true;
    // breakWall(node, direction);
    return nextNode;
}

function nextUnvisited(node) {
    var unvisitedArr = [];
    var neighborNode;
    for (var i = 0; i < 4; i++) {
        neighborNode = getNextNode(directionsArr[i], node);
        if (!!neighborNode && !neighborNode.visited) {
            unvisitedArr.push(directionsArr[i]);
        }
    }
    return unvisitedArr;
}

function getNextNode(direction, node) {
    // console.log("get next node " + direction);
    //prolly need switch case
    if (!node.brokenWalls || node.brokenWalls.indexOf(direction) < 0) {
        return false;
    }
    if (direction == 'east') {
        // console.log("East", node.x, mazeWidth);
        if (node.x >= mazeWidth - 1) {
            return false;
        } else {
            // console.log("next node east ", mazeToSolve[node.y][node.x + 1])
            return mazeToSolve[node.y][node.x + 1];
        }
    }
    if (direction == 'west') {
        // console.log("West", node.x, mazeWidth);
        if (node.x <= 0) {
            return false;
        } else {
            // console.log("next node west ", mazeToSolve[node.y][node.x - 1])
            return mazeToSolve[node.y][node.x - 1];
        }
    }
    if (direction == 'north') {
        // console.log("North", node.y, mazeHeight);
        if (node.y <= 0) {
            return false;
        } else {
            // console.log("next node north ", mazeToSolve[node.y - 1][node.x])
            return mazeToSolve[node.y - 1][node.x];
        }
    }
    if (direction == 'south') {
        // console.log("South", node.y, mazeHeight);
        if (node.y >= mazeHeight - 1) {
            return false;
        } else {
            // console.log("next node south ", mazeToSolve[node.y + 1][node.x])
            return mazeToSolve[node.y + 1][node.x];
        }
    }
}

document.getElementById('_solveMaze').onclick = init;

},{}]},{},[3]);
