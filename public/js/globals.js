var mazeToMake;
var ctx;
var ANIMATE;

var createArray = function(rows) { //creates a 2 dimensional array of required height
    var arr = [];
    for (var i = 0; i < rows; i += 1) {
        arr[i] = [];
    }
    return arr;
};

var getMousePos = function(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

var FPSINTERVALNUM = 1000;