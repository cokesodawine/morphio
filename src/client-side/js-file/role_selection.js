class Role_Selection {
    constructor(socket, details) {
        this.socket = socket;
        this.details = details;
    }

    mateToNaviEvent (key){
        selection = document.getElementById('mateSelection');
        this.updateNavigatorEvent(key, selection, 'receive', this.socket, this.details);
    }

    updateNavigatorEvent (key, selection, type){
        updateNavigator(key, selection, type, this.socket, this.details);
    }

    countdownFinishedEvent () {
        setTimeout(() => {
            console.log('countdownFinished event');
            document.getElementById('thirdPage').style.display = 'none';
            document.getElementById('secondPage').style.display = 'block';
        }, 1000);
    }
}

function updateNavigator(key, selection, type, socket, details){
    const leftSquare = document.getElementById('leftSquare');
    const rightSquare = document.getElementById('rightSquare');

    //console.log(event)
    if (key === 'ArrowLeft') {
        if (rightSquare.contains(selection)) {
            rightSquare.removeChild(selection);
            leftSquare.appendChild(selection);
            if (type === 'send'){
                updateMateNavigator('ArrowLeft', socket, details);
            }
        }
    } 
    if (key === 'ArrowRight') {
        if (leftSquare.contains(selection)) {
            leftSquare.removeChild(selection);
            rightSquare.appendChild(selection);
            if (type === 'send'){
                updateMateNavigator('ArrowRight', socket, details);
            }
        }
    }
}

function updateMateNavigator(key, socket, details){
    socket.emit('myNavigator', {key, details})
}