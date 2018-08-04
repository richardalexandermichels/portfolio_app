(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

document.getElementById('_drawMaze').onclick = function () {
    var canvasContainer = document.getElementById('mazeCanvasContainer');
    var oldCanvas = document.getElementById('mazeCanvas');
    if (!!oldCanvas) {
        canvasContainer.removeChild(oldCanvas);
    }
    var m = document.createElement('canvas');

    m.id = "mazeCanvas";
    m.width = +document.getElementById('_mazeHeight').value * SQUARE_SIZE;
    m.height = +document.getElementById('_mazeWidth').value * SQUARE_SIZE;
    m.style.zIndex = 8;
    canvasContainer.append(m);

    var mazeHeight = m.clientHeight,
        mazeWidth = m.clientWidth;
    ctx = m.getContext('2d');
    mazeHeight = mazeHeight / SQUARE_SIZE;
    mazeWidth = mazeWidth / SQUARE_SIZE;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = 'rgb(0, 0, 0, 1)';;
    ctx.lineWidth = 2;

    var data = {
        mazeHeight: mazeHeight,
        mazeWidth: mazeWidth
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
        mazeToMake = mTm;
        initGrid(ctx, mTm, mazeHeight, mazeWidth);
    });
};

function initGrid(ctx, mazeToMake, mazeHeight, mazeWidth) {

    Object.getPrototypeOf(mazeToMake[0][0]).fill = function (ctx, color) {
        ctx.fillStyle = color;
        ctx.fillRect(
        /*x1*/
        this.wallX + 1,
        /*y1*/
        this.wallY + 1,
        /*width*/
        SQUARE_SIZE - 2,
        /*height*/
        SQUARE_SIZE - 2);
    };

    for (var k = 0; k <= mazeWidth * SQUARE_SIZE; k += SQUARE_SIZE) {
        //iterate through columns
        ctx.beginPath();
        ctx.moveTo(k, 0);
        ctx.lineTo(k, mazeHeight * SQUARE_SIZE);
        ctx.stroke();
        ctx.closePath();
    }
    for (var j = 0; j <= mazeHeight * SQUARE_SIZE; j += SQUARE_SIZE) {
        //iterate through rows
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(mazeWidth * SQUARE_SIZE, j);
        ctx.stroke();
        ctx.closePath();
    }
    for (var i = 0; i < mazeHeight; i++) {
        for (var n = 0; n < mazeWidth; n++) {
            mazeToMake[i][n].visited = false;
            for (var dir in mazeToMake[i][n].brokenWalls) {
                breakWall(mazeToMake[i][n], mazeToMake[i][n].brokenWalls[dir], ctx);
            }
        }
    }
}

function breakWall(node, direction, ctx) {
    // console.log("Break " + direction, node.id)
    // node.brokenWall = direction;
    if (direction == 'east') {
        // console.log("Break East", node.wallX);
        // console.log("Node width,height", (node.wallX - node.wallX + SQUARE_SIZE), (node.wallY - node.wallY + SQUARE_SIZE));
        //Break right wall

        ctx.fillRect(
        /*x1*/
        node.wallX + SQUARE_SIZE - 4,
        /*y1*/
        node.wallY + 1,
        /*width*/
        8,
        /*height*/
        SQUARE_SIZE - 2);
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
        SQUARE_SIZE - 2);
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
        SQUARE_SIZE - 2,
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
        node.wallY + SQUARE_SIZE - 4,
        /*width*/
        SQUARE_SIZE - 2,
        /*height*/
        8);
    }
}

},{}],2:[function(require,module,exports){
'use strict';

var _drawMaze = require('./drawMaze.js');

var drawMaze = _interopRequireWildcard(_drawMaze);

var _playMaze = require('./playMaze.js');

var playMaze = _interopRequireWildcard(_playMaze);

var _solveMaze = require('./solveMaze.js');

var solveMaze = _interopRequireWildcard(_solveMaze);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

},{"./drawMaze.js":1,"./playMaze.js":3,"./solveMaze.js":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
'use strict';

var mazeToSolve;
var mazeHeight;
var mazeWidth;
var currentNode;
var stack = [];
var directionsArr = ['east', 'west', 'north', 'south'];

function init() {
    mazeToSolve = mazeToMake;
    mazeHeight = mazeToSolve.length;
    mazeWidth = mazeToSolve[0].length;
    currentNode = mazeToSolve[0][0];
    currentNode.visited = true;
    Object.getPrototypeOf(currentNode).fillPath = function (ctx, color, fromDir) {
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
            SQUARE_SIZE - 2);
        }
        if (fromDir == 'west') {
            ctx.fillRect(
            /*x1*/
            this.wallX + SQUARE_SIZE - 1,
            /*y1*/
            this.wallY + 1,
            /*width*/
            2,
            /*height*/
            SQUARE_SIZE - 2);
        }
        if (fromDir == 'north') {
            ctx.fillRect(
            /*x1*/
            this.wallX + 1,
            /*y1*/
            this.wallY + SQUARE_SIZE - 1,
            /*width*/
            SQUARE_SIZE - 2,
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
            SQUARE_SIZE - 2,
            /*height*/
            2);
        }
    };
    currentNode.fill(ctx, 'red');
    stack.push(currentNode);
    console.log(mazeHeight, mazeWidth);
    window.requestAnimationFrame(draw);
}

function draw() {
    var ctx = document.getElementById('mazeCanvas').getContext('2d');
    var unvisitedNeighbors = nextUnvisited(currentNode);
    var randomUnvisited = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
    //currentNode = move(currentNode, 'east');
    // console.log("currentNode " + currentNode, "visited: " + currentNode.visited == false);

    unvisitedNeighbors = nextUnvisited(currentNode);

    if (unvisitedNeighbors.length) {
        stack.push(currentNode);
        randomUnvisited = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
        currentNode = move(currentNode, randomUnvisited);
        currentNode.fill(ctx, 'red');
        currentNode.fillPath(ctx, 'red', randomUnvisited);
        currentNode.fromDir = randomUnvisited;
    } else {
        currentNode.fill(ctx, '#ffffff');
        currentNode.fillPath(ctx, '#ffffff', currentNode.fromDir);

        currentNode = stack.pop();
    }

    if (currentNode.x != mazeWidth - 1 || currentNode.y != mazeHeight - 1) {
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

},{}]},{},[2]);
