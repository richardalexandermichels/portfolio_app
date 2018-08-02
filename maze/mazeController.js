var maze = require('./maze.js');

// exports.generateMaze = maze.generateMaze;

exports.generateMaze = function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(maze.generateMaze(req.body.mazeHeight, req.body.mazeWidth));
};