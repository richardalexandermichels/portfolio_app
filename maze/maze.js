var createArray = require('./utils.js').createArray;

var SQUARE_SIZE = require('./constants.js').SQUARE_SIZE;



var theMaze = null;
var mazeHeight = 0;
var mazeWidth = 0;
// console.log("the amze: ", theMaze);
var directionsArr = ['east', 'west', 'north', 'south'];


var Node = function(x, y, visited, brokenWalls, id) {
    this.x = x;
    this.y = y;
    this.visited = visited;
    this.wallX = x * SQUARE_SIZE;
    this.wallY = y * SQUARE_SIZE;
    this.brokenWalls = brokenWalls;
    this.id = id;
};


// initGrid();

// generateMaze();
// console.log(mazeHeight, mazeWidth)

//create maze 2d array



function initMaze() { //fill the grid randomly
    var id = 0;
    for (var j = 0; j < mazeHeight; j += 1) { //iterate through rows
        for (var k = 0; k < mazeWidth; k += 1) { //iterate through columns
            theMaze[j][k] = new Node(k, j, false, null, id++);
        }
    }
}



exports.generateMaze = function(mH, mW) {
    mazeHeight = mH;
    mazeWidth = mW;
    theMaze = createArray(mazeHeight);
    initMaze();
    var n = (mazeHeight * mazeWidth - 1);
    n--

    //temp moves for test
    // n = 9;
    // console.log("n: " + n)
    var node = theMaze[0][0]
    node.visited = true;
    var unvisitedNeighbors = nextUnvisited(node);
    var randomUnvisited = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];

    //temp for moves for test 
    // randomUnvisited = 'south'
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

    return theMaze;
}


function move(node, direction) {
    // console.log("Move " + direction, node.id);
    var nextNode = getNextNode(direction, node);
    if (!nextNode) {
        console.log("CANT MOVE THAT WAY")
        return false;
    }
    nextNode.visited = true;
    if (!!node.brokenWalls) {
        node.brokenWalls.push(direction);
    } else {
        node.brokenWalls = [direction];
    }
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
// var generatedMaze = generateMaze();

// console.log(theMaze[0][0]);

// var nodeXdiff = theMaze[2 * SQUARE_SIZE][4 * SQUARE_SIZE].x - theMaze[2 * SQUARE_SIZE][5 * SQUARE_SIZE].x;
// var nodeYdiff = theMaze[2 * SQUARE_SIZE][4 * SQUARE_SIZE].y - theMaze[1 * SQUARE_SIZE][3 * SQUARE_SIZE].y;
// console.log('TEST', nodeXdiff, nodeYdiff);
// ctx.clearRect(2 * SQUARE_SIZE + 1, 2 * SQUARE_SIZE + 1, SQUARE_SIZE - 2, nodeYdiff - 1 + SQUARE_SIZE - 2);

// ctx.clearRect(81, 41, nodeXdiff - 1 + SQUARE_SIZE - 2, SQUARE_SIZE - 2);