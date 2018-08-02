var SQUARE_SIZE = 20;
var mazeToMake;
document.getElementById('_drawMaze').onclick = function() {
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
        mazeWidth = m.clientWidth,
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
        })
        .then(function(response) {
            // console.log(response)
            return response.json();
        }).then(function(mTm) {
            mazeToMake = mTm;
            initGrid(ctx, mTm, mazeHeight, mazeWidth);
        });
};


function initGrid(ctx, mazeToMake, mazeHeight, mazeWidth) {

    Object.getPrototypeOf(mazeToMake[0][0]).fill = function(ctx, color) {
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
    }

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
    for (var i = 0; i < mazeHeight; i++) {
        for (var n = 0; n < mazeWidth; n++) {
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