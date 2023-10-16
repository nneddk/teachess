import { chessBoard } from "./chessboard.js";
let openingMoves = [];
export function setOpenings(openings){
    for (let i = 0; i< openings.length; i++){
        let tempPGN = openings[i].pgn;
        tempPGN.trim();
        tempPGN = tempPGN.split(' ');
        let tempCompletePGN = [];
        for(let j = 0; j < tempPGN.length; j++){
            if(j%3 ==0) continue;
            tempCompletePGN.push(tempPGN[j]);
        }
        openingMoves.push(tempCompletePGN);
    }
}

export function getNextMove(availableMoves, pgn){
    //check if openings are viable
    let openingMove = openingCheck(pgn);
    if (openingMove){
        return openingMove;
    }
    return false;
}

function openingCheck(currentPGN){
    let originalPGN = currentPGN;
    //clean up pgn for searching
    currentPGN = currentPGN.trim();
    currentPGN = currentPGN.replace(/(\r\n|\n)/gm, " ");
    currentPGN = currentPGN.split(' ');
    let tempCurrentPGN = []
    let availableOpenings = [];
    for(let j = 0; j < currentPGN.length; j++){
        if(j%3 ==0) continue;
        tempCurrentPGN.push(currentPGN[j]);
    }
    currentPGN = tempCurrentPGN;
    for(let i = 0; i<openingMoves.length; i++){
        for(let j = 0; j<currentPGN.length; j++){
            if(openingMoves[i][j] != currentPGN[j]){
                break;
            }
            if (j == (currentPGN.length - 1)){
                /*
                if(currentPGN.length == openingMoves[i].length){

                }*/
                availableOpenings.push(openingMoves[i]);
            }
        }
    }
    let randomIndex = Math.floor(Math.random()*(availableOpenings.length));
    //TEMPORARY, MAKE SURE TO FIX
    console.log(availableOpenings[randomIndex]);
    if(availableOpenings.length > 0 && (availableOpenings[randomIndex].length > currentPGN.length)){
        console.log('tick');
        return translateMove(currentPGN, availableOpenings[randomIndex][currentPGN.length]);
    }
    return false;
}
function translateMove(currentPGN, notation){
    let color = (currentPGN.length%2==0)?true:false;
    console.log(notation);
    let translatedMove = chessBoard.translatePgn(notation, true, color);
    let translatedMoveData = {
        color:translatedMove.color,
        id:translatedMove.id,
        x:translatedMove.oldX,
        y:translatedMove.oldY,
        move:{
            x:translatedMove.newX,
            y:translatedMove.newY,
        },
        hasMoved: translatedMove.hasMoved,
        notation:translatedMove.notation,
    }
    return translatedMoveData;
}

