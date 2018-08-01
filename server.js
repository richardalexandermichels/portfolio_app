var express = require('express'),
    http = require('http');
//make sure you keep this order
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.use(express.static('public'));


app.get('/about', (req, res) => res.send('Hi I\'m Richard </br> <a href="/">back</a>'));

// app.get('/', (req, res) => res.send('Hello World! </br> <a href="/about">about me</a>'));

app.get('/chat', (req, res) => res.sendFile(__dirname + '/public/chat.html'));

app.get('/meteorites', (req, res) => res.sendFile(__dirname + '/public/meteorites.html'));


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message', (msg) => {
        console.log('message ' + msg);
        io.emit('chat message', msg);
    });
    socket.on('disconnect', () => console.log('user disconnected'))
});


server.listen(8080, () => console.log('Portfolio app listening on port 8080!'))