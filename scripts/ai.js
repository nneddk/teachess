import { chessBoard } from "./chessboard.js";
let currentBoard = {
    whiteBoard: [],
    blackBoard: [],
}
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
    getBoardPosition();
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
    if(availableOpenings.length > 0 && (availableOpenings[randomIndex].length > currentPGN.length)){
        return translateMove(currentPGN, availableOpenings[randomIndex][currentPGN.length]);
    }
    return false;
}
function translateMove(currentPGN, notation){
    let color = (currentPGN.length%2==0)?true:false;
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

function boardEval(board){
    //mirrored PST Tables must be implemented for black (more on this shortly)

}
function getBoardPosition(){
    //this builds the template for piece square tables, maybe temporary if i find an easier way to calculate it
    let boardData = chessBoard.getBoardData();
    console.log(boardData)
    let boardArray = {
        whitePieces: [],
        blackPieces: [],
    }
    for(let i = 0; i < 8; i++){
        let tempWhiteArrayData = [], tempBlackArrayData = [];
        for(let j = 0; j < 8; j++){
            let whiteData = "";
            let blackData = "";

            if(!boardData[i][j].isEmpty){
                if(boardData[i][j].pieceData.color){
                    whiteData+= boardData[i][j].pieceData.notation;
                }else if(!boardData[i][j].pieceData.color){
                    blackData+= boardData[i][j].pieceData.notation;
                }
            }
            if(whiteData == "")whiteData += '_';
            if(blackData == "")blackData += '_';
            tempWhiteArrayData.push(whiteData);
            tempBlackArrayData.push(blackData);
            }
            boardArray.whitePieces.push(tempWhiteArrayData);
            boardArray.blackPieces.push(tempBlackArrayData);
        }
    //this flips the boardData, for utilizing PST
    function boardFlip(board){
        let tempBoardArray = [];
        for(let i = 7; i >= 0; i--){
            let tempDataArray = []
            for(let j = 7; j >= 0; j--){
                tempDataArray.push(board[i][j]);
            }
            tempBoardArray.push(tempDataArray);
        }
        return tempBoardArray;
    }
    currentBoard.whiteBoard = boardArray.whitePieces;
    currentBoard.blackBoard = boardArray.blackPieces;
}
