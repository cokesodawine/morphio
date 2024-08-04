module.exports = function(io, activeRooms) {
    return {
        handleDisconnectionEvents: function(socket) {

            socket.on('disconnect', () => {

                // Implement logic to remove disconnected serverSidePlayers from activeRooms
                for (const id in activeRooms){
                    teams = activeRooms[id]
                    for (const id in teams){
                        serverSidePlayers = teams[id].serverSidePlayers
                        for(const id in serverSidePlayers){
                            if(id === socket.id){
                                console.log('Player Disconnected : ', serverSidePlayers[id])
                                delete serverSidePlayers[id];
                                return
                            }
                        }
                    }
                }
            });

        }
    }
}