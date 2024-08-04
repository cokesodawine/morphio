const path = require('path')
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use('/public', express.static(path.join(__dirname, '/public')))

app.get('/', (req, res) => {
    console.log(path.join(__dirname, '/public'));
    res.sendFile(__dirname + '/test-index.html');
});

//app.get('/second-page', (req, res) => {
//    res.sendFile(__dirname + '/test-game.html');
//});

io.on('connection', (socket) => {
    console.log('a user connected');

    // Handle incoming messages from clients
    socket.on('message', (data) => {
        console.log('Received message:', data);
        // Broadcast the received message to all clients
        io.emit('message', data);
    });

    socket.on('something', ()=>{console.log('something')})
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
