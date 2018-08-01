(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/*
                                                                        GAME OF LIFE CONSTANTS
                                                                        */
var FPSINTERVALNUM = 1000;
var SQUARE_SIZE = 20;
var globalObj = {};
/*
MAZE CONSTANTS
*/

exports.FPSINTERVALNUM = FPSINTERVALNUM;
exports.SQUARE_SIZE = SQUARE_SIZE;
exports.globalObj = globalObj;

},{}],2:[function(require,module,exports){
'use strict';

var _constants = require('./constants.js');

var constants = _interopRequireWildcard(_constants);

var _utils = require('./utils.js');

var _maze = require('./maze.js');

var maze = _interopRequireWildcard(_maze);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

},{"./constants.js":1,"./maze.js":3,"./utils.js":4}],3:[function(require,module,exports){
'use strict';

var _utils = require('./utils.js');

var _constants = require('./constants.js');

var m = document.getElementById('mazeCanvas'),
    mazeHeight = m.clientHeight,
    mazeWidth = m.clientWidth,
    ctx = m.getContext('2d');
mazeHeight = mazeHeight / _constants.SQUARE_SIZE;
mazeWidth = mazeWidth / _constants.SQUARE_SIZE;
ctx.fillStyle = "#ffffff";
ctx.strokeStyle = 'rgb(0, 0, 0, 1)';;
ctx.lineWidth = 2;
var theMaze = (0, _utils.createArray)(mazeHeight);
var directionsArr = ['east', 'west', 'north', 'south'];
theMaze.getX = function () {
    return 0;
};
_constants.globalObj.maze = theMaze;

var Node = function Node(x, y, visited) {
    this.x = x;
    this.y = y;
    this.visited = visited;
    this.wallX = x * _constants.SQUARE_SIZE;
    this.wallY = y * _constants.SQUARE_SIZE;
    this.getX = function () {
        return this.x * _constants.SQUARE_SIZE;
    };
    this.getY = function () {
        return this.x * _constants.SQUARE_SIZE;
    };
};

initGrid();
initMaze();
generateMaze();
// console.log(mazeHeight, mazeWidth)

//create maze 2d array

function initGrid() {
    console.log("HEY HEY " + mazeWidth * _constants.SQUARE_SIZE, _constants.SQUARE_SIZE);
    for (var k = 0; k <= mazeWidth * _constants.SQUARE_SIZE; k += _constants.SQUARE_SIZE) {
        //iterate through columns
        ctx.beginPath();
        ctx.moveTo(k, 0);
        ctx.lineTo(k, mazeHeight * _constants.SQUARE_SIZE);
        ctx.stroke();
        ctx.closePath();
    }
    for (var j = 0; j <= mazeHeight * _constants.SQUARE_SIZE; j += _constants.SQUARE_SIZE) {
        //iterate through rows
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(mazeWidth * _constants.SQUARE_SIZE, j);
        ctx.stroke();
        ctx.closePath();
    }
}

function initMaze() {
    //fill the grid randomly
    for (var j = 0; j < mazeHeight; j += 1) {
        //iterate through rows
        for (var k = 0; k < mazeWidth; k += 1) {
            //iterate through columns
            theMaze[j][k] = new Node(k, j, false);
        }
    }
    console.log(theMaze);
}

function generateMaze() {
    var n = mazeHeight * mazeWidth - 1;
    n--;
    // console.log("n: " + n)
    var node = theMaze[0][0];
    node.visited = true;
    var unvisitedNeighbors = nextUnvisited(node);
    var randomUnvisited = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
    var currentNode = move(node, randomUnvisited);
    //currentNode = move(currentNode, 'east');
    // console.log("currentNode " + currentNode, "visited: " + currentNode.visited == false);
    var stack = [];
    stack.push(currentNode);
    while (0 < n) {
        unvisitedNeighbors = nextUnvisited(currentNode);
        console.log("UNVISITED LENGTH " + unvisitedNeighbors.length);
        if (unvisitedNeighbors.length) {
            n = n - 1;
            randomUnvisited = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
            currentNode = move(currentNode, randomUnvisited);
            stack.push(currentNode);
        } else {
            currentNode = stack.pop();
        }
    }
}

function move(node, direction) {
    // console.log("Move " + direction);
    var nextNode = getNextNode(direction, node);
    if (!nextNode) {
        return false;
    }
    nextNode.visited = true;
    breakWall(node, direction);
    return nextNode;
}

function breakWall(node, direction) {
    if (direction == 'east') {
        // console.log("Break East", node.wallX);
        // console.log("Node width,height", (node.wallX - node.wallX + SQUARE_SIZE), (node.wallY - node.wallY + SQUARE_SIZE));
        //Break right wall
        ctx.fillRect(
        /*x1*/
        node.wallX + _constants.SQUARE_SIZE - 4,
        /*y1*/
        node.wallY + 1,
        /*width*/
        8,
        /*height*/
        _constants.SQUARE_SIZE - 2);
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
        _constants.SQUARE_SIZE - 2);
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
        _constants.SQUARE_SIZE - 2,
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
        node.wallY + _constants.SQUARE_SIZE - 4,
        /*width*/
        _constants.SQUARE_SIZE - 2,
        /*height*/
        8);
    }
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
    if (direction == 'east') {
        // console.log("East", node.x, mazeWidth);
        if (node.x >= mazeWidth - 1) {
            console.log("WRONG " + direction);
            return false;
        } else {
            // console.log("next node east ", theMaze[node.y][node.x + 1])
            return theMaze[node.y][node.x + 1];
        }
    }
    if (direction == 'west') {
        // console.log("West", node.x, mazeWidth);
        if (node.x <= 0) {
            console.log("WRONG " + direction);
            return false;
        } else {
            // console.log("next node west ", theMaze[node.y][node.x - 1])
            return theMaze[node.y][node.x - 1];
        }
    }
    if (direction == 'north') {
        // console.log("North", node.y, mazeHeight);
        if (node.y <= 0) {
            console.log("WRONG " + direction);
            return false;
        } else {
            // console.log("next node north ", theMaze[node.y - 1][node.x])
            return theMaze[node.y - 1][node.x];
        }
    }
    if (direction == 'south') {
        // console.log("South", node.y, mazeHeight);
        if (node.y >= mazeHeight - 1) {
            console.log("WRONG " + direction);
            return false;
        } else {
            // console.log("next node south ", theMaze[node.y + 1][node.x])
            return theMaze[node.y + 1][node.x];
        }
    }
}
// console.log(theMaze[0][0]);

