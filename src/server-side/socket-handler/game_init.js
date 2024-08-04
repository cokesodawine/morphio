
let playerCount = {};
module.exports = function(io, activeRooms) {
    return {
        handleGameRoomEvents: function(socket) {

            // Player creates a room
            socket.on('createRoom', () => {
                let nummm = 1;
                console.log(nummm);
                const roomId = generateRoomId();
                const blueCode = roomId + '_blue'
                const redCode = roomId + '_red'

                // In case we need unique id for each team
                const blueTeamID = generateCode();
                const redTeamID = generateCode();

                activeRooms[roomId] = {
                    'blue': { code: blueTeamID, activityState: 'init', serverSidePlayers: {} },
                    'red': { code: redTeamID, activityState: 'init', serverSidePlayers: {} }
                };

                console.log('blueTeamId generated : ', blueCode);
                console.log('redTeamId generated  : ', redCode);

                socket.emit('roomCreated', { blueCode, redCode });
            });

            // Player joins a room
            socket.on('joinRoom', ({ code, playername }) => {
                if(code.length < 13 || code.length > 14){
                    socket.emit('joinFailed', 'invalid code')
                    return;
                }

                teamCode = code.substring(10)
                roomId = code.substring(0,9)

                const room = activeRooms[roomId];
                if (!room) {
                    socket.emit('joinFailed', 'Room not found');
                    return;
                }

                const selectedTeam = room[teamCode];
                //console.log(Object.keys(selectedTeam.serverSidePlayers).length === 0);
                if (!selectedTeam) {
                    socket.emit('joinFailed', 'Invalid team or code');
                    return;
                }

                totalPlayers = Object.keys(selectedTeam.serverSidePlayers).length
                if (totalPlayers >= 2){
                    socket.emit('joinFailed', 'Team Full')
                    return;
                }

                
                //console.log(Object.keys(selectedTeam.serverSidePlayers).length === 0);
                if (Object.keys(selectedTeam.serverSidePlayers).length === 0){
                    //selectedTeam.serverSidePlayers.push(socket.id);
                    selectedTeam.serverSidePlayers[socket.id] = {
                        name: playername,
                        team: teamCode,
                        role: 'builder' // initial state
                    }
                } else {
                   //selectedTeam.serverSidePlayers.push(socket.id);
                    selectedTeam.serverSidePlayers[socket.id] = {
                        name: playername,
                        team: teamCode,
                        role: 'breaker' // initial state
                    }    
                }
                
                // This is to be broadcasted within team
                totalPlayers = Object.keys(selectedTeam.serverSidePlayers).length

                // Join public room
                socket.join(roomId);
                // Join private team room
                socket.join(code);

                // Broadcast among team members
                io.to(code).emit('playerJoined', { relv_details: {selfId: socket.id, fullCode: code, roomCode: roomId, colorCode: teamCode}, totalPlayers });
                console.log(`player ${playername} joined the session`);

                // Change activity state of every team
                selectedTeam.activityState = 'init-load-role' 


                //console.log(activeRooms[roomId][teamCode].serverSidePlayers)
                //console.log(activeRooms)
                //console.log(activeRooms[roomId][teamCode])
                //console.log(`amount of object within a room: ${Object.keys(selectedTeam.serverSidePlayers).length}`)
            });

            // Find teammateId
            socket.on('getTeammateId', (details) => {
                const roomCode = details.roomCode
                const colorCode = details.colorCode
                let teammateId;

                activeRooms[roomCode][colorCode].activityState = 'role';

                // Find teammateId
                for (const id in activeRooms[roomCode][colorCode].serverSidePlayers){
                    if(id != socket.id){
                        teammateId = id
                    }
                }
                io.to(teammateId).emit('receiveTeammateId', {teammateId: socket.id})


                if (!playerCount[roomCode]){
                    playerCount[roomCode] = 1;
                } else {
                    playerCount[roomCode] += 1;
                }
                if(playerCount[roomCode] === 4) {
                    io.to(roomCode).emit('populateGameRoom', 'all players have joined');
                }
            })
        }
    };
};


// Generate a unique room ID
function generateRoomId() {
    return Math.random().toString(36).substr(2, 9);
}

// Generate a unique code
function generateCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}