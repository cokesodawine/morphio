class Gameworld {
    constructor(config){
        this.socket = config.socket;
        this.element = config.element;
        this.details = config.details;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.avatarImages = {}; // Object to store loaded avatar images
        this.lowerMapImage = null; // Object to store loaded lower map images
        this.quizStateImages = {}; // Object to store loaded quiz states
        this.quizLevelImages = {}; // Object to store loaded quiz level
        
        this.roleConstraint = {
            "blue builder" : "red",
            "red builder"  : "blue",
            "blue breaker" : "neutral",
            "red breaker"  : "neutral"
        }
    }

    startGameLoop() {
        let debounceTimer;

        const step = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (this.directionInput.direction) {
                this.key = this.directionInput.direction;
                // Sebab dah ada 'eventQueue' dkt server, so 'debounceTimer' might not necess for event emission
                if (!debounceTimer) {
                    debounceTimer = setTimeout(() => {
                        //keydownEvent.keydownMethod({ details: this.details, key: this.key })
                        this.socket.emit('key-down-event', { details: this.details, key: this.key });
                        debounceTimer = null;
                    }, 15);  //original val : 170
                }
            }

            if(this.lowerMapImage) {
                this.ctx.drawImage(this.lowerMapImage, 0, -3);
            }

            window.gameplayDetails.gameObjects = { ...window.gameplayDetails.gameObjects, ...window.quizStation };
            Object.values(window.gameplayDetails.gameObjects)
            .sort((a,b) => a.position.y - b.position.y)
            .forEach (object => {
                const avatarImg = this.avatarImages[object.avatarSrc];
                if (avatarImg){
                    this.ctx.drawImage (
                        avatarImg,
                        object.sprite.x * 16, object.sprite.y * 16,
                        16, 16,
                        object.position.x *16, object.position.y *16+4,
                        16, 16
                    );

                    // Set the font and style for the text
                    this.ctx.font = '10px Calibri';
                    this.ctx.fillStyle = 'white';
                    this.ctx.textAlign = 'center';

                    // demonstration indicator
                    const demoRole = (object.role === 'builder') ? 'repair' : 'sabotage';

                    // Draw the player's name above the avatar
                    this.ctx.fillText(
                        demoRole,
                        object.position.x * 16 + 9, 
                        object.position.y * 16
                    );

                } else {
                    
                    if(object.state === 'neutral') {
                        const level_key = `/html-file/new_resources/terminal_${object.level}.png`;
                        const quizLevelImg = this.quizLevelImages[level_key];
                        this.ctx.drawImage (
                            quizLevelImg,
                            0, 0,
                            32, 32,
                            object.position.x *16, object.position.y *16-4,
                            32, 32
                        )
                    } else {
                        const state_key = `/html-file/new_resources/terminal_${object.state}.png`;
                        const quizStateImg = this.quizStateImages[state_key];
                        this.ctx.drawImage (
                            quizStateImg,
                            0, 0,
                            32, 32,
                            object.position.x *16, object.position.y *16-4,
                            32, 32
                        )
                    }
                }
            });

            //Progress Bar Rendering System
            let blue_fills = document.querySelectorAll(".blueProgress");
            let red_fills = document.querySelectorAll(".redProgress");
            let maxProgress = 100;
            let blueProgress = 100 - ((window.gameplayDetails.progressBar['blue']/maxProgress)*100);
            let redProgress = 100 - ((window.gameplayDetails.progressBar['red']/maxProgress)*100);
            blue_fills.forEach(element => {
                element.setAttribute("y", blueProgress + "%");  
                let blueStateOfProgress = blueProgress > 50 ? "#034E9A" : "#0180FF";
                element.setAttribute("fill", blueStateOfProgress)
            });
            red_fills.forEach(element => {
                element.setAttribute("y", redProgress + "%");
                let redStateOfProgress = redProgress > 50 ? "#B90B0B" : "#FF0202";
                element.setAttribute("fill", redStateOfProgress)
            });

            //Terminate QnA event after countdown
            if(isAnswering && window.quizCountDown === 0){
                this.qpanel.done();
            }
            
            requestAnimationFrame(step);
        };
        step();
    }

    loadResources() {
        // pre-set the legends -------------------------------
        let rbreaker = "";
        let rbuilder = "";
        let bbreaker = "";
        let bbuilder = "";
        console.log(Object.values(window.gameplayDetails.gameObjects));
        let data = Object.values(window.gameplayDetails.gameObjects);
        for (const key in data) {
            if (data[key].team === 'blue' && data[key].role === 'breaker'){
                bbreaker = data[key].name;
            } else if (data[key].team === 'blue' && data[key].role === 'builder'){
                bbuilder = data[key].name;
            } else if (data[key].team === 'red' && data[key].role === 'breaker'){
                rbreaker = data[key].name;
            } else if (data[key].team === 'red' && data[key].role === 'builder'){
                rbuilder = data[key].name;
            } else {
                console.log('undefined team or role');
            }
        }
        document.querySelector('.rbreaker-legend').innerHTML = rbreaker;
        document.querySelector('.rbuilder-legend').innerHTML = rbuilder;
        document.querySelector('.bbreaker-legend').innerHTML = bbreaker;
        document.querySelector('.bbuilder-legend').innerHTML = bbuilder;

        // Load Avatar assets -------------------------------
        const avatarSrcList = Object.values(window.gameplayDetails.gameObjects)
        .map(object => object.avatarSrc)
        .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

        const avatarPromises = avatarSrcList.map(src => new Promise((resolve, reject) => {
            const avatarImg = new Image();
            avatarImg.onload = () => {
                this.avatarImages[src] = avatarImg;
                resolve();
            };
            avatarImg.onerror = reject;
            avatarImg.src = src;
        }));

        // Load lowerMap asset -------------------------------
        const lowerMapSrc = '/html-file/new_resources/map.png' // Provide the path to your lower map image
        const lowerMapPromise = new Promise((resolve, reject) => {
            const lowerMapImg = new Image();
            lowerMapImg.onload = () => {
                this.lowerMapImage = lowerMapImg;
                resolve();
            };
            lowerMapImg.onerror = reject;
            lowerMapImg.src = lowerMapSrc;
        });

        // Load in Quiz Station State -------------------------------
        const quizStateSrcs = [
            '/html-file/new_resources/terminal_blue.png',
            '/html-file/new_resources/terminal_red.png'
        ];
        const quizStatePromises = quizStateSrcs.map(src => new Promise((resolve, reject) => {
            const quizStateImg = new Image();
            quizStateImg.onload = () => {
                this.quizStateImages[src] = quizStateImg;
                resolve();
            }
            quizStateImg.onerror = reject;
            quizStateImg.src = src
        }));


        // Load in Quiz Station Level -------------------------------
        const quizLevelSrcs = [
            '/html-file/new_resources/terminal_easy.png',
            '/html-file/new_resources/terminal_medium.png',
            '/html-file/new_resources/terminal_hard.png'
        ]
        const quizLevelPromises = quizLevelSrcs.map(src => new Promise((resolve, reject) => {
            const quizLevelImg = new Image();
            quizLevelImg.onload = () => {
                this.quizLevelImages[src] = quizLevelImg;
                resolve();
            }
            quizLevelImg.onerror = reject;
            quizLevelImg.src = src;
        }));

    return Promise.all([...quizLevelPromises, ...quizStatePromises, lowerMapPromise, ...avatarPromises]);
    }

    bindActionInput(){
        new keyPressListener("Enter", () => {
            //check whether there is a quiz or not
            const selfAvatar = window.gameplayDetails.gameObjects[this.details.selfId];
            const nextCoords = utils.nextPosition(selfAvatar.position.x, selfAvatar.position.y, this.key);
            const match = Object.values(window.quizStation).find(object => {
                return `${object.position['x']},${object.position['y']}` === `${nextCoords.x},${nextCoords.y}`
            });

            let team = window.gameplayDetails.gameObjects[this.socket.id].team;
            let role = window.gameplayDetails.gameObjects[this.socket.id].role;
        
            // If builder --> neutral || breaker --> red/blue
            if(match.state !== this.roleConstraint[`${team} ${role}`]) {
                isAnswering = true;
                const rcpanel = new RoleConstraintPanel(`${team} ${role}`);
                rcpanel.init( document.querySelector(".game-container") );
                return;
            }

            // If the someone is using the terminal
            if (match.inUsed !== '' && match.inUsed !== this.socket.id){
                isAnswering = true;
                const rcpanel = new WrongAnswerPanel();  // Class sharing is caring ;)
                rcpanel.init( document.querySelector(".game-container") );
                document.querySelector(".wrong-answer-panel").innerHTML = (`Someone is using the terminal <div class="backspace">&lt;- backspace</div>`);
                return;
            }

            // If the terminal is on hold
            if (window.awayFromTerminal.hasOwnProperty(`${match.position.x},${match.position.y}`)){
                let key = `${match.position.x},${match.position.y}`;
                const terminalAway = new WrongAnswerPanel();  // Class sharing is caring ;)
                terminalAway.init( document.querySelector(".game-container") );
                document.querySelector(".wrong-answer-panel").innerHTML = (
                    `Nuh uh.. you can't repeat the same question. That's cheating :( Hold on for ${window.awayFromTerminalCount[key]} seconds <div class="backspace">&lt;- backspace</div>`);
                return;
            }

            // If there is a quiz
            if(match && !isAnswering){
                isAnswering = true;
                debug({str: 'Gameworld | bindActionInput: ', obj: match});
                this.qpanel = new QnAPanel({ match, answerChoices: match.ansChoice, details:this.details, socket: this.socket});
                this.qpanel.init( document.querySelector(".game-container") );

                // SOCKET SHOULD BE INVOKED ONCE THE ANSWER IS CONFIRMED
                // JUST FOR THE SAKE OF DEMONSTRATION :/
                this.socket.emit('init-quiz-event', { details: this.details, key: this.key, quizCoor: nextCoords });
            }
        })
    }
    

    init() {
        this.loadResources()
        .then(() => {
            this.bindActionInput();
            this.directionInput = new DirectionInput();
            this.directionInput.init();
            this.startGameLoop();
        })
        .catch(error => {
            console.error('Error loading avatar images:', error);
        });
    }
}