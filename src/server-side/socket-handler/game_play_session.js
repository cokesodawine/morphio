const quizData = require('../quizdata.json');

// server-side quiz stations : bcs the gplay wont be smooth if it emmited continously
let serverQuizStation = {};

module.exports = function (io, activeRooms){
    // Database Connection
    const mongoose = require('mongoose');
    const uri = 'mongodb+srv://shareduser:shareduser@shareddatabase.dc3imbq.mongodb.net/?retryWrites=true&w=majority&appName=shareddatabase';
    const Quiz = require('../Quiz.js');
    
    // 'key-down-event' usage
    let movingProgressRemaining = {};
    let interval_ = {};
    let eventQueue = {};

    // Sprite animation usage
    let currentAnimationKey = {};
    let currentAnimationFrame = {};
    const animationFrameLimit = 5;
    let animationFrameProgress = {};
    const animations = {
        "idle-down" : [ [0,0] ],
        "idle-right": [ [0,3] ],
        "idle-up"   : [ [0,1] ],
        "idle-left" : [ [0,2] ],
        "walk-down" : [ [1,0],[0,0],[3,0],[0,0], ],
        "walk-right": [ [1,3],[0,3],[3,3],[0,3], ],
        "walk-up"   : [ [1,1],[0,1],[3,1],[0,1], ],
        "walk-left" : [ [1,2],[0,2],[3,2],[0,2], ]
    }

    // Wall features

    let wallAhead = {};
    const walls = {
        ['0,2'] : true, ['0,3'] : true, ['0,4'] : true, ['0,5'] : true, ['0,6'] : true, ['0,7'] : true, ['0,8'] : true, ['0,9'] : true, ['0,10'] : true, ['0,11'] : true, ['0,12'] : true, ['0,13'] : true, ['0,14'] : true, ['0,15'] : true,
        ['14,2'] : true, ['14,3'] : true, ['14,4'] : true, ['14,5'] : true, ['14,6'] : true, ['14,7'] : true, ['14,8'] : true, ['14,9'] : true, ['14,10'] : true, ['14,11'] : true, ['14,12'] : true, ['14,13'] : true, ['14,14'] : true, ['14,15'] : true,
        ['1,1'] : true, ['2,1'] : true, ['3,1'] : true, ['4,1'] : true, ['5,1'] : true, ['6,1'] : true, ['7,1'] : true, ['8,1'] : true, ['9,1'] : true, ['10,1'] : true, ['11,1'] : true, ['12,1'] : true, ['13,1'] : true,
        ['1,16'] : true, ['2,16'] : true, ['3,16'] : true, ['4,16'] : true, ['5,16'] : true, ['6,16'] : true, ['7,16'] : true, ['8,16'] : true, ['9,16'] : true, ['10,16'] : true, ['11,16'] : true, ['12,16'] : true, ['13,16'] : true
   }


    // To initiate quiz event usage
    const timeLimit = 10;
    let count = {};
    let tickDownTimer = {};

    // Quiz event submission usage
    const pointDic = {
        "easy"  : 2,
        "medium": 5, 
        "hard"  : 8
    };

    // Gameplay Timer
    let bombInterval_ = {};
    let bomb ={};
    const bombDic = {
        "5s" : 10,
        "10s": 15,
        "2m" : 125,
        "10m": 605,
        "15m": 905,
        "20m": 1205 
    };

    return{
        handlePlaySessionEvents : function (socket) {

            socket.on('prepareGameplayDetails', async ({details}) => {
                
                bluePlayer1 = Object.values(activeRooms[details.roomCode]['blue'].serverSidePlayers)[0]
                bluePlayer2 = Object.values(activeRooms[details.roomCode]['blue'].serverSidePlayers)[1]
                redPlayer1 = Object.values(activeRooms[details.roomCode]['red'].serverSidePlayers)[0]
                redPlayer2 = Object.values(activeRooms[details.roomCode]['red'].serverSidePlayers)[1]
                
                this.proceedFlag = (bluePlayer1.hasOwnProperty('avatarSrc') && bluePlayer2.hasOwnProperty('avatarSrc') && redPlayer1.hasOwnProperty('avatarSrc') && redPlayer2.hasOwnProperty('avatarSrc'));
                console.log(this.proceedFlag);

                if(!this.proceedFlag){
                    modGameplayDetails(activeRooms, details);
                    this.proceedFlag = (bluePlayer1.hasOwnProperty('avatarSrc') && bluePlayer2.hasOwnProperty('avatarSrc') && redPlayer1.hasOwnProperty('avatarSrc') && redPlayer2.hasOwnProperty('avatarSrc'));
                }

                if(this.proceedFlag){
                    try {
                        await new Promise((resolve, reject) => {
                            // Last player will form a gameObjects...
                            const bluePlayers = activeRooms[details.roomCode]['blue'].serverSidePlayers
                            const redPlayers = activeRooms[details.roomCode]['red'].serverSidePlayers
                            activeRooms[details.roomCode].gameObjects = { ...bluePlayers, ...redPlayers};
                            delete activeRooms[details.roomCode]['blue'];
                            delete activeRooms[details.roomCode]['red'];
            
                            // ...As well as quiz station formation
                            try {
                                mongoose.connect(uri).then((result) => console.log('connected to db from gmplay sesh')).catch((err) => console.log(err));
                                Quiz.find()
                                .then(result => {
                                    let transformedData = transformQuizData(result);
                                    serverQuizStation[details.roomCode] = transformedData;
                                    resolve();
                                })
                                .catch(err => {
                                console.log(err);
                                });
                            } catch (error) {
                                console.error(error)
                                throw error;
                            }
                        })
                    } catch (error) {
                        console.log(error);
                    }
                            
                    // ...As well as data for progress bar
                    activeRooms[details.roomCode].progressBar = { red: 0, blue: 0}
                    
                    // ...As well as bomb timer
                    bomb[details.roomCode] = bombDic["20m"];
                    bombInterval_[details.roomCode] = setInterval(()=>{  
                        //console.log(".");
                        if (bombInterval_[details.roomCode]){
                            bomb[details.roomCode] --;
                            
                            if(bomb[details.roomCode] === 0){ 
                                const scoreboardData = {
                                    'blue-team' : activeRooms[details.roomCode].progressBar['blue'],
                                    'red-team'  : activeRooms[details.roomCode].progressBar['red'],
                                    'players-score' : activeRooms[details.roomCode].gameObjects
                                }

                                io.to(details.roomCode).emit('terminate-game', scoreboardData);
                                clearInterval(bombInterval_[details.roomCode]); 
                                delete bomb[details.roomCode];
                                delete bombInterval_[details.roomCode];
                            }

                            io.to(details.roomCode).emit('gameCountDown', bomb[details.roomCode]);
                        }
                    }, 1000);
                    io.to(details.roomCode).emit('loadGameplay', {gameplayDetails: activeRooms[details.roomCode], clientQuizStation: serverQuizStation[details.roomCode]})
                    //console.log('gps, line 32: ', activeRooms[details.roomCode]);
                    console.log('loadGameplay emit by : ', socket.id);
                }

            })

            socket.on('key-down-event', ({details, key})=>{
                //console.log('gps, line 42: keydown event by ', details.selfId);
                //console.log(`x-value by ${details.selfId}: ${key}`);

                const id = details.selfId;

                // If MPR of particular user is not exist yet
                if(!movingProgressRemaining[id]){
                    movingProgressRemaining[id] = 0;
                }

                // If eventQueue not exist yet
                if (!eventQueue[id]) {
                    eventQueue[id] = [];
                }
                
                // Limit to only 1 event
                if(eventQueue[id].length < 1 /*&& !tempWall*/){
                    eventQueue[id].push({details, key});
                    wallAhead[id] = isSpaceTaken(activeRooms[details.roomCode].gameObjects[details.selfId].position.x, activeRooms[details.roomCode].gameObjects[details.selfId].position.y, key, details);
                    //console.log(`wallAhead-${id}: ${wallAhead[id]}`);
                }

                // If interval is not set, start processing the queue
                if (!interval_[id] && !wallAhead[id]) {
                   // console.log('keydown : ', key);
                    movingProgressRemaining[id] = 10;
                    updateSprite(key, details);
                    processEventQueue(id);

                }

                // If there is actually a wall delete the event
                if (wallAhead[id] && eventQueue[id].length === 1){
                    updateSprite(key, details); // Todo: Implementation yg ni selowwww, nty ubah okayyyy :)
                    //.log('wall dbg: delete event after the wall');
                    eventQueue[id].shift();
                }
            })
            
            socket.on('init-quiz-event', ({ details, key, quizCoor }) => {

                if(!count[socket.id]){
                    console.log('set count')
                    count[socket.id] = timeLimit
                } else {
                    console.log('count already exist');
                }

                socket.emit('quizCountDown', count[socket.id]);
                serverQuizStation[details.roomCode][`${quizCoor.x},${quizCoor.y}`].inUsed = socket.id;


                tickDownTimer[socket.id] = setInterval(() => {
                    count[socket.id]--;
                    socket.emit('quizCountDown', count[socket.id]);
                    console.log(`quizCountDown by ${socket.id}: ${count[socket.id]}`);
                    if (count[socket.id] <= 0){
                        clearInterval(tickDownTimer[socket.id]);
                        delete count[socket.id];
                        io.to(details.roomCode).emit('outUsedTerminal', {quizKey: `${quizCoor.x},${quizCoor.y}`});
                        serverQuizStation[details.roomCode][`${quizCoor.x},${quizCoor.y}`].inUsed = '';
                    }   
                }, 1000)

                // Broadcast on the in-used terminal
                io.to(details.roomCode).emit('inUsedTerminal', {quizKey: `${quizCoor.x},${quizCoor.y}`, usedBy: socket.id});
            })

            socket.on('trmnt-quiz-event', ({details, quizKey}) => {
                // Override count value
                //count[socket.id] = 0;
                if(count[socket.id]){
                    console.log('delete count');
                    delete count[socket.id];
                }
                if(tickDownTimer[socket.id]){
                    console.log('delete tickdowntimer');
                    clearInterval(tickDownTimer[socket.id])
                }
                console.log('outused terminal')
                io.to(details.roomCode).emit('outUsedTerminal', {quizKey: quizKey});
                serverQuizStation[details.roomCode][quizKey].inUsed = '';
            })

            socket.on('submit-quiz-event', ({difficulty, details, quizKey}) => {
                
                let role = activeRooms[details.roomCode].gameObjects[socket.id].role;
                let team = details.colorCode;
                // Progress Bar system
                if(role === 'breaker'){
                    activeRooms[details.roomCode].progressBar[team] += pointDic[difficulty];
                    serverQuizStation[details.roomCode][quizKey].state = details.colorCode;
                }
                else if (role === 'builder'){
                    let oppo = (team === 'blue') ? 'red' : 'blue';
                    activeRooms[details.roomCode].progressBar[oppo] -= pointDic[difficulty];
                    serverQuizStation[details.roomCode][quizKey].state = 'neutral';
                }

                // Individual point system
                activeRooms[details.roomCode].gameObjects[socket.id].pointSys.pointGained += pointDic[difficulty]
                activeRooms[details.roomCode].gameObjects[socket.id].pointSys[difficulty] += 1;

                // Broadcast the changes of quiz station state
                io.to(details.roomCode).emit('qzStationStateChanges', {quizKey, new_state: serverQuizStation[details.roomCode][quizKey].state});
                //io.to(details.roomCode).emit('loadGameplay', {gameplayDetails: activeRooms[details.roomCode], clientQuizStation: serverQuizStation[details.roomCode]})
            });

            
            setInterval(()=>{            
                updateAnimationProgress();
//                if(Object.values(currentAnimationKey)[0] !== undefined){
//                    let tempKey = Object.values(currentAnimationKey)[0]
//                    let tempFrm = Object.values(currentAnimationFrame)[0]
//                    let tempCoo = animations[tempKey][tempFrm];
//                    console.log('dbg, currAnimKey : ', tempKey);
//                    console.log('dbg, currAnimFrm : ', tempFrm);
//                    console.log('dbg, animFrmProg : ', Object.values(animationFrameProgress)[0]);
//                }
                //io.emit('updateGameObjects', {gameplayDetails: Object.values(activeRooms)[0]})

                io.emit('updateGameObjects', activeRooms)
            }, 15) // lag scenario : 1500, normal scenario : 15
        }
    }
    
    function modGameplayDetails(activeRooms, details){


        // Assigning avatar aset and position for each role and sprite Index ;)
        let self = activeRooms[details.roomCode][details.colorCode].serverSidePlayers[details.selfId]

        let blue_builder = "/html-file/new_resources/blue_builder.png"
        let blue_breaker = "/html-file/new_resources/blue_breaker.png"
        let red_builder = "/html-file/new_resources/red_builder.png"
        let red_breaker = "/html-file/new_resources/red_breaker.png"
        switch(self.role){
            case 'builder':
                this.avatarSrc = (details.colorCode === 'blue') ? blue_builder : red_builder;
                //this.position = (details.colorCode === 'blue') ? {x:11, y:11} : {x:6, y:10};
                this.position = (details.colorCode === 'blue') ? {x:1, y:3} : {x:13, y:3};
                break;
            case 'breaker':
                this.avatarSrc = (details.colorCode === 'blue') ? blue_breaker : red_breaker;
                //this.position = (details.colorCode === 'blue') ? {x:13, y:8} : {x:7, y:13};
                this.position = (details.colorCode === 'blue') ? {x:1, y:13} : {x:13, y:13};
                break;
            default :
                console.log('player role has not yet been defined');
                break;
        }
        activeRooms[details.roomCode][details.colorCode].serverSidePlayers[details.selfId].avatarSrc = this.avatarSrc;
        activeRooms[details.roomCode][details.colorCode].serverSidePlayers[details.selfId].position = this.position;
        activeRooms[details.roomCode][details.colorCode].serverSidePlayers[details.selfId].sprite = {x: 0, y: 0};
        activeRooms[details.roomCode][details.colorCode].serverSidePlayers[details.selfId].pointSys = {
            pointGained: 0, hard: 0, medium:0, easy: 0
        }


        // Define a lot more...
        //console.log('gps, line 49: ', activeRooms[details.roomCode][details.colorCode].serverSidePlayers[details.selfId]);
    }

    function transformQuizData(data) {
        let transformedData = {};
        coordinates = [
            {x: 3, y: 4}, {x: 5, y: 4}, {x: 7, y: 4}, {x: 9, y: 4}, {x: 11, y: 4},
            {x: 3, y: 7}, {x: 5, y: 7}, {x: 7, y: 7}, {x: 9, y: 7}, {x: 11, y: 7},
            {x: 3, y: 10}, {x: 5, y: 10}, {x: 7, y: 10}, {x: 9, y: 10}, {x: 11, y: 10},
            {x: 3, y: 13}, {x: 5, y: 13}, {x: 7, y: 13}, {x: 9, y: 13}, {x: 11, y: 13}
        ];
        data.forEach((item, index) => {
            if(coordinates.length === 0) { return; }
            const {x, y} = coordinates.shift();
            
            if(item.level === 'hard'){
                transformedData[`${x},${y}`] = {
                    position: {x: x, y: y},
                    inUsed : '',
                    state: 'neutral',
                    level: item.level,
                    question: item.question,
                    ansChoice: item.ansChoice,
                    code1: item['code1'], //undefined
                    code2: item['code2'] // undefined
                }
            } else {
                transformedData[`${x},${y}`] = {
                    position: {x: x, y: y},
                    inUsed : '',
                    state: 'neutral',
                    level: item.level,
                    question: item.question,
                    ansChoice: item.ansChoice
                }
            }
          });
          return transformedData;
    }

    function processEventQueue(id) {
        if (eventQueue[id].length > 0) {
            const event = eventQueue[id][0]; // Get the next event without removing it
            const { details, key } = event;
    
            updatePosition(details, key);
            movingProgressRemaining[id] -= 1;
            
            if (movingProgressRemaining[id] > 0) {
                interval_[id] = setTimeout(() => {
                    processEventQueue(id); // Continue processing if MPR is still above 0
                }, 15);
            } else {
                // Remove the processed event from the queue
                eventQueue[id].shift(); 
    
                // If there are more events in the queue and MPR is 0, process the next event
                if (eventQueue[id].length > 0 && movingProgressRemaining[id] === 0) {
                    movingProgressRemaining[id] = 10;
                    processEventQueue(id);
                } else {
                    updateSprite(key, details);
                    clearInterval(interval_[id]);
                    delete interval_[id];
                }
            }
        }
    }
    
    function updatePosition(details, key) {
                
        const directionUpdate = {
            "up": ["y", -0.100000000000000],
            "down": ["y", 0.100000000000000],
            "left": ["x", -0.100000000000000],
            "right": ["x", 0.100000000000000]
        }

        // Change coordinates 
        const [property, change] = directionUpdate[key];
        //activeRooms[details.roomCode][details.colorCode].serverSidePlayers[details.selfId].position[property] += change;
        activeRooms[details.roomCode].gameObjects[details.selfId].position[property] += change;

        //console.log(`gps, line 200: ${property} by ${details.selfId}: `, activeRooms[details.roomCode][details.colorCode].serverSidePlayers[details.selfId].position[property]);
    }

    function updateSprite(key, details){
        let id = details.selfId;
    
        if(movingProgressRemaining[id] === 0) {
            currentAnimationKey[id] = "idle-"+key;
            animationFrameProgress[id] = animationFrameLimit;
            currentAnimationFrame[id] = 0
            

            //console.log('dbg, currAnimKey : ', Object.values(currentAnimationKey)[0]);
            //console.log('dbg, currAnimFrm : ', Object.values(currentAnimationFrame)[0]);
            //console.log('dbg, animFrmProg : ', Object.values(animationFrameProgress)[0]);
//            console.log('dbg, currAnimKey : ', currentAnimationKey[id]);
//            console.log('dbg, currAnimFrm : ', currentAnimationFrame[id]);
//            console.log('dbg, animFrmProg : ', animationFrameProgress[id]);    
//            console.log('dbg, animations : ', animations);
//            console.log('dbg, animations : ', animations[currentAnimationKey[id]][currentAnimationFrame[id]])
    
            let [frameX, frameY] = animations[currentAnimationKey[id]][currentAnimationFrame[id]];
            activeRooms[details.roomCode].gameObjects[id].sprite.x = frameX;
            activeRooms[details.roomCode].gameObjects[id].sprite.y = frameY;
            return;
        }
    
        if(movingProgressRemaining[id] > 0 && activeRooms[details.roomCode].hasOwnProperty('gameObjects')) {
            currentAnimationKey[id] = "walk-"+key;
            animationFrameProgress[id] = animationFrameLimit;
            currentAnimationFrame[id] = 0;
    
            let [frameX, frameY] = animations[currentAnimationKey[id]][currentAnimationFrame[id]];
            activeRooms[details.roomCode].gameObjects[id].sprite.x = frameX;
            activeRooms[details.roomCode].gameObjects[id].sprite.y = frameY;
            return;
        }
    }

    function updateAnimationProgress(){
        Object.keys(animationFrameProgress).forEach(key => {
    
            // if animationFrameProgress > 0, downtick
            if(animationFrameProgress[key] > 0){
                animationFrameProgress[key] -= 1;
                //console.log('animFrmProg : ', Object.values(animationFrameProgress)[0]);
                return
            }
    
            // Else, reset the animationFrameProgress and move to the next Frame
            animationFrameProgress[key] = animationFrameLimit;
            currentAnimationFrame[key] += 1;
    
            // Back to first frame
            if(animations[currentAnimationKey[key]][currentAnimationFrame[key]] === undefined) {
                currentAnimationFrame[key] = 0;
            }
    
            let gameObject = findGameObjectById(key);
            if (gameObject) {
                //console.log('currAnimKey : ', Object.values(currentAnimationKey)[0]);
                //console.log('currAnimFrm : ', Object.values(currentAnimationFrame)[0]);
                let [frameX, frameY] = animations[currentAnimationKey[key]][currentAnimationFrame[key]];
                gameObject.sprite.x = frameX;
                gameObject.sprite.y = frameY;
            }
    
        })
    }
    
    // Function to find gameObject by id
    function findGameObjectById(id) {
        for (let roomId in activeRooms) {
            if (activeRooms.hasOwnProperty(roomId)) {
                let gameObjects = activeRooms[roomId].gameObjects;
                if (gameObjects.hasOwnProperty(id)) {
                    return gameObjects[id];
                }
            }
        }
        return null; // If gameObject with the given id is not found
    }

    // To indicate wether there is a wall or not 
    function isSpaceTaken (currX, currY, direction, details){
        const {x,y} = nextPosition(currX, currY, direction);
        wallBoolean = walls[`${x},${y}`] 
        quizBoolean = serverQuizStation[details.roomCode].hasOwnProperty(`${x},${y}`);
        //console.log('wallBoolean: ', wallBoolean, ' quizBoolean: ', quizBoolean);
        return(walls[`${x},${y}`] || false) || serverQuizStation[details.roomCode].hasOwnProperty(`${x},${y}`) ;
    }

    // To predict players' next position
    function nextPosition(initialX, initialY, direction) {
        let x = initialX;
        let y = initialY;
        const size = 1;
        if (direction === "left") { 
          x -= size;
        } else if (direction === "right") {
          x += size;
        } else if (direction === "up") {
          y -= size;
        } else if (direction === "down") {
          y += size;
        }

        x = Math.round(x);
        y = Math.round(y);

        //console.log('---------------------------------------------------');
        //console.log(`next coordinate: [${x},${y}]`);
        return {x,y};
    }
}

