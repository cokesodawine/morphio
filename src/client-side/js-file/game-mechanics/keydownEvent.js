// Universal variables for client side
const mprStart = 10
let movingProgressRemaining = 0;
let eventQueue = [];
let interval_ = null;

// Univaersal variables for sprites
let currentAnimation = "walk-right"
let currentAnimationFrame = 0;
const animationFrameLimit = 5;
let animationFrameProgress = animationFrameLimit;

const keydownEvent = {

    keydownMethod({ key, details }){
        console.log('key down')
        // Limit to only 1 event
        if(eventQueue.length < 1){
            eventQueue.push({key})
        }

        // If interval has been killed, start to process the queue
        if(interval_ === null){
            movingProgressRemaining = mprStart;
            processEventQueue(details);
            updateSprite(key, details.selfId);
            console.log(currentAnimation)
        }
    },

    get spriteFrame() {
        return window.animations[currentAnimation][currentAnimationFrame];
    }

}

// 

function processEventQueue(details) {
    if(eventQueue.length > 0){

        // Take in the data of the event
        const event = eventQueue[0];
        const {key} = event

        // Update coordinate of the avatar & decrease mpr
        updatePosition(key, details.selfId);
        movingProgressRemaining -= 1;

        // Control the mechanism loop
        if(movingProgressRemaining > 0){
            interval_ = setTimeout(()=>{
                processEventQueue(details);
            }, 15);
        } else {
            eventQueue.shift(); //remove event from the queue

            // If there is still an event (new) within the queue, process the event
            if(eventQueue.length > 0 && movingProgressRemaining === 0) {
                movingProgressRemaining = mprStart;
                processEventQueue(details);
            } else {
                interval_ = null;
                updateSprite(key, details.selfId);
            }

        }

    }
}

function updatePosition(key, id) {

    const directionUpdate = {
        "up": ["y", -0.100000000000000],
        "down": ["y", 0.100000000000000],
        "left": ["x", -0.100000000000000],
        "right": ["x", 0.100000000000000]
    }

    // Change coordinates
    const [property, change] = directionUpdate[key];
    window.gameplayDetails.gameObjects[id].position[property] += change;

}

// SPRITE SECTION --------------------------------------------------------------------------------------

function updateSprite(key, id){

    if(movingProgressRemaining === 0) {
        currentAnimation = "idle-"+key
        animationFrameProgress = animationFrameLimit;
        currentAnimationFrame = 0;

        [frameX, frameY] = window.animations[currentAnimation][currentAnimationFrame]
        window.gameplayDetails.gameObjects[id].sprite['x']= frameX;
        window.gameplayDetails.gameObjects[id].sprite['y']= frameY;
        return
    }

    if(movingProgressRemaining > 0) {
        currentAnimation = "walk-"+key
        animationFrameProgress = animationFrameLimit;
        currentAnimationFrame = 0;

        [frameX, frameY] = window.animations[currentAnimation][currentAnimationFrame]
        window.gameplayDetails.gameObjects[id].sprite['x']= frameX;
        window.gameplayDetails.gameObjects[id].sprite['y']= frameY;
        return
    }

    console.log(currentAnimation);
}

function updateAnimationProgress(id) {
    
    // Downtick frame progress
    if(animationFrameProgress > 0) {
        animationFrameProgress -= 1;
        return
    }

    // Reset progress counter
    animationFrameProgress = animationFrameLimit;
    currentAnimationFrame += 1;

    if(keydownEvent.spriteFrame === undefined){
        currentAnimationFrame = 0;
    }

    [frameX, frameY] = window.animations[currentAnimation][currentAnimationFrame]
    window.gameplayDetails.gameObjects[id].sprite.x= frameX;
    window.gameplayDetails.gameObjects[id].sprite.y= frameY;
}

window.animations = {
    "idle-down" : [ [0,0] ],
    "idle-right": [ [0,1] ],
    "idle-up"   : [ [0,2] ],
    "idle-left" : [ [0,3] ],
    "walk-down" : [ [1,0],[0,0],[3,0],[0,0], ],
    "walk-right": [ [1,1],[0,1],[3,1],[0,1], ],
    "walk-up"   : [ [1,2],[0,2],[3,2],[0,2], ],
    "walk-left" : [ [1,3],[0,3],[3,3],[0,3], ]
}