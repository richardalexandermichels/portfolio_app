var express = require('express');
var router = express.Router();

//Require controllers
var mazeController = require('./mazeController');

// routes

//POST submit  term to backend

router.post('/', mazeController.generateMaze);

module.exports = router;