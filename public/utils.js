import {
    FPSINTERVALNUM,
    SQUARE_SIZE,
    globalObj
} from './constants.js';
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

function createArray(rows) { //creates a 2 dimensional array of required height
    var arr = [];
    for (var i = 0; i < rows; i += SQUARE_SIZE) {
        arr[i] = [];
    }
    return arr;
}

export {
    createArray,
    getMousePos
};