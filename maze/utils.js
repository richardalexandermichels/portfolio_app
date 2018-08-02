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

exports.createArray = function(rows) { //creates a 2 dimensional array of required height
    var arr = [];
    for (var i = 0; i < rows; i += 1) {
        arr[i] = [];
    }
    return arr;
}