// var nodeXdiff = theMaze[2 * SQUARE_SIZE][4 * SQUARE_SIZE].x - theMaze[2 * SQUARE_SIZE][5 * SQUARE_SIZE].x;
// var nodeYdiff = theMaze[2 * SQUARE_SIZE][4 * SQUARE_SIZE].y - theMaze[1 * SQUARE_SIZE][3 * SQUARE_SIZE].y;
// console.log('TEST', nodeXdiff, nodeYdiff);
// ctx.clearRect(2 * SQUARE_SIZE + 1, 2 * SQUARE_SIZE + 1, SQUARE_SIZE - 2, nodeYdiff - 1 + SQUARE_SIZE - 2);

// ctx.clearRect(81, 41, nodeXdiff - 1 + SQUARE_SIZE - 2, SQUARE_SIZE - 2);

},{"./constants.js":1,"./utils.js":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getMousePos = exports.createArray = undefined;

var _constants = require('./constants.js');

/*
CANVAS UTILS
*/

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function createArray(rows) {
    //creates a 2 dimensional array of required height
    var arr = [];
    for (var i = 0; i < rows; i += 1) {
        arr[i] = [];
    }
    return arr;
}

exports.createArray = createArray;
exports.getMousePos = getMousePos;

},{"./constants.js":1}]},{},[2]);
