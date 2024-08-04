// index.html -> index.js
const socket = io();

// Store relevant details of the running game
let details = {
    selfId: '',
    fullCode: '',
    roomCode: '',
    colorCode: '',
    teammateId: ''
};


//1-----------------------------------------------------------------------------------------------

const gameInit = new Init({socket, details})
let roleSelection = {};
//let playSession = {};

// Event listeners for socket events
socket.on('roomCreated', (colorCode) => {
    gameInit.roomCreatedEvent(colorCode);
});

socket.on('joinFailed', message => {
    gameInit.joinFailedEvent(message);
});

//socket.on('playerJoined', ({ playerId, code: team, roomId, teamCode: teamId, totalPlayers }) => {
socket.on('playerJoined', (input) => {
    gameInit.playerJoinedEvent(input);
    loopLines(
        [
            "<br>",
            "Load Assets     ------------------------------------------------------------------***",
            "Load Gameplay   ------------------------------------------------------------------***",
            "Load Player     ------------------------------------------------------------------***",
            "Initiating Game ----------------------------"
        ], 
        "color2 margin", 
        80
    )
});

socket.on('receiveTeammateId', ({teammateId}) => {
    gameInit.receiveTeammateIdEvent(teammateId);
    this.details = gameInit.getDetails();
    //roleSelection = new Role_Selection(socket, this.details)
    // delete line above
    //this.playSession = new Play_Session({socket, details: this.details});
    //this.playSession.populateGameRoomEvent(message);
    music.overworld.fade(0.2,0,10000);
    setTimeout(function() {
        music.overworld.stop(); // Stop the music after the fade-out effect completes
    }, 10000);
});

socket.on('lsPlayers', (players) => {
    gameInit.listJoinedPlayers(players);
});

//----------------------------------------------------------

socket.on('myNavigator-to-Mate', ({key}) => {
    roleSelection.mateToNaviEvent(key);
});

document.addEventListener('keydown', function(event) {
    let key = event.key;
    selection = document.getElementById('mySelection');
    if(key==='ArrowLeft' || key==='ArrowRight'){
        roleSelection.updateNavigatorEvent(key, selection, 'send');
    }
});

socket.on('readyToLoadPage', (message) => {
    console.log(message);
});

socket.on('countdownFinished', () => {
    roleSelection.countdownFinishedEvent();
});

//2-----------------------------------------------------------------------------------------------

socket.on('populateGameRoom', (message) => {
    this.playSession = new Play_Session({socket, details: this.details});
    this.playSession.populateGameRoomEvent(message);
});

socket.on('loadGameplay', ({gameplayDetails, clientQuizStation}) => {
    this.playSession.loadGameplayEvent(gameplayDetails);
    window.quizStation = clientQuizStation;
    inGame_flag = true;
    //window.quizStation = {};
});

let count = 0;
socket.on('updateGameObjects', (gameplayDetails)=>{
    count += 1;
    if(this.playSession){
//        console.log(tempCoo);
        //playSession.updateGameObjectsEvent(gameplayDetails);
        playSession.updateGameObjectsEvent(gameplayDetails[this.details.roomCode]);
        if(count === 1){
            console.log(gameplayDetails);
        }
    }
});

socket.on('gameCountDown', count => {
    var gametimer = document.querySelector('.game-timer');
    if(gametimer) {
        gametimer.innerHTML = `${count} seconds until the game ends`
    }
})

socket.on('qzStationStateChanges', ({quizKey, new_state}) => {
    window.quizStation[quizKey].state = new_state;
});

socket.on('quizCountDown', count => {
    window.quizCountDown = count;
    const timerElement = document.querySelector('.question-timer');
    if (timerElement) {
        timerElement.innerHTML = `${count}s`;
    }else {
        console.log('no game-timer');
    }
});

socket.on('inUsedTerminal', ({quizKey, usedBy}) => {
    window.quizStation[quizKey].inUsed = usedBy;
});

socket.on('outUsedTerminal', ({quizKey}) => {
    console.log('outUsedTerminal triggered')
    window.quizStation[quizKey].inUsed = '';
});

socket.on('terminate-game', (scoreboardData) => {
    console.log('terminate game triggered');
    this.playSession.terminateGameplayEvent()
        .then( () => {
            startScoreBoard(scoreboardData, this.details);
        });
})

window.addEventListener('unload', function (e) {
    socket.emit('user_leaving', 'User is leaving the page.');
    e.preventDefault();
    e.returnValue = '';
});