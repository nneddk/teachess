
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
    console.log(availableMoves);
    gameEval(chessBoard.getBoardData(), turnCheck, availableMoves);
    /*
    let openingMove = openingCheck(pgn);
    if(openingMove){
        return openingMove;
    }*/
    return false;
}
export function gameEval(board, turnCheck){
    //first get board positions
    //let currentBoard = getBoardPosition(board);
    console.log('simple eval',simpleEval(board, turnCheck));
    console.log('pesto eval', pestoEval(board, turnCheck));
    return simpleEval(board, turnCheck);
    
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
//simple Eval
function simpleEval(boards, turnCheck){
    if(!boards) return;
    let blackBoard = boards.blackPieces;
    let whiteBoard = boards.whitePieces;
    let whiteEvalTotal = 0;
    let blackEvalTotal = 0;
    function getEval(x, y, piece, flip){
        const pawnSquareTable = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5,  5, 10, 25, 25, 10,  5,  5],
            [0,  0,  0, 20, 20,  0,  0,  0],
            [5, -5,-10,  0,  0,-10, -5,  5],
            [5, 10, 10,-20,-20, 10, 10,  5],
            [0,  0,  0,  0,  0,  0,  0,  0]
        ];
        const knightSquareTable = [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ];
        const bishopSquareTable = [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5, 10, 10,  5,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10, 10, 10, 10, 10, 10, 10,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20]
    
        ];
        const rookSquareTable = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [5, 10, 10, 10, 10, 10, 10,  5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [0,  0,  0,  5,  5,  0,  0,  0]
        ];
        const queenSquareTable = [
            [-20,-10,-10, -5, -5,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [ -5,  0,  5,  5,  5,  5,  0, -5],
            [  0,  0,  5,  5,  5,  5,  0, -5],
            [-10,  5,  5,  5,  5,  5,  0,-10],
            [-10,  0,  5,  0,  0,  0,  0,-10],
            [-20,-10,-10, -5, -5,-10,-10,-20]
        ];
        const kingSquareTable = [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [ 20, 20,  0,  0,  0,  0, 20, 20],
            [ 20, 30, 10,  0,  0, 10, 30, 20]
        ];
        //will see if i can use this somehow
        const kingEGSquareTable = [
            [-50,-40,-30,-20,-20,-30,-40,-50],
            [-30,-20,-10,  0,  0,-10,-20,-30],
            [-30,-10, 20, 30, 30, 20,-10,-30],
            [-30,-10, 30, 40, 40, 30,-10,-30],
            [-30,-10, 30, 40, 40, 30,-10,-30],
            [-30,-10, 20, 30, 30, 20,-10,-30],
            [-30,-30,  0,  0,  0,  0,-30,-30],
            [-50,-30,-30,-30,-30,-30,-30,-50]        
        ];
        const pieceSquareTable = [
            pawnSquareTable,
            knightSquareTable,
            bishopSquareTable,
            rookSquareTable,
            queenSquareTable,
            kingSquareTable
        ];
        const pieceValue = [10,32,33,50,90,900];
        let pc;
        switch (piece){
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
            case '_':
                return 0;
            default:
                break;
        }
        if (flip){
            let mgFlippedTable = [];
            for(let i = 0; i<8;i++){
                let mgTempTable = [];
                let egTempTable = [];
                for (let j = 7; j>=0; j--){
                    mgTempTable.push(pieceSquareTable[pc][i][j]);

                }
                mgFlippedTable.push(mgTempTable);

            }
            blackEvalTotal += mgFlippedTable[x][y] + pieceValue[pc];
        }else{
            whiteEvalTotal += pieceSquareTable[pc][x][y] + pieceValue[pc];
        }

    }
    for (let i = 0; i<8; i++){
        for(let j = 0; j<8; j++){
            getEval(i, j, blackBoard[i][j], true);
            getEval(i, j, whiteBoard[i][j], false);
            
        }
    }
    if(turnCheck){
        return whiteEvalTotal;
    }else if (!turnCheck){
        return blackEvalTotal;
    }
    

}
//pestoEval
function pestoEval(boards, turnCheck){
    if(!boards) return;
    //console.log(board);
    //mirrored PST Tables must be implemented for black (more on this shortly)
    //Using PeSTO's Evaluation Function for this.
    //gonna simplify a lot of it as well, to help with minimax evaluation
    let blackBoard = boards.blackPieces;
    let whiteBoard = boards.whitePieces;
    let gamePhase = 0;

    let mgBlackEval = 0;
    let mgWhiteEval = 0;
    let mgEvalTotal = 0;

    let egBlackEval = 0;
    let egWhiteEval = 0;
    let egEvalTotal = 0;
    //game phase for tapered evaluation
    function getEval(x, y, piece, flip){
        //mg = middlegame, eg = endgame  
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

                eg: [[0,   0,   0,   0,   0,   0,   0,   0],
                     [178, 173, 158, 134, 147, 132, 165, 187],
                     [94, 100,  85,  67,  56,  53,  82,  84],
                     [32,  24,  13,   5,  -2,   4,  17,  17],
                     [13,   9,  -3,  -7,  -7,  -8,   3,  -1],
                     [4,   7,  -6,   1,   0,  -5,  -1,  -8],
                     [13,   8,   8,  10,  13,   0,   2,  -7],
                     [0,   0,   0,   0,   0,   0,   0,   0]],
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
                
                eg: [[-58, -38, -13, -28, -31, -27, -63, -99],
                     [-25,  -8, -25,  -2,  -9, -25, -24, -52],
                     [-24, -20,  10,   9,  -1,  -9, -19, -41],
                     [-17,   3,  22,  22,  22,  11,   8, -18],
                     [-18,  -6,  16,  25,  16,  17,   4, -18],
                     [-23,  -3,  -1,  15,  10,  -3, -20, -22],
                     [-42, -20, -10,  -5,  -2, -20, -23, -44],
                     [-29, -51, -23, -15, -22, -18, -50, -64]],
            },
            bishopPST:{
                mg: [[-29,   4, -82, -37, -25, -42,   7,  -8],
                     [-26,  16, -18, -13,  30,  59,  18, -47],
                     [-16,  37,  43,  40,  35,  50,  37,  -2],
                     [ -4,   5,  19,  50,  37,  37,   7,  -2],
                     [ -6,  13,  13,  26,  34,  12,  10,   4],
                     [  0,  15,  15,  15,  14,  27,  18,  10],
                     [  4,  15,  16,   0,   7,  21,  33,   1],
                     [-33,  -3, -14, -21, -13, -12, -39, -21]],

                eg: [[-14, -21, -11,  -8, -7,  -9, -17, -24],
                     [-8,  -4,   7, -12, -3, -13,  -4, -14],
                     [2,  -8,   0,  -1, -2,   6,   0,   4],
                     [-3,   9,  12,   9, 14,  10,   3,   2],
                     [-6,   3,  13,  19,  7,  10,  -3,  -9],
                     [-12,  -3,   8,  10, 13,   3,  -7, -15],
                     [-14, -18,  -7,  -1,  4,  -9, -15, -27],
                     [-23,  -9, -23,  -5, -9, -16,  -5, -17]],
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
                
                eg: [[32,  42,  32,  51, 63,  9,  31,  43],
                     [27,  32,  58,  62, 80, 67,  26,  44],
                     [-5,  19,  26,  36, 17, 45,  61,  16],
                     [-24, -11,   7,  26, 24, 35,  -8, -20],
                     [-36, -26, -12,  -1,  9, -7,   6, -23],
                     [-45, -25, -16, -17,  3,  0,  -5, -33],
                     [-44, -16, -20,  -9, -1, 11,  -6, -71],
                     [-19, -13,   1,  17, 16,  7, -37, -26]]
            },
            queenPST:{
                mg: [[-28,   0,  29,  12,  59,  44,  43,  45],
                     [-24, -39,  -5,   1, -16,  57,  28,  54],
                     [-13, -17,   7,   8,  29,  56,  47,  57],
                     [-27, -27, -16, -16,  -1,  17,  -2,   1],
                     [ -9, -26,  -9, -10,  -2,  -4,   3,  -3],
                     [-14,   2, -11,  -2,  -5,   2,  14,   5],
                     [-35,  -8,  11,   2,   8,  15,  -3,   1],
                     [ -1, -18,  -9,  10, -15, -25, -31, -50]],
                
                eg: [[-28,   0,  29,  12,  59,  44,  43,  45],
                     [-24, -39,  -5,   1, -16,  57,  28,  54],
                     [-13, -17,   7,   8,  29,  56,  47,  57],
                     [-27, -27, -16, -16,  -1,  17,  -2,   1],
                     [ -9, -26,  -9, -10,  -2,  -4,   3,  -3],
                     [-14,   2, -11,  -2,  -5,   2,  14,   5],
                     [-35,  -8,  11,   2,   8,  15,  -3,   1],
                     [-1, -18,  -9,  10, -15, -25, -31, -50]]
            },
            kingPST:{
                mg: [[-65,  23,  16, -15, -56, -34,   2,  13],
                     [29,  -1, -20,  -7,  -8,  -4, -38, -29],
                     [-9,  24,   2, -16, -20,   6,  22, -22],
                     [-17, -20, -12, -27, -30, -25, -14, -36],
                     [-49,  -1, -27, -39, -46, -44, -33, -51],
                     [-14, -14, -22, -46, -44, -30, -15, -27],
                     [ 1,   7,  -8, -64, -43, -16,   9,   8],
                     [-15,  36,  12, -54,   8, -28,  24,  14]],

                eg: [[-74, -35, -18, -18, -11,  15,   4, -17],
                     [-12,  17,  14,  17,  17,  38,  23,  11],
                     [10,  17,  23,  15,  20,  45,  44,  13],
                     [-8,  22,  24,  27,  26,  33,  26,   3],
                     [-18,  -4,  21,  24,  27,  23,   9, -11],
                     [-19,  -3,  11,  21,  23,  16,   7,  -9],
                     [-27, -11,   4,  13,  14,   4,  -5, -17],
                     [-53, -34, -21, -11, -28, -14, -24, -43]]
            }
    
        };

        const mgSquareTable = [
            pieceSquareTable.pawnPST.mg,
            pieceSquareTable.knightPST.mg,
            pieceSquareTable.bishopPST.mg,
            pieceSquareTable.rookPST.mg,
            pieceSquareTable.queenPST.mg,
            pieceSquareTable.kingPST.mg
        ];
        const egSquareTable = [
            pieceSquareTable.pawnPST.eg,
            pieceSquareTable.knightPST.eg,
            pieceSquareTable.bishopPST.eg,
            pieceSquareTable.rookPST.eg,
            pieceSquareTable.queenPST.eg,
            pieceSquareTable.kingPST.eg
        ];

        const mgPieceValue = [82, 337, 365, 477, 1025, 0];
        const egPieceValue = [94, 281, 297, 512, 936, 0];
        const gamePhaseInc = [0,1,1,2,4,0];
        let pc;
        switch (piece){
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
            case '_':
                return 0;
            default:
                break;
        }
        //flips tables for black position
        if (flip){
            let mgFlippedTable = [];
            let egFlippedTable = [];
            for(let i = 0; i<8;i++){
                let mgTempTable = [];
                let egTempTable = [];
                for (let j = 7; j>=0; j--){
                    mgTempTable.push(mgSquareTable[pc][i][j]);
                    egTempTable.push(egSquareTable[pc][i][j]);
                }
                mgFlippedTable.push(mgTempTable);
                egFlippedTable.push(egTempTable);
            }
            mgBlackEval += mgFlippedTable[x][y] + mgPieceValue[pc];
            egBlackEval += egFlippedTable[x][y] + egPieceValue[pc];
        }else{
            mgWhiteEval += mgSquareTable[pc][x][y] + mgPieceValue[pc];
            egWhiteEval += egSquareTable[pc][x][y] + egPieceValue[pc];
        }
        gamePhase += gamePhaseInc[pc];

    }
    for (let i = 0; i<8; i++){
        for(let j = 0; j<8; j++){
            getEval(i, j, blackBoard[i][j], true);
            getEval(i, j, whiteBoard[i][j], false);
            
        }
    }
    let side = (turnCheck?0:1);
    let mg = [
        mgWhiteEval,
        mgBlackEval,
    ]
    let eg = [
        egWhiteEval,
        egBlackEval,
    ]
    //flips depending on whose side it is to move
    //let mgScore = (mg[side] - mg[side^1]);
    //let egScore = (eg[side] - eg[side^1]);
    //let mgScore = (mg[0] - mg[1]);
    //let egScore = (eg[0] - eg[1])

    //tapering evaluation between middlegame and endgame boards
    let mgPhase = gamePhase;
    if(mgPhase > 24) mgPhase = 24;
    let egPhase = 24 - mgPhase;

    //let evalScore = (((mgScore * mgPhase) + (egScore * egPhase)) / 24);
    //console.log(evalScore);
    let whiteEval = Math.floor((((mg[0] * mgPhase) + (eg[0] * egPhase)) /24));
    let blackEval =  Math.floor((((mg[1] * mgPhase) + (eg[1] * egPhase)) /24));
    if(turnCheck){
        return whiteEval;
    }else if (!turnCheck){
        return blackEval;
    }
    return 0;
}

