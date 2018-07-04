import {
    createArray
} from './utils.js';

import {
    FPSINTERVALNUM,
    SQUARE_SIZE,
    globalObj
} from './constants.js';

var m = document.getElementById('mazeCanvas'),
    mazeHeight = m.height,
    mazeWidth = m.width,
    ctx = m.getContext('2d');
ctx.fillStyle = "#ffffff";
ctx.strokeStyle = 'rgb(0, 0, 0, 1)';;
ctx.lineWidth = 2;
var theMaze = createArray(mazeHeight);
var directionsArr = ['east', 'west', 'north', 'south'];
theMaze.getX = function() {
    return 0;
}
globalObj.maze = theMaze;

var Node = function(x, y, visited) {
    this.x = x;
    this.y = y;
    this.visited = visited;
    this.visit = function() {
        ctx.fillRect(
            /*x1*/
            this.x,
            /*y1*/
            this.y,
            /*x2*/
            SQUARE_SIZE,
            /*y2*/
            SQUARE_SIZE);
    }
};

initGrid();
initMaze();
generateMaze();
// console.log(mazeHeight, mazeWidth)

function initGrid() {
    for (var k = 0; k <= mazeWidth; k += SQUARE_SIZE) { //iterate through columns
        ctx.beginPath();
        ctx.moveTo(k, 0);
        ctx.lineTo(k, mazeHeight);
        ctx.stroke();
        ctx.closePath();
    }
    for (var j = 0; j <= mazeHeight; j += SQUARE_SIZE) { //iterate through rows
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(mazeWidth, j);
        ctx.stroke();
        ctx.closePath();
    }
}

function initMaze() { //fill the grid randomly
    for (var j = 0; j < mazeHeight; j += SQUARE_SIZE) { //iterate through rows
        for (var k = 0; k < mazeWidth; k += SQUARE_SIZE) { //iterate through columns
            theMaze[j][k] = new Node(k, j, false);
        }
    }
    console.log(theMaze);
}



function generateMaze() {
    var n = (mazeHeight * mazeWidth - (SQUARE_SIZE * SQUARE_SIZE)) / (SQUARE_SIZE * SQUARE_SIZE);
    n--
    console.log("n: " + n)
    var node = theMaze[0][0]
    node.visited = true;
    var unvisitedNeighbors = nextUnvisited(node);
    var randomUnvisited = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
    var currentNode = move(node, randomUnvisited);
    //currentNode = move(currentNode, 'east');
    console.log("currentNode " + currentNode, "visited: " + currentNode.visited == false);
    var stack = [];
    stack.push(currentNode);
    while (0 < n) {
        console.log("RANDOM")
        unvisitedNeighbors = nextUnvisited(currentNode);
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

function buildBranch(currentNode) {

}

function move(node, direction) {
    console.log("Move " + direction);
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
        //Break right wall
        ctx.fillRect(
            /*x1*/
            node.x + SQUARE_SIZE - 4,
            /*y1*/
            node.y + 1,
            /*x2*/
            8,
            /*y2*/
            SQUARE_SIZE - 2);
    }
    if (direction == 'west') {
        //Break left wall
        ctx.fillRect(
            /*x1*/
            node.x - 4,
            /*y1*/
            node.y + 1,
            /*x2*/
            8,
            /*y2*/
            SQUARE_SIZE - 2);
    }
    if (direction == 'north') {
        //Break left wall
        ctx.fillRect(
            /*x1*/
            node.x + 1,
            /*y1*/
            node.y - 4,
            /*x2*/
            SQUARE_SIZE - 2,
            /*y2*/
            8);
    }
    if (direction == 'south') {
        //Break left wall
        ctx.fillRect(
            /*x1*/
            node.x + 1,
            /*y1*/
            node.y + SQUARE_SIZE - 4,
            /*x2*/
            SQUARE_SIZE - 2,
            /*y2*/
            8);
    }
}

function nextUnvisited(node) {
    var unvisitedArr = [];
    var neighborNode;
    for (var i = 0; i < 4; i++) {
        neighborNode = getNextNode(directionsArr[i], node)
        if (!!neighborNode && !neighborNode.visited) {
            unvisitedArr.push(directionsArr[i]);
        }
    }
    return unvisitedArr;
}

function getNextNode(direction, node) {
    console.log("get next node " + direction);
    //prolly need switch case
    if (direction == 'east') {
        if (node.x >= mazeWidth) {
            return false;
        } else {
            return theMaze[node.y][node.x + SQUARE_SIZE];
        }

    }
    if (direction == 'west') {
        if (node.x < 0) {
            return false;
        } else {
            return theMaze[node.y][node.x - SQUARE_SIZE];
        }

    }
    if (direction == 'north') {
        console.log(node.x)
        if (node.y <= 0) {
            return false;
        } else {
            return theMaze[node.y - SQUARE_SIZE][node.x];
        }

    }
    if (direction == 'south') {
        console.log(node.x)
        if (node.y > mazeHeight - (SQUARE_SIZE * 2)) {
            return false;
        } else {
            return theMaze[node.y + SQUARE_SIZE][node.x];
        }

    }

}
console.log(theMaze[0][0]);

// var nodeXdiff = theMaze[2 * SQUARE_SIZE][4 * SQUARE_SIZE].x - theMaze[2 * SQUARE_SIZE][5 * SQUARE_SIZE].x;
// var nodeYdiff = theMaze[2 * SQUARE_SIZE][4 * SQUARE_SIZE].y - theMaze[1 * SQUARE_SIZE][3 * SQUARE_SIZE].y;
// console.log('TEST', nodeXdiff, nodeYdiff);
// ctx.clearRect(2 * SQUARE_SIZE + 1, 2 * SQUARE_SIZE + 1, SQUARE_SIZE - 2, nodeYdiff - 1 + SQUARE_SIZE - 2);

// ctx.clearRect(81, 41, nodeXdiff - 1 + SQUARE_SIZE - 2, SQUARE_SIZE - 2);