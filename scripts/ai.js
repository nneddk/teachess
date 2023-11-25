
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

export function getNextMove(availableMoves, pgn, turnCheck){
    //check if openings are viable
    //console.log(availableMoves);
    //gameEval(chessBoard.getBoardData(), turnCheck, availableMoves);
    /*
    let openingMove = openingCheck(pgn);
    if(openingMove){
        return openingMove;
    }*/
    return false;
}
export function gameEval(pieces){
    return taperedEval(pieces);
    //return basicEval(pieces);
    
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
function reverseArray(array){
    return array.slice().reverse();
}

function taperedEval(activePieces){
    //mg, eg, gamephase
    let totalEval = 0;
    let mgEval = 0;
    let egEval = 0;
    let gamePhase = 0;
    for (let i = 0; i < activePieces.length; i++){
        if(activePieces[i].color){
            totalEval = totalEval + getPieceValue(activePieces[i], activePieces[i].x,activePieces[i].y);
        }else if(!activePieces[i].color){
            totalEval = totalEval- getPieceValue(activePieces[i], activePieces[i].x,activePieces[i].y);
        }
    }
    return totalEval;
    let mgPhase = gamePhase;
    if(mgPhase >24) mgPhase = 24;
    let egPhase = 24 - mgPhase;
    let evalScore = (((mgEval * mgPhase) + (egEval * egPhase)) / 24);
    return evalScore;
    
}

//tapered evals 
//mg values
const pawnMgEvalWhite = [
    [0,    0,   0,   0,   0,   0,  0,   0],
    [98, 134,  61,  95,  68, 126, 34, -11],
    [-6,   7,  26,  31,  65,  56, 25, -20],
    [-14,  13,   6,  21,  23,  12, 17, -23],
    [-27,  -2,  -5,  12,  17,   6, 10, -25],
    [-26,  -4,  -4, -10,   3,   3, 33, -12],
    [-35,  -1, -20, -23, -15,  24, 38, -22],
    [ 0,   0,   0,   0,   0,   0,  0,   0]
];
const knightMgEvalWhite = [
    [-167, -89, -34, -49,  61, -97, -15, -107],
    [-73, -41,  72,  36,  23,  62,   7,  -17],
    [-47,  60,  37,  65,  84, 129,  73,   44],
    [ -9,  17,  19,  53,  37,  69,  18,   22],
    [-13,   4,  16,  13,  28,  19,  21,   -8],
    [-23,  -9,  12,  10,  19,  17,  25,  -16],
    [-29, -53, -12,  -3,  -1,  18, -14,  -19],
    [-105, -21, -58, -33, -17, -28, -19,  -23]
];
const bishopMgEvalWhite = [
    [-29,   4, -82, -37, -25, -42,   7,  -8],
    [-26,  16, -18, -13,  30,  59,  18, -47],
    [-16,  37,  43,  40,  35,  50,  37,  -2],
    [ -4,   5,  19,  50,  37,  37,   7,  -2],
    [ -6,  13,  13,  26,  34,  12,  10,   4],
    [  0,  15,  15,  15,  14,  27,  18,  10],
    [  4,  15,  16,   0,   7,  21,  33,   1],
    [-33,  -3, -14, -21, -13, -12, -39, -21]
];
const rookMgEvalWhite = [
    [32,  42,  32,  51, 63,  9,  31,  43],
    [27,  32,  58,  62, 80, 67,  26,  44],
    [-5,  19,  26,  36, 17, 45,  61,  16],
    [-24, -11,   7,  26, 24, 35,  -8, -20],
    [-36, -26, -12,  -1,  9, -7,   6, -23],
    [-45, -25, -16, -17,  3,  0,  -5, -33],
    [-44, -16, -20,  -9, -1, 11,  -6, -71],
    [-19, -13,   1,  17, 16,  7, -37, -26]
];
const queenMgEvalWhite = [
    [-28,   0,  29,  12,  59,  44,  43,  45],
    [-24, -39,  -5,   1, -16,  57,  28,  54],
    [-13, -17,   7,   8,  29,  56,  47,  57],
    [-27, -27, -16, -16,  -1,  17,  -2,   1],
    [ -9, -26,  -9, -10,  -2,  -4,   3,  -3],
    [-14,   2, -11,  -2,  -5,   2,  14,   5],
    [-35,  -8,  11,   2,   8,  15,  -3,   1],
    [ -1, -18,  -9,  10, -15, -25, -31, -50]
];

const kingMgEvalWhite = [
    [-65,  23,  16, -15, -56, -34,   2,  13],
    [29,  -1, -20,  -7,  -8,  -4, -38, -29],
    [-9,  24,   2, -16, -20,   6,  22, -22],
    [-17, -20, -12, -27, -30, -25, -14, -36],
    [-49,  -1, -27, -39, -46, -44, -33, -51],
    [-14, -14, -22, -46, -44, -30, -15, -27],
    [ 1,   7,  -8, -64, -43, -160,   9,   8],
    [-15,  36,  12, -54,   8, -28,  60,  14]
];

const pawnMgEvalBlack = reverseArray(pawnMgEvalWhite);
const bishopMgEvalBlack = reverseArray(bishopMgEvalWhite);
const knightMgEvalBlack = reverseArray(knightMgEvalWhite);
const rookMgEvalBlack = reverseArray(rookMgEvalWhite);
const queenMgEvalBlack = reverseArray(queenMgEvalWhite);
const kingMgEvalBlack = reverseArray(kingMgEvalWhite);
console.log(kingMgEvalBlack);
const pawnEgEvalWhite = [
    [0,   0,   0,   0,   0,   0,   0,   0],
    [178, 173, 158, 134, 147, 132, 165, 187],
    [94, 100,  85,  67,  56,  53,  82,  84],
    [32,  24,  13,   5,  -2,   4,  17,  17],
    [13,   9,  -3,  -7,  -7,  -8,   3,  -1],
    [4,   7,  -6,   1,   0,  -5,  -1,  -8],
    [13,   8,   8,  10,  13,   0,   2,  -7],
    [0,   0,   0,   0,   0,   0,   0,   0]
];
const knightEgEvalWhite = [
    [-58, -38, -13, -28, -31, -27, -63, -99],
    [-25,  -8, -25,  -2,  -9, -25, -24, -52],
    [-24, -20,  10,   9,  -1,  -9, -19, -41],
    [-17,   3,  22,  22,  22,  11,   8, -18],
    [-18,  -6,  16,  25,  16,  17,   4, -18],
    [-23,  -3,  -1,  15,  10,  -3, -20, -22],
    [-42, -20, -10,  -5,  -2, -20, -23, -44],
    [-29, -100, -23, -15, -22, -18, -100, -64]
];
const bishopEgEvalWhite = [
    [-14, -21, -11,  -8, -7,  -9, -17, -24],
    [-8,  -4,   7, -12, -3, -13,  -4, -14],
    [2,  -8,   0,  -1, -2,   6,   0,   4],
    [-3,   9,  12,   9, 14,  10,   3,   2],
    [-6,   3,  13,  19,  7,  10,  -3,  -9],
    [-12,  -3,   8,  10, 13,   3,  -7, -15],
    [-14, -18,  -7,  -1,  4,  -9, -15, -27],
    [-23,  -9, -23,  -5, -9, -16,  -5, -17]
];
const rookEgEvalWhite = [
    [32,  42,  32,  51, 63,  9,  31,  43],
    [27,  32,  58,  62, 80, 67,  26,  44],
    [-5,  19,  26,  36, 17, 45,  61,  16],
    [-24, -11,   7,  26, 24, 35,  -8, -20],
    [-36, -26, -12,  -1,  9, -7,   6, -23],
    [-45, -25, -16, -17,  3,  0,  -5, -33],
    [-44, -16, -20,  -9, -1, 11,  -6, -71],
    [-19, -13,   1,  17, 16,  7, -37, -26]
];
const queenEgEvalWhite = [
    [-28,   0,  29,  12,  59,  44,  43,  45],
    [-24, -39,  -5,   1, -16,  57,  28,  54],
    [-13, -17,   7,   8,  29,  56,  47,  57],
    [-27, -27, -16, -16,  -1,  17,  -2,   1],
    [ -9, -26,  -9, -10,  -2,  -4,   3,  -3],
    [-14,   2, -11,  -2,  -5,   2,  14,   5],
    [-35,  -8,  11,   2,   8,  15,  -3,   1],
    [-1, -18,  -9,  50, -15, -25, -31, -50]
];
const kingEgEvalWhite = [
    [-74, -35, -18, -18, -11,  15,   4, -17],
    [-12,  17,  14,  17,  17,  38,  23,  11],
    [10,  17,  23,  15,  20,  45,  44,  13],
    [-8,  22,  24,  27,  26,  33,  26,   3],
    [-18,  -4,  21,  24,  27,  23,   9, -11],
    [-19,  -3,  11,  21,  23,  16,   7,  -9],
    [-27, -11,   4,  13,  14,   4,  -5, -17],
    [-53, -34, -21, -11, -28, -14, -24, -43]
];

const pawnEgEvalBlack = reverseArray(pawnEgEvalWhite);
const bishopEgEvalBlack = reverseArray(bishopEgEvalWhite);
const knightEgEvalBlack = reverseArray(knightEgEvalWhite);
const rookEgEvalBlack = reverseArray(rookEgEvalWhite);
const queenEgEvalBlack = reverseArray(queenEgEvalWhite);
const kingEgEvalBlack = reverseArray(kingEgEvalWhite);

const mgWhiteEval = [
    pawnMgEvalWhite,
    bishopMgEvalWhite,
    knightMgEvalWhite,
    rookMgEvalWhite,
    queenMgEvalWhite,
    kingMgEvalWhite,
];
const mgBlackEval = [
    pawnMgEvalBlack,
    bishopMgEvalBlack,
    knightMgEvalBlack,
    rookMgEvalBlack,
    queenMgEvalBlack,
    kingMgEvalBlack,
];

const egWhiteEval = [
    pawnEgEvalWhite,
    bishopEgEvalWhite,
    knightEgEvalWhite,
    rookEgEvalWhite,
    queenEgEvalWhite,
    kingEgEvalWhite,
];
const egBlackEval= [
    pawnEgEvalBlack,
    bishopEgEvalBlack,
    knightEgEvalBlack,
    rookEgEvalBlack,
    queenEgEvalBlack,
    kingEgEvalBlack,
];

const gamePhaseInc = [0,1,1,2,4,0];
const mgPieceValue = [82, 337, 365, 477, 1025, 10000];
const egPieceValue = [94, 281, 297, 512, 936, 10000]; 
     
function getPieceValue(piece, x, y) {
    if (piece === null) {
        return 0;
    }
    let pc = -1;
    switch (piece.notation){
        case 'P':
            pc = 0;
            break;
        case 'N':
            pc = 1;
            break;
        case 'B':
            pc = 2;
            break;
        case 'R':
            pc = 3;
            break;
        case 'Q':
            pc = 4;
            break;
        case 'K':
            pc = 5;
            break;
        default:
            break;
    }
    function getMgValue(isWhite, x, y){
        if(isWhite){
            return mgPieceValue[pc] + mgWhiteEval[pc][y][x];
        }else if(!isWhite){
            return mgPieceValue[pc] + mgBlackEval[pc][y][x];
        }   
    }
    function getEgValue(isWhite, x, y){
        if(isWhite){
            return egPieceValue[pc] + egWhiteEval[pc][y][x];
        }else if(!isWhite){
            return egPieceValue[pc] + egBlackEval[pc][y][x];
        }   
    }
    let mgValue = getMgValue(piece.color, x, y);
    let egValue = getEgValue(piece.color, x, y);
    let gamePhase = gamePhaseInc[pc];
    return mgValue;
}
console.log(mgWhiteEval[5][1][0]);
/*

function basicEval(activePieces){
    let totalEval = 0;
    let totalEvalEg = 0
    let endGame = false;
    const gamePhaseInc = [0,1,1,2,4,0];
    let gamePhase = 0;
    for (let i = 0; i < activePieces.length; i++){
        let pc = -1;
        totalEval += getPieceValue(activePieces[i], activePieces[i].y,activePieces[i].x)[0];
        totalEvalEg = totalEvalEg +(getPieceValue(activePieces[i], activePieces[i].y,activePieces[i].x)[1]);
        
        switch (activePieces[i].notation){
            case 'P':
                pc = 0;
                break;
            case 'N':
                pc = 1;
                break;
            case 'B':
                pc = 2;
                break;
            case 'R':
                pc = 3;
                break;
            case 'Q':
                pc = 4;
                break;
            case 'K':
                pc = 5;
                break;
            default:
                break;
        }
        gamePhase = gamePhase+gamePhaseInc[pc]

    }
    return totalEval;
}
const pawnEvalWhite =
    [
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
        [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
        [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
        [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
        [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
        [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
        [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
    ];
const pawnEvalBlack = reverseArray(pawnEvalWhite);

const knightEval =
    [
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
        [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
        [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
        [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
        [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
        [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
        [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
    ];

const bishopEvalWhite = [
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
    [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
    [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
    [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
    [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

const bishopEvalBlack = reverseArray(bishopEvalWhite);

const rookEvalWhite = [
    [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];

const rookEvalBlack = reverseArray(rookEvalWhite);

const evalQueen =
    [
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

const kingEvalWhite = [

    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
    [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];
const kingEvalBlack = reverseArray(kingEvalWhite);

const endGameKingEvalWhite = [
    [-5.0, -4.0, -3.0,-2.0,-2.0, -3.0, -4.0, -5.0],
    [-3.0, -2.0, -1.0, 0.0, 0.0, -1.0, -2.0, -3.0],
    [-3.0, -1.0,  2.0, 3.0, 3.0,  2.0, -1.0, -3.0],
    [-3.0, -1.0,  3.0, 4.0, 4.0,  3.0, -1.0, -3.0],
    [-3.0, -1.0,  3.0, 4.0, 4.0,  3.0, -1.0, -3.0],
    [-3.0, -1.0,  2.0, 3.0, 3.0,  2.0, -1.0, -3.0],
    [-3.0, -3.0,  0.0, 0.0, 0.0,  0.0, -3.0, -3.0],
    [-5.0, -3.0, -3.0,-3.0,-3.0, -3.0, -3.0, -5.0]
];

const endGameKingEvalBlack = reverseArray(endGameKingEvalWhite);

function getPieceValue(piece, x, y) {
    if (piece === null) {
        return 0;
    }
    function getAbsoluteValue(piece, isWhite, x ,y, eg) {
        if (piece === 'P') {
            return 10 + ( isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x] );
        } else if (piece === 'R') {
            return 50 + ( isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x] );
        } else if (piece === 'N') {
            return 30 + knightEval[y][x];
        } else if (piece === 'B') {
            return 35 + ( isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x] );
        } else if (piece === 'Q') {
            return 90 + evalQueen[y][x];
        } else if (piece === 'K') {
            if(eg == false) return 900 + ( isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x] );
            if(eg == true) return 900 + ( isWhite ? endGameKingEvalWhite[y][x] : endGameKingEvalBlack[y][x]);
            
        }
    };
    let absoluteValue = getAbsoluteValue(piece.notation, piece.color, x ,y, false);
    let absoluteEgValue = getAbsoluteValue(piece.notation, piece.color, x ,y, true);
    return piece.color? [absoluteValue, absoluteEgValue] : [-absoluteValue, -absoluteEgValue];
}
*/