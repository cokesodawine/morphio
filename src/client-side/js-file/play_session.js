class Play_Session {
    constructor(config){
        this.socket = config.socket;
        this.details = config.details;
    }

    populateGameRoomEvent (message){
        console.log(message);
        this.socket.emit('prepareGameplayDetails', {details: this.details});
    }

    loadGameplayEvent (gameplayDetails){
        window.gameplayDetails = gameplayDetails;
        console.log(window.gameplayDetails);
        //this.gameplayDetails[this.details.colorCode].serverSidePlayers[this.details.selfId].isPlayerControlled = true;


        setTimeout(() => {
            document.getElementById('firstPage').style.display = 'none';
            document.getElementById('fourthPage').style.display = 'flex';
            this.gameworld = new Gameworld({
                socket: this.socket,
                element: document.querySelector(".game-container"),
                details: this.details
            });
            this.gameworld.init();

            // Remove some of the terminal content
            const paragraphsToRemove = terminal.getElementsByTagName('p');
            while (paragraphsToRemove.length !== 0){
                terminal.removeChild(paragraphsToRemove[0]);
            }
            //document.getElementById("command").remove();
        }, 3000);
    }

    terminateGameplayEvent () {
        return new Promise((resolve, reject) => {
            try {
                this.gameworld = null;
                document.getElementById('fourthPage').style.display = 'none';
                document.getElementById('firstPage').style.display = 'flex';

                const body = document.body;
                body.style.padding = '0';
                while (body.firstChild) {
                    body.removeChild(body.firstChild);
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    updateGameObjectsEvent (gameplayDetails){
        window.gameplayDetails = gameplayDetails;
    }
}