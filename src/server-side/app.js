const path = require('path')

const express = require('express');
const app = express();
const port = 3000

// socket.io implementation
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');

const io = new Server(server, {pingInterval: 2000, pingTimeout: 5000})

//1-----------------------------------------------------------------------------------------------

let activeRooms = {};


const gameInitHandlers = require('./socket-handler/game_init.js');
const roleSelectionHandlers = require('./socket-handler/game_role_selection.js')
const playSessionHandlers =  require('./socket-handler/game_play_session.js')
const disconnectionHandlers = require('./socket-handler/disconnection.js')

io.on('connection', socket => {

    // Initialize all handlers
    const gameInit = gameInitHandlers(io, activeRooms);
    const roleSelection = roleSelectionHandlers(io, activeRooms);
    const playSession = playSessionHandlers(io, activeRooms);
    const disconnection = disconnectionHandlers(io, activeRooms);


    // Handles Game-Room initiation and match-making process
    gameInit.handleGameRoomEvents(socket)
    // Handles role selection part
    roleSelection.handleRoleSelectionEvents(socket)
    // Handles play session
    playSession.handlePlaySessionEvents(socket)
    // Handle any disconnection occurence
    disconnection.handleDisconnectionEvents(socket)

});



//2-----------------------------------------------------------------------------------------------



// Make every file within 'client-side' dir publicly accessible
app.use('/html-file', express.static(path.join(__dirname, '../client-side/html-file')));
app.use('/js-file', express.static(path.join(__dirname, '../client-side/js-file')));
//app.use('/resources', express.static(path.join(__dirname, '../resources')))
//app.use('/resources', express.static('resources'));

// Homepage route
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'client-side', 'html-file', 'gameply.html');
    //const indexPath = path.join(__dirname, '..', 'test-env','test-index.html');
    
    res.sendFile(indexPath)
})

// Game Room route
/*app.get('/game/:roomId', (req, res) => {
    // Render the game page with the provided room ID
    res.sendFile(path.join(__dirname, '../client-side/html-file/game.html'));
});*/

server.listen(port, () => {
    //console.log(`listening on port ${port}`)
    console.log(`
    ░▀█▀░█░█░█▀█░▀█▀░░░▀▀█░█▀█░█░█░█▀█░░░█▀▀░█▀█░█▄█░█▀▀
    ░░█░░█▀█░█▀█░░█░░░░░░█░█▀█░▀▄▀░█▀█░░░█░█░█▀█░█░█░█▀▀
    ░░▀░░▀░▀░▀░▀░░▀░░░░▀▀░░▀░▀░░▀░░▀░▀░░░▀▀▀░▀░▀░▀░▀░▀▀▀
                                         -cokesodawine %
    `);

   
   
})
