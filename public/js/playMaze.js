var mazeControls = {
    38: {
        direction: 'north',
        newX: function(oldX) {
            return oldX;
        },
        newY: function(oldY) {
            return oldY - 1;
        }
    },
    37: {
        direction: 'west',
        newX: function(oldX) {
            return oldX - 1;
        },
        newY: function(oldY) {
            return oldY;
        }
    },
    39: {
        direction: 'east',
        newX: function(oldX) {
            return oldX + 1;
        },
        newY: function(oldY) {
            return oldY;
        }
    },
    40: {
        direction: 'south',
        newX: function(oldX) {
            return oldX;
        },
        newY: function(oldY) {
            return oldY + 1;
        }
    }
};

var dirOpposite = {
    'east': 'west',
    'west': 'east',
    'north': 'south',
    'south': 'north'
}

var mazePlayer = {
    startPlaying: function() {
        var cur;
        var ctx = document.getElementById('mazeCanvas').getContext('2d')
        mazeToMake[0][0].fill(ctx, 'red');
        cur = {
            x: 0,
            y: 0
        };
        window.addEventListener('keydown', function(e) {
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
}

document.getElementById('_playMaze').onclick = mazePlayer.startPlaying;