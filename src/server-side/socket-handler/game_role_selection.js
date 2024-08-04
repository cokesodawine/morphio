
let processTimer ={};
let playersReadyCount = {};

module.exports = function (io,activeRooms){
    return{
        handleRoleSelectionEvents: function (socket){

            // Making teammate's navigator visible on role selection
            socket.on('myNavigator', ({key, details}) => {

                const roomCode = details.roomCode
                const colorCode = details.colorCode
                const teammateId = details.teammateId

                // Keep track num of players trigger 'myNavigator'
                if (!playersReadyCount[roomCode]) {
                    // If the roomCode is not in the playersReadyCount object, initialize it to 1
                    playersReadyCount[roomCode] = 1;
                } else {
                    // Increment the count for the specific roomCode
                    playersReadyCount[roomCode]++;
                }

                if (key === 'ArrowLeft'){
                    activeRooms[roomCode][colorCode].serverSidePlayers[socket.id].role = 'builder'
                } else if (key === 'ArrowRight'){
                    activeRooms[roomCode][colorCode].serverSidePlayers[socket.id].role = 'breaker'
                }

                io.to(teammateId).emit('myNavigator-to-Mate', {key})

                // timer to Next Page-------------------------------------
                firstPlayerObj = Object.values(activeRooms[roomCode][colorCode].serverSidePlayers)[0]
                secondPlayerObj = Object.values(activeRooms[roomCode][colorCode].serverSidePlayers)[1]
                if (firstPlayerObj.role != secondPlayerObj.role){
                    if(!processTimer[socket.id]){
                        activeRooms[roomCode][colorCode].activityState = 'role-load-game';
                        console.log('start counting')
                        let count = 3;
                        processTimer[socket.id] = setInterval(() => {
                            if (count === 0) {
                                clearInterval(processTimer[socket.id]);
                                console.log('Process finished by ', socket.id );
                                io.to(details.fullCode).emit('countdownFinished');

                                if(activeRooms[roomCode]['blue'].activityState==='role-load-game' && activeRooms[roomCode]['red'].activityState==='role-load-game' && playersReadyCount[roomCode] === 2){
                                    io.to(roomCode).emit('populateGameRoom', 'all players have joined');
                                    console.log('emit populateGameRoom by ', details.selfId)
                                    playersReadyCount[roomCode] = 0;
                                }

                            } else {
                                console.log(`Time remaining: ${count}`);
                                io.to(details.fullCode).emit('readyToLoadPage', `Time remaining: ${count}`)
                                count--;
                            }
                        }, 1000);
                    }
                } else {

                    if(activeRooms[roomCode][colorCode].activityState === 'role-load-game'){
                        activeRooms[roomCode][colorCode].activityState = 'role'
                    }
                    console.log('stop');
                    clearInterval(processTimer[socket.id]);
                }
                
            })

        }
    }
}