export function getBoardPosition(data){
    //this builds the template for piece square tables, maybe temporary if i find an easier way to calculate it
    //returns if data is empty
    if (!data) return;
    let boardData = data;
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
    //flips black perspective
    boardArray.blackPieces = boardFlip(boardArray.blackPieces);

    //return object
    return boardArray;
}
/*IGNORE BELOW
let mg_value = [ 82, 337, 365, 477, 1025,  0];
let eg_value = [ 94, 281, 297, 512,  936,  0];
let gamephaseInc = [0,0,1,1,1,1,2,2,4,4,0,0];

function init_tables()
{
    let pc, p, sq;
    for (p = PAWN; p <= PAWN; p++) {
        for (sq = 0; sq < 64; sq++) {
            mg_table[pc][sq] = mg_value[p] + mg_pesto_table[p][sq];
            eg_table[pc][sq] = eg_value[p] + eg_pesto_table[p][sq];
            mg_table[pc+1][sq] = mg_value[p] + mg_pesto_table[p][FLIP(sq)];
            eg_table[pc+1][sq] = eg_value[p] + eg_pesto_table[p][FLIP(sq)];
        }

    }
}
init_tables();
function evalBoard(){
    let mg = [0,0];
    let eg = [0,0];
    let gamePhase = 0;
    for (let sq = 0; sq < 64; ++sq) {
        let pc = board[sq];
        if (pc != EMPTY) {
            mg[PCOLOR(pc)] += mg_table[pc][sq];
            eg[PCOLOR(pc)] += eg_table[pc][sq];
            gamePhase += gamephaseInc[pc];
        }
    }
    //let mgScore = mg[side2move] - mg[OTHER(side2move)];
    let mgScore = mg[side2move]
    let egScore = eg[side2move] - eg[OTHER(side2move)];
    let mgPhase = gamePhase;
    if (mgPhase > 24) mgPhase = 24; 
    let egPhase = 24 - mgPhase;
    return (mgScore * mgPhase + egScore * egPhase) / 24;
}
evalBoard()
function viewTable(table){
    let completeTable = [];
    let tempArray = []
    for (let i = 0; i<table.length; i++){
        tempArray.push(table[i]);
        if(tempArray.length == 8){
            completeTable.push(tempArray);
            tempArray = [];
        }
    }
    console.log(completeTable);
}
*/

