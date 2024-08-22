hh

# MORPH.IO

An online, web-based multiplayer game built for Computer Science students to learn Java Polymorphism. It combines quiz mechanism and top-down based classic game concept to create an engaging educative experience.

# GAME RULES

- It is a 2 vs 2 (red and blue)
- Each team consists of Sabotage and Repair
- Sabotage needs to sabotage as many Quiz Terminal as possible to gain points for the team
- Repair needs to repair the Quiz Terminal that has been sabotaged by opponent's team to reduce their team's points
- The goal of the game is to make sure you team's progress bar stays higher than the opponent's until the game ends.

# TECHNICAL STUFF ..YOU MIGHT WANT TO SKIP

- The architecture of the game separated into client-side and server-side.
- Client-side was built using HTML5 and vanilla JS
- While the server-side was built using Node JS, leveraging Express JS as its framework and SocketIO to bring the multiplayer feature.

# HIGH LEVEL ARCHITECTURE OF THE GAME 

hh

# GETTING STARTED

All you need is Node.JS with its NPM

How to setup ...

```bash
$ git clone https://github.com/cokesodawine/morphio.git
$ npm install
```

How to run ...

```bash
$ cd ./src/server-side/
$ node app.js
```

..by right, the program should be running on you port 3000..