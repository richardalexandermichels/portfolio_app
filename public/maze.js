import {
    createArray
} from './utils.js';

import {
    FPSINTERVALNUM,
    SQUARE_SIZE,
    globalObj
} from './constants.js';

var m = document.getElementById('mazeCanvas'),
    mazeHeight = m.clientHeight,
    mazeWidth = m.clientWidth,
    ctx = m.getContext('2d');
mazeHeight = mazeHeight / SQUARE_SIZE;
mazeWidth = mazeWidth / SQUARE_SIZE;
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
    this.wallX = x * SQUARE_SIZE;
    this.wallY = y * SQUARE_SIZE;
    this.getX = function() {
        return this.x * SQUARE_SIZE;
    };
    this.getY = function() {
        return this.x * SQUARE_SIZE;
    };
};


initGrid();
initMaze();
generateMaze();
// console.log(mazeHeight, mazeWidth)

//create maze 2d array

function initGrid() {
    for (var k = 0; k <= mazeWidth * SQUARE_SIZE; k += SQUARE_SIZE) { //iterate through columns
        ctx.beginPath();
        ctx.moveTo(k, 0);
        ctx.lineTo(k, mazeHeight * SQUARE_SIZE);
        ctx.stroke();
        ctx.closePath();
    }
    for (var j = 0; j <= mazeHeight * SQUARE_SIZE; j += SQUARE_SIZE) { //iterate through rows
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(mazeWidth * SQUARE_SIZE, j);
        ctx.stroke();
        ctx.closePath();
    }
}

function initMaze() { //fill the grid randomly
    for (var j = 0; j < mazeHeight; j += 1) { //iterate through rows
        for (var k = 0; k < mazeWidth; k += 1) { //iterate through columns
            theMaze[j][k] = new Node(k, j, false);
        }
    }
}



function generateMaze() {
    var n = (mazeHeight * mazeWidth - 1);
    n--
    // console.log("n: " + n)
    var node = theMaze[0][0]
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
            return false;
        } else {
            // console.log("next node east ", theMaze[node.y][node.x + 1])
            return theMaze[node.y][node.x + 1];
        }

    }
    if (direction == 'west') {
        // console.log("West", node.x, mazeWidth);
        if (node.x <= 0) {
            return false;
        } else {
            // console.log("next node west ", theMaze[node.y][node.x - 1])
            return theMaze[node.y][node.x - 1];
        }

    }
    if (direction == 'north') {
        // console.log("North", node.y, mazeHeight);
        if (node.y <= 0) {
            return false;
        } else {
            // console.log("next node north ", theMaze[node.y - 1][node.x])
            return theMaze[node.y - 1][node.x];
        }

    }
    if (direction == 'south') {
        // console.log("South", node.y, mazeHeight);
        if (node.y >= mazeHeight - 1) {
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