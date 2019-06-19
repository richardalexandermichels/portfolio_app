var express = require('express'),
    http = require('http');
const axios = require('axios')
//make sure you keep this order
var app = express();
var server = http.createServer(app);
var bodyParser = require('body-parser');

var io = require('socket.io').listen(server);

var mazeRouter = require('./maze/mazeRoute');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


app.get('/bio', (req, res) => res.sendFile(__dirname + '/public/bio.html'));

// app.get('/', (req, res) => res.send('Hello World! </br> <a href="/about">about me</a>'));

app.get('/chat', (req, res) => res.sendFile(__dirname + '/public/chat.html'));

app.get('/meteorites', (req, res) => res.sendFile(__dirname + '/public/meteorites.html'));

app.get('/d3-test', (req, res) => res.sendFile(__dirname + '/public/d3-test.html'));

app.get('/code', (req, res) => res.sendFile(__dirname + '/public/code.html'));

app.get('/argo', (req, res) => {
    axios({
        method: 'POST',
        url: 'https://j950rrlta9.execute-api.us-east-2.amazonaws.com/v1/ArgoChallenge',
        headers: {
            "content-type":"application/json",
            "x-api-key": "L0Q3GvXCwB9jVSmvaJbw5augw4xHCvMy4Egqim2p"
        }
    })
    .catch(e => {
        console.log("ERROR REEROOE EREOOEROE EREOOE ERROR: ",e)
    })
});

app.use('/maze', mazeRouter);

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message', (msg) => {
        console.log('message ' + msg);
        io.emit('chat message', msg);
    });
    socket.on('disconnect', () => console.log('user disconnected'))
});


server.listen(8080, () => console.log('Portfolio app listening on port 8080!'))