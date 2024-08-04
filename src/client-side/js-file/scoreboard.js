

function startScoreBoard(scoreboardData, details) {

    const scoretable = 
        `<br>
        <table>
            <thead>
                <tr>
                    <th rowspan="2" style="width:250px;">    Player    </th>
                    <th rowspan="2" style="width:250px;">     Role     </th>
                    <th rowspan="2" style="width:100px;">     Pts      </th>
                    <th colspan="3" >    Amount of Correct Answers    </th>
                </tr>
                <tr>
                    <th>  Hard  </th>
                    <th> Medium </th>
                    <th>  Easy  </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td> ${Object.values(scoreboardData['players-score'])[0].name} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[0].role} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[0].pointSys.pointGained} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[0].pointSys.hard} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[0].pointSys.medium} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[0].pointSys.easy} </td>
                </tr>
                <tr>
                    <td> ${Object.values(scoreboardData['players-score'])[1].name} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[1].role} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[1].pointSys.pointGained} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[1].pointSys.hard} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[1].pointSys.medium} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[1].pointSys.easy} </td>
                </tr>
                <tr>
                    <td> ${Object.values(scoreboardData['players-score'])[2].name} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[2].role} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[2].pointSys.pointGained} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[2].pointSys.hard} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[2].pointSys.medium} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[2].pointSys.easy} </td>
                </tr>
                <tr>
                    <td> ${Object.values(scoreboardData['players-score'])[3].name} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[3].role} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[3].pointSys.pointGained} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[3].pointSys.hard} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[3].pointSys.medium} </td>
                    <td> ${Object.values(scoreboardData['players-score'])[3].pointSys.easy} </td>
                </tr>
            </tbody>
        </table>`;

    const messageDic = {
        'draw' : `What a draw! Good Game All`,
        'win'  : `Congratzz! You team won the game`,
        'lose' : `Hard luck buddy, your team lose the game :(`
    }      

    // win or lose
    const oppoTeam = (details.colorCode === "blue") ? "red" : "blue";
    let loseORwin = null;
    if (scoreboardData[`${details.colorCode}-team`] == scoreboardData[`${oppoTeam}-team`]){
        loseORwin = 'draw';
    } else if (scoreboardData[`${details.colorCode}-team`] > scoreboardData[`${oppoTeam}-team`]){
        loseORwin = 'win'
    } else {
        loseORwin = 'lose'
    }

    const scoreboardLayout = document.createElement('div');
    scoreboardLayout.classList.add('sb-outer');
    scoreboardLayout.innerHTML = (`
        <div class="sb-inner">${scoretable}</div>
        <br><br> ${messageDic[loseORwin]}
        <br><br> "ctrl + R"
    `);
    document.body.appendChild(scoreboardLayout);
//        
////    if (loseORwin === 'win'){
////        loopLines(win, "", 120);
////    } else if (loseORwin === 'lose') {
////        loopLines(lose, "", 120);
////    } else {
////        loopLines(draw, "", 120);
////    }
//
//    setTimeout(function() {
//        loopLines(scoretable, "", 120);
//    }, 3000);
//
}

