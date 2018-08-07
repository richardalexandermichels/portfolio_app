var GRID_SIZE;


document.getElementById('_drawMaze').onclick = drawMaze;
document.getElementById('_drawMaze').click();

function drawMaze() {
    var canvasContainer = document.getElementById('mazeCanvasContainer');
    canvasContainer.style.margin = '10px'
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
        })
        .then(function(response) {
            // console.log(response)
            return response.json();
        }).then(function(mTm) {
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
        for (var k = 0; k <= mazeWidth * GRID_SIZE; k += GRID_SIZE) { //iterate through columns
            ctx.beginPath();
            ctx.moveTo(k, 0);
            ctx.lineTo(k, mazeHeight * GRID_SIZE);
            ctx.stroke();
            ctx.closePath();
        }
        for (var j = 0; j <= mazeHeight * GRID_SIZE; j += GRID_SIZE) { //iterate through rows
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