
var music = {
    overworld: new Howl({
       src: [
          "/html-file/new_resources/clint-eastwood.mp3"
       ],
       volume: 0
    })
}
var before = document.getElementById("before");
var liner = document.getElementById("liner");
var command = document.getElementById("typer"); 
var textarea = document.getElementById("texter"); 
var terminal = document.getElementById("terminal");

playername_flag = true;
playername = 'unknown';
input_flag = false;
inGame_flag = false;
var commands = [];  // Store user's previous commands
let cmdIndex = 0;       // Track commands size

// Display ASCII art and stay focus on the textArea
setTimeout(function() {
    //loopLines(banner, "", 120);
    //textarea.focus();

    loopLines(["Greetings ${UnKnown}, please create your username", "<br>"], "", 120);
}, 100);

window.addEventListener("keyup", enterKey);

//init
textarea.value = "";
command.innerHTML = textarea.value;

function enterKey(e) {
    if (e.keyCode == 181) { 
        document.location.reload(true);
    }
    //--

    // Enter key
    if (e.keyCode == 13 && !inGame_flag) {

        //Take in username
        if (playername_flag){
            playername = textarea.value.trim();

            if (playername === '') { playername = "anak-buang"; }

            playername_flag = false;
            liner.classList.remove("username");

            loopLines(banner, "", 120);
            textarea.focus();
            command.innerHTML = "";
            textarea.value = "";
            document.getElementById("terminal").querySelector("p").remove();

            document.styleSheets[0].cssRules[8].style.content = `"${playername}@morphio.com:~$"`;

            music.overworld.play();
            music.overworld.fade(0,0.2,10000);
            return;
        }

        if (input_flag){
            joinRoom(textarea.value);
            input_flag = false;
            liner.classList.remove("joinroomcode");
        } else {
            commands.push(command.innerHTML);
            cmdIndex = commands.length;
            addLine(`${playername}@morphio.com:~$ ` + command.innerHTML, "no-animation", 0);
            commander(command.innerHTML.toLowerCase());
        }
        command.innerHTML = "";
        textarea.value = "";
    }
    console.log(cmdIndex);
    // ArrowUp key
    if (e.keyCode == 38 && cmdIndex !== 0) {
        cmdIndex -= 1;
        textarea.value = commands[cmdIndex];
        command.innerHTML = textarea.value;
    }
      // ArrowDown key
    if (e.keyCode == 40 && cmdIndex != commands.length) {
        cmdIndex += 1;
        if (commands[cmdIndex] === undefined) {
          textarea.value = "";
        } else {
          textarea.value = commands[cmdIndex];
        }
        command.innerHTML = textarea.value;
    }
}

function commander (cmd) {
    switch (cmd.toLowerCase()) {
        case "help":
            loopLines(help, "color2 margin", 80);
            break;
        case "create-room":
            createRoom();
            break;
        case "join-room":
            liner.classList.add("joinroomcode");
            input_flag = true;
            break;
        default:
            addLine("<br><span class=\"inherit\">Command not found. For a list of commands, type <span class=\"command\">'help'</span>.</span><br><br>", "error", 100);
            break;
    }
}

function addLine(text, style, time) {
    var t = "";
    for (let i = 0; i < text.length; i++) {
        if (text.charAt(i) == " " && text.charAt(i + 1) == " ") {
            t += "&nbsp;&nbsp;";
            i++;
        } else {
            t += text.charAt(i);
        }
    }
    setTimeout(function() {
        var next = document.createElement("p");
        next.innerHTML = t;
        next.className = style;
    
        before.parentNode.insertBefore(next, before);
    
        window.scrollTo(0, document.body.offsetHeight);
    }, time);
}

function loopLines(name, style, time) {
name.forEach(function(item, index) {
    addLine(item, style, index * time);
});
}