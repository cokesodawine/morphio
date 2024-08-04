class Init {
    constructor(config) {
        this.socket = config.socket;
        this.details = config.details;
    }

    roomCreatedEvent(colorCode) {
        console.log(`Blue Code: ${colorCode.blueCode}, Red Code: ${colorCode.redCode}`);
        loopLines(
            [
                "<br>", 
                `Blue Team : ${colorCode.blueCode}`, 
                `Red Team : ${colorCode.redCode}`,
                "<br>",
                "<span class=\"index\"> - Provided are the codes for both Red Team and Blue Team </span>",
                "<span class=\"index\"> - Since you have created the room, please distribute the codes to both of your teammate and your team's opponents </span>",
                "<span class=\"index\"> - To join the room simply type '<span class=\"command\">join-room</span>' and enter one of the code given </span>",
                "<br>"
            ], 
            "color2 margin", 
            80
        )

    }

    joinFailedEvent(message){ 
        loopLines(
            [
                "<br>",
                `${message}, Please try again...`,
                " - To join the room simply type 'join-room' and enter your team's code",
                "<br>"
            ], 
            "error", 
            100
        )
    }

    playerJoinedEvent(input) {
        this.details = input.relv_details;
    
        console.log(`Player ${this.details.selfId} joined ${this.details.colorCode} team in room ${this.details.roomCode}`);
    
        // Handle UI updates if needed
//        document.getElementById('firstPage').style.display = 'none';
//        document.getElementById('secondPage').style.display = 'block';
    
        if(input.totalPlayers === 2){
            // Get teammateId
            this.socket.emit('getTeammateId', this.details)
    
//            setTimeout(() => {
//                document.getElementById('secondPage').style.display = 'none';
//                document.getElementById('thirdPage').style.display = 'flex';
//            }, 1000);
        }
        var commandElement = document.getElementById("command");
        if (commandElement) {
            commandElement.remove();
        }
    }

    receiveTeammateIdEvent (teammateId){
        this.details.selfId = socket.id
        this.details.teammateId = teammateId
    }

    getDetails (){
        return this.details;
    }
}



function createRoom() {
    socket.emit('createRoom');
}

function joinRoom(code) {
    code = code.replace(/[\n\r]/g, '');
    console.log(`..${code}..`)
    console.log(code.length);
    socket.emit('joinRoom', { code, playername });
}

// COMMAND LIBRARY ---------------------------------------------

banner = [
    '<span class="index">Browsers WeakShell</span>',
    '<span class="index">Copyright (C) CokeSodaWine Corporation. All rights are not reserved.</span>',
    "<br>",
    '<span class="index">Install the latest WeakShell for new features and improvements! https://aka.scw/WSBrowsers.</span>',
    "<br>",
    ``,
    `███╗   ███╗ ██████╗  ██████╗ ██████╗██╗  ██╗   ██╗ ██████╗ `,
    `████╗ ████║██╔═══██╗██╔══██╗██╔══██╗██║  ██║   ██║██╔═══██╗`,
    `██╔████╔██║██║   ██║██████╔╝██████╔╝███████║   ██║██║   ██║`,
    `██║╚██╔╝██║██║   ██║██╔══██╗██╔═══╝ ██╔══██║   ██║██║   ██║`,
    `██║ ╚═╝ ██║╚██████╔╝██║  ██║██║     ██║  ██║██╗██║╚██████╔╝`,
    `╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝╚═╝ ╚═════╝ `,
    "~~~~~~~~~~~~~~~~~~~~~~~~~ Built by The Geek for The Geeks ~",
    "<br>",
    '<span class="color2">Test your unknown level of brightness.</span>',
    "<span class=\"color2\">For a list of available commands, type</span> <span class=\"command\">'help'</span><span class=\"color2\">.</span><br><br>",
];



help = [
"<br>",
'<span class="command">create-room</span>       To create gameroom',
'<span class="command">join-room</span>         To join gameroom',
"<br>",
];




originalbanner = [
    '<span class="index">Doors WeakShell</span>',
    '<span class="index">Copyright (C) CokeSodaWine Corporation. All rights are not reserved.</span>',
    "<br>",
    '<span class="index">Install the latest WeakShell for new features and improvements! https://aka.csw/WSDoors.</span>',
    "<br>",
    ``,
    `██╗░░██╗███████╗██████╗░░█████╗░██╗░░░░░░█████╗░  ░░░░░██╗░█████╗░██╗░░░██╗░█████╗░`,
    `██║░██╔╝██╔════╝██╔══██╗██╔══██╗██║░░░░░██╔══██╗  ░░░░░██║██╔══██╗██║░░░██║██╔══██╗`,
    `█████═╝░█████╗░░██████╔╝███████║██║░░░░░███████║  ░░░░░██║███████║╚██╗░██╔╝███████║`,
    `██╔═██╗░██╔══╝░░██╔═══╝░██╔══██║██║░░░░░██╔══██║  ██╗░░██║██╔══██║░╚████╔╝░██╔══██║`,
    `██║░╚██╗███████╗██║░░░░░██║░░██║███████╗██║░░██║  ╚█████╔╝██║░░██║░░╚██╔╝░░██║░░██║`,
    `╚═╝░░╚═╝╚══════╝╚═╝░░░░░╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝  ░╚════╝░╚═╝░░╚═╝░░░╚═╝░░░╚═╝░░╚═╝`,
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Built by The Geek for The Geeks ~",
    "<br>",
    '<span class="color2">Test your unknown level of stupidity.</span>',
    "<span class=\"color2\">For a list of available commands, type</span> <span class=\"command\">'help'</span><span class=\"color2\">.</span>",
];
