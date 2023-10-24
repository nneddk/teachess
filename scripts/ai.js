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
    boardEval(currentBoard.whiteBoard);
    if (openingMove){
        //return openingMove;
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
    console.log(board);
    //mirrored PST Tables must be implemented for black (more on this shortly)
    //Using PeSTO's Evaluation Function for this.
    //mg = middlegame, eg = endgame
    const P = 0,
    N = 1,
    B = 2,
    R = 3,
    Q = 4,
    K = 5;

    const pieceSquareTable = {
        pawnPST:{
            mg: [[0,    0,   0,   0,   0,   0,  0,   0],
                 [98, 134,  61,  95,  68, 126, 34, -11],
                 [-6,   7,  26,  31,  65,  56, 25, -20],
                 [-14,  13,   6,  21,  23,  12, 17, -23],
                 [-27,  -2,  -5,  12,  17,   6, 10, -25],
                 [-26,  -4,  -4, -10,   3,   3, 33, -12],
                 [-35,  -1, -20, -23, -15,  24, 38, -22],
                 [ 0,   0,   0,   0,   0,   0,  0,   0]],
        },
        knightPST:{
            mg: [[-167, -89, -34, -49,  61, -97, -15, -107],
                [-73, -41,  72,  36,  23,  62,   7,  -17],
                [-47,  60,  37,  65,  84, 129,  73,   44],
                [ -9,  17,  19,  53,  37,  69,  18,   22],
                [-13,   4,  16,  13,  28,  19,  21,   -8],
                [-23,  -9,  12,  10,  19,  17,  25,  -16],
                [-29, -53, -12,  -3,  -1,  18, -14,  -19],
               [-105, -21, -58, -33, -17, -28, -19,  -23]],
        },
        bishopPST:{
            mg:[ [-29,   4, -82, -37, -25, -42,   7,  -8],
                [-26,  16, -18, -13,  30,  59,  18, -47],
                [-16,  37,  43,  40,  35,  50,  37,  -2],
                [ -4,   5,  19,  50,  37,  37,   7,  -2],
                [ -6,  13,  13,  26,  34,  12,  10,   4],
                [  0,  15,  15,  15,  14,  27,  18,  10],
                [  4,  15,  16,   0,   7,  21,  33,   1],
                [-33,  -3, -14, -21, -13, -12, -39, -21]]
        },
        rookPST:{
            mg: [[32,  42,  32,  51, 63,  9,  31,  43],
             [27,  32,  58,  62, 80, 67,  26,  44],
             [-5,  19,  26,  36, 17, 45,  61,  16],
             [-24, -11,   7,  26, 24, 35,  -8, -20],
             [-36, -26, -12,  -1,  9, -7,   6, -23],
             [-45, -25, -16, -17,  3,  0,  -5, -33],
             [-44, -16, -20,  -9, -1, 11,  -6, -71],
             [-19, -13,   1,  17, 16,  7, -37, -26]],
        },
        queenPST:{
            mg:[[-28,   0,  29,  12,  59,  44,  43,  45],
                [-24, -39,  -5,   1, -16,  57,  28,  54],
                [-13, -17,   7,   8,  29,  56,  47,  57],
                [-27, -27, -16, -16,  -1,  17,  -2,   1],
                [ -9, -26,  -9, -10,  -2,  -4,   3,  -3],
                [-14,   2, -11,  -2,  -5,   2,  14,   5],
                [-35,  -8,  11,   2,   8,  15,  -3,   1],
                [ -1, -18,  -9,  10, -15, -25, -31, -50]],
        },
        kingPST:{
            mg:[[-65,  23,  16, -15, -56, -34,   2,  13],
                [29,  -1, -20,  -7,  -8,  -4, -38, -29],
                [-9,  24,   2, -16, -20,   6,  22, -22],
                [-17, -20, -12, -27, -30, -25, -14, -36],
                [-49,  -1, -27, -39, -46, -44, -33, -51],
                [-14, -14, -22, -46, -44, -30, -15, -27],
                [ 1,   7,  -8, -64, -43, -16,   9,   8],
                [-15,  36,  12, -54,   8, -28,  24,  14]]
        }

    };
    
    
    //Piece-Square Table
}
function getBoardPosition(){
    //this builds the template for piece square tables, maybe temporary if i find an easier way to calculate it
    let boardData = chessBoard.getBoardData();
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
