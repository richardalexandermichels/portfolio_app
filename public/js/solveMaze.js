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


    Object.getPrototypeOf(mazeToMake[0][0]).fill = function(ctx, color) {
        var drawSizeH = GRID_SIZE * SQUARE_MULTIPLYER;
        var drawSizeW = GRID_SIZE * SQUARE_MULTIPLYER;
        if (document.getElementById('_randomSize').checked) {
            drawSizeH = Math.floor(Math.random() * (GRID_SIZE * SQUARE_MULTIPLYER));
            drawSizeW = Math.floor(Math.random() * (GRID_SIZE * SQUARE_MULTIPLYER))
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
    }

    Object.getPrototypeOf(currentNode).fillPath = function(ctx, color, fromDir) {
        var drawSizeH = GRID_SIZE * SQUARE_MULTIPLYER;
        var drawSizeW = GRID_SIZE * SQUARE_MULTIPLYER;
        if (document.getElementById('_randomSize').checked) {
            drawSizeH = Math.floor(Math.random() * (GRID_SIZE * SQUARE_MULTIPLYER));
            drawSizeW = Math.floor(Math.random() * (GRID_SIZE * SQUARE_MULTIPLYER))
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

    }
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