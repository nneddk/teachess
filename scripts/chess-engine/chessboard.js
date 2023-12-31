import { hideDisplay } from "./toolbar.js";
import { setOpenings,gameEval, getNextMove } from "./ai.js";
import { playAnimation } from "./animation.js"
import { predictWhite, predictBlack } from "../svm/svmTrain.js";
const aiBtn = document.getElementById("ai-btn");
//opening data
let openingData = '';
async function translate(){
    //[eco:eco, name:name, pgn:pgn]
    await fetch('./assets/openings/main.txt')
    .then((response)=>response.text())
    .then((data)=>{
        openingData = data;
    });
    openingData = openingData.split('\n');
    for(let i = 0; i<openingData.length; i++){
        openingData[i] = openingData[i].split('\t');
        let tempData = {
            eco:openingData[i][0],
            name:openingData[i][1],
            pgn:openingData[i][2].replace(/(\r)/gm, '')
        }
        openingData[i] = tempData;
        
    }
    setOpenings(openingData);
}
translate();
const gameBoard = document.getElementById("game-board");
const indicator = document.getElementById("indicator");
const winIndicator = document.getElementById('win-indicator');
const turnIndicatorPic = document.getElementById('turn-indicator-pic');
const openingIndicator = document.getElementById('opening-indicator');
const moveHistoryIndicator = document.getElementById('move-history');
export const chessBoard =(()=>{
    //this sets which turn the ai takes over (black is 0 and white is 1);
    let aiTurn = 0;
    let aiOn = false;
    let moveIndex = -1;
    let moveHistory = [];
    let gameOver = false;
    let notations = 1;
    let redoData = [];
    let availableMoves = {
        black:[],
        white:[]
    };
    let chessBoardData = [];
    let movingData = {
        color: null,
        hasMoved: null,
        id: null,
        newCoords: {
            x:null,
            y:null
        },
        oldCoords: {
            x: null,
            y: null
        },
        piece: null
    };
    let moveDetail = {
        color: null,
        piece: null,
        moves : null,
        tile:null,
        moveNotation: {
            new:null,
            old:null,
        },
        oldCoords: [],
        newCoords:[],
        action: {
            eat: false,
            castle: false,
            enpass: false,
            checking: false,
            mate: false,
            promote: false,
        }
    }
    let aiSide = 0;
    let aiEnabled = 2;
    //1 for white, 0 for black;
    let turnCheck = true;
    const piece = (()=>{
        let enPassantData = {
            color:null,
            target:{
                x:null,
                y:null
            },
            x: null,
            y: null
        };
        let pieceCounter = 0;
        function pieceMaker(x, y, id, color, hasMoved, quick){
            let pieceData = {
                color: color,
                hasMoved: (hasMoved == 0?0:hasMoved),
                id:id,
                notation: setNotation(id),
                x:x,
                y:y,  
            };
            if(id == 'king'){
                setKing(color, x, y);
            }
            chessBoardData[y][x].pieceData = pieceData;
            chessBoardData[y][x].isEmpty = false;
            if(quick) return;
            //only create DOM elements when not in quick mode
            let pieceDiv = document.createElement("div");
                pieceDiv.classList.add("piece");
                pieceDiv.classList.add((color?"white":"black")+"-"+id);
                
                
                pieceDiv.setAttribute('draggable', true);
               
                pieceDiv.ondragstart = (e) =>{
                    e.dataTransfer.setDragImage(new Image(),0,0);
                    if(chessBoardData[y][x].pieceData != null && chessBoardData[y][x].pieceData.color == turnCheck && !gameOver){
                        e.stopPropagation();  
                        clearInfo();
                        refreshData();
                        setData();
                        getThreatData(id, pieceData.x, pieceData.y, pieceData.color,true);
                    }else{
                        if(!gameOver) indicator.textContent = "not your turn!";
      
                    }
                } 
                pieceDiv.onmouseenter = (e) =>{
                    e.preventDefault();
                    if((!chessBoardData[y][x].isEmpty) && turnCheck != color && movingData.id != null){
                    }
                }
                pieceDiv.onmouseleave = (e) =>{
                    e.preventDefault();
                    if((!chessBoardData[y][x].isEmpty) && turnCheck != color && movingData.id != null){
    
                    }
                }
                pieceDiv.ondragenter = (e) =>{
                    e.preventDefault();
                    if(!chessBoardData[y][x].isEmpty && chessBoardData[y][x].pieceData.color == !movingData.color){
                        pieceDiv.style.opacity = '0.8';
                    }
                }
                pieceDiv.ondragleave = (e) =>{
                    e.preventDefault();
                    if(!chessBoardData[y][x].isEmpty && chessBoardData[y][x].pieceData.color == !movingData.color){
                        pieceDiv.style.opacity = '1';
                        
                    }
                    
                }
                pieceDiv.ondragend = (e) =>{
                    e.preventDefault;
    
                }
    
                pieceDiv.onclick=(e) =>{
                    if(chessBoardData[y][x].pieceData.color == turnCheck && !gameOver){
                        e.stopPropagation();  
                        if(movingData.piece == null){
                            setData();
                            getThreatData(id, pieceData.x, pieceData.y, pieceData.color,true);
                        } else{
    
                            clearInfo();
                            refreshData();
                        }
                    }else{
                        if(!gameOver) indicator.textContent = "not your turn!";
    
                    }
                }
                chessBoardData[y][x].tileLocation.append(pieceDiv);
                function setData(){
                    movingData.id = id;
                    movingData.piece = pieceDiv;
                    movingData.oldCoords.x = pieceData.x;
                    movingData.oldCoords.y = pieceData.y;
                    movingData.color = pieceData.color;
                    movingData.hasMoved = pieceData.hasMoved;
                    if(!gameOver) indicator.textContent = chessBoardData[pieceData.y][pieceData.x].notation+' '+id;
                }

            
           

            
        }
        function setNotation(id){
            switch (id){
                case 'pawn':
                    return 'P';
                case 'knight':
                    return 'N';
                case 'king':
                    return 'K';
                case 'bishop':
                    return 'B';
                case 'queen':
                    return 'Q';
                case 'rook':
                    return 'R';
                default:
                    break;
            }
        }
        function pieceUnmaker(x, y, quick){
            
            chessBoardData[y][x].isEmpty = true;
            chessBoardData[y][x].pieceData = null;
            if (quick) return;
            chessBoardData[y][x].tileLocation.removeChild(chessBoardData[y][x].tileLocation.lastChild);
        } 
        function getMoveData (id, oldCoords, newCoords, color,hasMoved){
            if(gameOver) return;     
            let allowMove = false;
            let oldX = oldCoords[0], oldY = oldCoords[1];
            let newX = newCoords[0], newY = newCoords[1];
            switch (id){
                case 'pawn':
                    //only move up OR down depending on the color of the piece
                    if(oldX == newX && (color?oldY-1:oldY+1) == newY){
                        allowMove = true;
                        if(chessBoardData[newY][newX].isEmpty == false){
                            allowMove = false;
                        } 
                    }
                    if((oldX + 1 == newX || oldX - 1 == newX ) && (color?(oldY - 1 == newY):(oldY + 1 == newY))){
                        if(eatChecker(newX,newY,color)) allowMove = true;
                        if(newX == enPassantData.x && newY == enPassantData.y){
                            allowMove = true;
                            // /refreshData();
                        }
                    }
                    if (hasMoved == 0){
                        if(oldX == newX && (color?oldY-2:oldY+2) == newY){
                            allowMove = true;
    
                            if (oldY < newY){
                                for(let y = oldY; y < newY; y++){
                                    if(y == oldY) continue;
                                    if(chessBoardData[y][newX].isEmpty == false) allowMove = false;
                                }
                                enPassant(oldX, newX, oldY +1, newY ,color);
                                
                            }
                            if (oldY > newY){
                                for(let y = oldY; y > newY; y--){
                                    if(y == oldY) continue;
                                    if(chessBoardData[y][newX].isEmpty == false) allowMove = false;
                                }
                                enPassant(oldX, newX, oldY -1, newY ,color);
                            } 
                        }
                    }
                    return allowMove;
                case 'rook':
                    if((oldX == newX && oldY != newY)||(oldX != newX && oldY == newY)){
                        if((oldX != newX && oldY == newY)){
                            if(chessBoardData[newY][newX].isEmpty || eatChecker(newX, newY, color)){
                                allowMove = validateMove.horizontalChecker(oldX, newX, oldY);
                            }
                            
                        }
                        if((oldX == newX && oldY != newY)){
                            if(chessBoardData[newY][newX].isEmpty || eatChecker(newX, newY, color)){
                                allowMove = validateMove.verticalChecker(oldY, newY, oldX);  
                            }
                            
                        }
                    }
                    return allowMove;
                case 'bishop':
                    if(newX > oldX){
                        for (let n = 1; n<=(newX - oldX); n++){
                            if  (newX == oldX + n && newY == oldY - n) {
                                if(chessBoardData[newY][newX].isEmpty || eatChecker(newX, newY, color)){
                                    allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                                }
                            }
                            if  (newX == oldX + n && newY == oldY + n){
                                if(chessBoardData[newY][newX].isEmpty || eatChecker(newX, newY, color)){
                                    allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                                }
                                
                            } 
                        }
                    }
                    if(newX < oldX){
                        for (let n = 1; n<=(oldX - newX); n++){
                            if  (newX == oldX - n && newY == oldY + n) {
                                if(chessBoardData[newY][newX].isEmpty || eatChecker(newX, newY, color)){
                                    allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                                }
                            }
                            if  (newX == oldX - n && newY == oldY - n){
                                if(chessBoardData[newY][newX].isEmpty || eatChecker(newX, newY, color)){
                                    allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                                }
                            } 
                        }
                    }
                    return allowMove;
                case 'knight':
                    if(oldY == newY + 2||oldY == newY - 2){
                        if(oldX == newX + 1||oldX == newX - 1) allowMove = validateMove.horseChecker(newX,newY,color);
                    }
                    if(oldX == newX + 2 ||oldX == newX - 2){
                        if(oldY == newY + 1||oldY == newY - 1) allowMove = validateMove.horseChecker(newX,newY,color);
                    }
                    return allowMove;
                case 'queen':
                    if((oldX == newX && oldY != newY)||(oldX != newX && oldY == newY)){
                        if((oldX != newX && oldY == newY)){
                            if(chessBoardData[newY][newX].isEmpty || eatChecker(newX, newY, color)){
                                allowMove = validateMove.horizontalChecker(oldX, newX, oldY);
                            }
                            
                        }
                        if((oldX == newX && oldY != newY)){
                            if(chessBoardData[newY][newX].isEmpty || eatChecker(newX, newY, color)){
                                allowMove = validateMove.verticalChecker(oldY, newY, oldX);  
                            }
                            
                        }
                    }
                    if(newX > oldX){
                        for (let n = 1; n<=(newX - oldX); n++){
                            if  (newX == oldX + n && newY == oldY - n) {
                                if(chessBoardData[newY][newX].isEmpty || eatChecker(newX, newY, color)){
                                    allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                                }
                            }
                            if  (newX == oldX + n && newY == oldY + n){
                                if(chessBoardData[newY][newX].isEmpty || eatChecker(newX, newY, color)){
                                    allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                                }
                                
                            } 
                        }
                    }
                    if(newX < oldX){
                        for (let n = 1; n<=(oldX - newX); n++){
                            if  (newX == oldX - n && newY == oldY + n) {
                                if(chessBoardData[newY][newX].isEmpty || eatChecker(newX, newY, color)){
                                    allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                                }
                            }
                            if  (newX == oldX - n && newY == oldY - n){
                                if(chessBoardData[newY][newX].isEmpty || eatChecker(newX, newY, color)){
                                    allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                                }
                            } 
                        }
                    }
                    return allowMove;              
                case 'king':
                    if((oldX == newX && (oldY == newY + 1||oldY == newY - 1))
                    ||((oldX == newX + 1 || oldX == newX - 1) && oldY == newY)){
                        allowMove = validateMove.kingChecker(newX,newY,color);
                    }
                    if((oldX + 1 == newX && (oldY - 1 == newY || oldY + 1 == newY))
                    ||(oldX - 1 == newX && (oldY -1 == newY || oldY +1 == newY))){
                        allowMove = validateMove.kingChecker(newX,newY,color);
                    }
                    //castling logic
                    //could use a refactor
                    if(hasMoved == 0 && validateMove.kingChecker(newX,newY,color) && validateMove.horizontalChecker(oldX,newX,oldY) &&
                     ((newX == oldX + 2 && oldY == newY)||(newX == oldX - 2 && oldY == newY)) 
                     && (color?chessBoardData[oldY][oldX].threatData.blackCheck.counter == 0:chessBoardData[oldY][oldX].threatData.whiteCheck.counter == 0)
                        &&(color?chessBoardData[newY][newX].threatData.blackCheck.counter == 0:chessBoardData[newY][newX].threatData.whiteCheck.counter == 0)){

                        if(chessBoardData[oldY][oldX + 3].pieceData != null &&chessBoardData[oldY][oldX + 3].pieceData.id == 'rook'
                        && (color?chessBoardData[oldY][oldX + 1].threatData.blackCheck.counter == 0:chessBoardData[oldY][oldX + 1].threatData.whiteCheck.counter == 0)){
                            let rightRook = chessBoardData[oldY][oldX + 3].pieceData;
                            if((newX == oldX + 2 && oldY == newY)
                            &&(rightRook.color == color)
                            &&(rightRook.hasMoved == 0)){
                                let tempAi = aiOn;
                                moveDetail.action.castle = true;
                                moveDetail.moves = 1;
                                aiOn = false;
                                movePiece([oldX,oldY],[newX,newY],id,color, hasMoved, false, true);
                                moveDetail.action.castle = true;
                                movePiece([oldX + 3, oldY],[oldX + 1, oldY], rightRook.id, rightRook.color, hasMoved, false, false, true);
                                if(!gameOver) indicator.textContent = chessBoardData[oldY][oldX].notation+' '+
                                 'king'+' '+' -> '+chessBoardData[oldY][oldX+2].notation;
                                turnCheck = !turnCheck;
                                refreshData();
                                aiOn = tempAi;
                                if(turnCheck == aiTurn && aiOn) ai(aiOn);
                                

                            }
                        }
                        if(chessBoardData[oldY][oldX - 4].pieceData != null && chessBoardData[oldY][oldX - 4].pieceData.id == 'rook'
                        && (color?chessBoardData[oldY][oldX - 1].threatData.blackCheck.counter == 0:chessBoardData[oldY][oldX - 1].threatData.whiteCheck.counter == 0)){
                            let leftRook = chessBoardData[oldY][oldX - 4].pieceData;
                            if((newX == oldX - 2 && oldY == newY)
                            &&(leftRook.color == color)
                            &&(leftRook.hasMoved == 0)){
                                let tempAi = aiOn;
                                moveDetail.action.castle = true;
                                moveDetail.moves = 1;
                                aiOn = false;
                                movePiece([oldX,oldY],[newX,newY],id,color, hasMoved, false, true);
                                moveDetail.action.castle = true;
                                movePiece([oldX - 4, oldY],[oldX - 1, oldY], leftRook.id, leftRook.color, hasMoved, false, false. true);
                                if(!gameOver) indicator.textContent = chessBoardData[oldY][oldX].notation+' '+
                                'king'+' '+' -> '+chessBoardData[oldY][oldX-2].notation;
                                turnCheck = !turnCheck;
                                refreshData();
                                aiOn = tempAi;
                                if(turnCheck == aiTurn && aiOn) ai(aiOn);
                            }
                        }   
                    }
                    return allowMove;
                    default:
                        return allowMove;
                }
        }
        function getThreatData (id, x, y, color, highlight){
            switch(id){
                case 'pawn':
                    otherThreatData(1,1);
                    break;    
                case 'rook':
                    verticalThreatData(0,7);
                    horizontalThreatData(0,7);
                    break;
                case 'bishop':
                    diagonalThreatData();
                    break;
                case 'queen':
                    verticalThreatData(0,7);
                    horizontalThreatData(0,7);
                    diagonalThreatData();
                    break;
                case 'knight':
                    otherThreatData(1,2);
                    break;
                case 'king':
                    otherThreatData(1,1);
                    verticalThreatData((y - 1 < 0?y:y - 1),(y + 1 > 7?y: y + 1));
                    horizontalThreatData((x - 1 < 0?x:x - 1),(x + 1 > 7?x: x + 1));
                    break;
                default:
                    return 'error!';
        
            }
            function changeData(boardData){
                function highlightMoves(x, y, color){
                    if(chessBoardData[y][x].isEmpty || chessBoardData[y][x].pieceData.color == !color){
                        chessBoardData[y][x].tileLocation.classList.add('highlighted');
                    } 
                }
                if(highlight){
                    if (id == 'pawn'){
                        if(color){
                            if((y - 1)>=0){
                                if(chessBoardData[y-1][x].isEmpty){
                                    highlightMoves(x, y - 1,color);
                                    if((y - 2) >= 0){
                                        if(chessBoardData[y-2][x].isEmpty && chessBoardData[y][x].pieceData.hasMoved == 0){
                                            highlightMoves(x, y - 2,color);
                                            }
                                    }
                                }
                                if ((!boardData.isEmpty && boardData.pieceData.color == !color)){
                                    highlightMoves(boardData.x,boardData.y,color);
                                }
                                if((boardData.x == enPassantData.x) && (boardData.y == enPassantData.y)){
                                    highlightMoves(boardData.x, boardData.y, color);
                                    //highlightMoves(enPassantData.target.x, enPassantData.target.y, color);
                                }
                                /*
                                if ((x-1>=0) &&(((!chessBoardData[y-1][x-1].isEmpty && chessBoardData[y-1][x-1].color != color))
                                ||(((x-1) == enPassantData.x) && ((y-1) == enPassantData.y)&&color != enPassantData.color))){
                                    highlightMoves(x-1,y-1,color);
                                }
                                if ((x+1<=7) &&(((!chessBoardData[y-1][x+1].isEmpty && chessBoardData[y-1][x+1].color != color))
                                ||(((x+1) == enPassantData.x) && ((y-1) == enPassantData.y)))){
                                    highlightMoves(x+1,y-1,color);
                                }*/
                            }  
                        }
                        if(!color){
                            if((y + 1)<=7){
                                if(chessBoardData[y+1][x].isEmpty){
                                    highlightMoves(x, y + 1,color);
                                    if((y + 2) <= 7){
                                        if(chessBoardData[y+2][x].isEmpty && chessBoardData[y][x].pieceData.hasMoved == 0){
                                            highlightMoves(x, y + 2,color);
                                            }
                                    }
                                }
                                if ((!boardData.isEmpty && boardData.pieceData.color == !color)){
                                    highlightMoves(boardData.x,boardData.y,color);
                                }
                                if((boardData.x == enPassantData.x) && (boardData.y == enPassantData.y)){
                                    highlightMoves(boardData.x, boardData.y, color);
                                    //highlightMoves(enPassantData.target.x, enPassantData.target.y, color);
                                }
                                /*
                                if ((x-1>=0) &&(((!chessBoardData[y+1][x-1].isEmpty && chessBoardData[y+1][x-1].color != color))
                                ||(((x-1) == enPassantData.x) && ((y+1) == enPassantData.y)&&color != enPassantData.color))){
                                    highlightMoves(x-1,y+1,color);
                                }
                                if ((x+1<=7) &&(((!chessBoardData[y+1][x+1].isEmpty && chessBoardData[y+1][x+1].color != color))
                                ||(((x+1) == enPassantData.x) && ((y+1) == enPassantData.y)))){
                                    highlightMoves(x+1,y+1,color);
                                }*/
                            }
                        }
                        
                        
        
                    }else{
                        highlightMoves(boardData.x, boardData.y,color);
                        if(id == 'king' && chessBoardData[y][x].pieceData.hasMoved == 0){
                            if(x + 3 <= 7){   
                                if(!chessBoardData[y][x+3].isEmpty && chessBoardData[y][x+3].pieceData.hasMoved == 0){
                                    if(chessBoardData[y][x+3].pieceData.id == 'rook' && chessBoardData[y][x+3].pieceData.color == color){
                                        if((color?chessBoardData[y][x+1].threatData.blackCheck.counter == 0:chessBoardData[y][x+1].threatData.whiteCheck.counter == 0 )
                                            && (color?chessBoardData[y][x+2].threatData.blackCheck.counter == 0:chessBoardData[y][x+2].threatData.whiteCheck.counter == 0)){
                                                if(chessBoardData[y][x+1].isEmpty && chessBoardData[y][x+2].isEmpty){
                                                    highlightMoves((x + 2), y, color);
                                                }
                                            
                                            }
                                    }
                                }
                            }
                            if(x - 4 >= 0){
                                if(!chessBoardData[y][x-4].isEmpty && chessBoardData[y][x - 4].pieceData.hasMoved == 0){
                                    if(chessBoardData[y][x -4].pieceData.id == 'rook' && chessBoardData[y][x - 4].pieceData.color == color){
                                        if((color?chessBoardData[y][x-1].threatData.blackCheck.counter == 0:chessBoardData[y][x-1].threatData.whiteCheck.counter == 0 )
                                            && (color?chessBoardData[y][x-2].threatData.blackCheck.counter == 0:chessBoardData[y][x-2].threatData.whiteCheck.counter == 0)){
                                                if(chessBoardData[y][x-1].isEmpty && chessBoardData[y][x-2].isEmpty && chessBoardData[y][x-3].isEmpty){
                                                    highlightMoves((x - 2), y, color);
                                                }
                                            
                                            }
                                    }
        
                                }
                            }
                        }
                    }
                    
                }else{
                    //DO NOT REMOVE, VERY IMPORTANT FOR PGN CHECKING
                    if(color){
                        boardData.threatData.whiteCheck.counter++;
                        
                        boardData.threatData.whiteCheck.threats.push(chessBoardData[y][x].pieceData.id);
                        boardData.threatData.whiteCheck.coords.x.push(chessBoardData[y][x].pieceData.x);
                        boardData.threatData.whiteCheck.coords.y.push(chessBoardData[y][x].pieceData.y);
                        
                    }
                    if(!color){
                        boardData.threatData.blackCheck.counter++;
                        
                        boardData.threatData.blackCheck.threats.push(chessBoardData[y][x].pieceData.id);
                        boardData.threatData.blackCheck.coords.x.push(chessBoardData[y][x].pieceData.x);
                        boardData.threatData.blackCheck.coords.y.push(chessBoardData[y][x].pieceData.y);
                        
                    }
                    if(boardData.isEmpty  || ((boardData.pieceData !=null)&&(boardData.pieceData.color == !color)) ){
                        if(color && id !=null&& id != 'pawn'&& id != 'king') {
                            availableMoves.white.push({
                                id:id,
                                x:x,
                                y:y,
                                hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                move : boardData,
                            });
            
                        }
                        if(!color && id != null && id != 'pawn' && id != 'king'){
                            
                            availableMoves.black.push({
                                id:id,
                                x:x,
                                y:y,
                                hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                move : boardData,
                            });
                        }  
                    }
                    if(boardData.isEmpty &&id == 'king' || ((boardData.pieceData !=null)&&(boardData.pieceData.color == !color)) && id == 'king' ){
                        if(color && id !=null && (boardData.threatData.blackCheck.counter == 0)) {
                            availableMoves.white.push({
                                id:id,
                                x:x,
                                y:y,
                                hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                move : boardData,
                            });
            
                        }
                        if(!color && id != null&& (boardData.threatData.whiteCheck.counter == 0)){
                            
                            availableMoves.black.push({
                                id:id,
                                x:x,
                                y:y,
                                hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                move : boardData,
                            });
                        }  
                    }
                    if (!boardData.isEmpty && ((boardData.pieceData !=null) &&(boardData.pieceData.color == !color)||(boardData.x == enPassantData.x && boardData.y == enPassantData.y && enPassantData.color != color)) && id == 'pawn'){
                        if(color) {
                            availableMoves.white.push({
                                id:id,
                                x:x,
                                y:y,
                                hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                move : boardData,
                            });
                        }
                        if(!color){
                            availableMoves.black.push({
                                id:id,
                                x:x,
                                y:y,
                                hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                move : boardData,
                            });
                        }  
                    }
                }   
                }   

                if (id == 'pawn'){
                    if(color){
                        if((y - 1>=0)?chessBoardData[y - 1][x].isEmpty:false){
                            availableMoves.white.push({
                                id:id,
                                x:x,
                                y:y,
                                hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                move : chessBoardData[y-1][x],
                            });
                            if((y - 2 >= 0)?(chessBoardData[y - 1][x].isEmpty && chessBoardData[y-2][x].isEmpty && chessBoardData[y][x].pieceData.hasMoved == 0):false){
                                availableMoves.white.push({
                                    id:id,
                                    x:x,
                                    y:y,
                                    hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                    move : chessBoardData[y-2][x],
                                });
                            }
                        }
                    }
                    if(!color){
                        if((y + 1<=7)?chessBoardData[y + 1][x].isEmpty:false){
                            availableMoves.black.push({
                                id:id,
                                x:x,
                                y:y,
                                hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                move : chessBoardData[y+1][x],
                            });
                            if((y + 2 <= 7)?(chessBoardData[y + 1][x].isEmpty && chessBoardData[y+2][x].isEmpty && chessBoardData[y][x].pieceData.hasMoved == 0):false){
                                availableMoves.black.push({
                                    id:id,
                                    x:x,
                                    y:y,
                                    hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                    move : chessBoardData[y+2][x],
                                });
                            }
                    }                    
                }
                //enpassant thing
            /*
            if(enPassantData.x !=null && enPassantData.y != null){
                if (enPassantData.color){
                    if (!chessBoardData[enPassantData.y-1][enPassantData.x+1].isEmpty && (chessBoardData[enPassantData.y-1][enPassantData.x+1].color != enPassantData.color)){
                        availableMoves.black.push({
                            id:'pawn',
                            x:enPassantData.x+1,
                            y:enPassantData.y-1,
                            hasMoved:chessBoardData[enPassantData.y-1][enPassantData.x + 1].pieceData.hasMoved,
                            move: chessBoardData[enPassantData.y][enPassantData.x]
                        });
                    }
                }
            }*/
            }
            
            if(id == 'king'){
                
                if(!chessBoardData[y][x].isEmpty && chessBoardData[y][x].pieceData.hasMoved == 0){
                    if(x + 3 <= 7){
                        if(!chessBoardData[y][x+3].isEmpty && chessBoardData[y][x+3].pieceData.hasMoved == 0){
                            if(chessBoardData[y][x+3].pieceData.id == 'rook' && chessBoardData[y][x+3].pieceData.color == color){
                                if((color?chessBoardData[y][x+1].threatData.blackCheck.counter == 0:chessBoardData[y][x+1].threatData.whiteCheck.counter == 0 )
                                    && (color?chessBoardData[y][x+2].threatData.blackCheck.counter == 0:chessBoardData[y][x+2].threatData.whiteCheck.counter == 0)){
                                        if(chessBoardData[y][x+1].isEmpty && chessBoardData[y][x+2].isEmpty){
                                            if(color && chessBoardData[y][x].threatData.blackCheck.counter == 0){
                                                availableMoves.white.push({
                                                    id:id,
                                                    x:x,
                                                    y,y,
                                                    hasMoved:chessBoardData[y][x].pieceData.hasMoved,
                                                    move: chessBoardData[y][x+2]
                                                });
                                            }if(!color && chessBoardData[y][x+1].threatData.whiteCheck.counter == 0){
                                                availableMoves.black.push({
                                                    id:id,
                                                    x:x,
                                                    y,y,
                                                    hasMoved:chessBoardData[y][x].pieceData.hasMoved,
                                                    move: chessBoardData[y][x+2]
                                                });
                                            }
                                        }
                                    
                                    }
                            }
                        }
                    }
                    if(x - 4 >= 0){
                        if(!chessBoardData[y][x-4].isEmpty && chessBoardData[y][x - 4].pieceData.hasMoved == 0){
                            if(chessBoardData[y][x -4].pieceData.id == 'rook' && chessBoardData[y][x - 4].pieceData.color == color){
                                if((color?chessBoardData[y][x-1].threatData.blackCheck.counter == 0:chessBoardData[y][x-1].threatData.whiteCheck.counter == 0 )
                                    && (color?chessBoardData[y][x-2].threatData.blackCheck.counter == 0:chessBoardData[y][x-2].threatData.whiteCheck.counter == 0)){
                                        if(chessBoardData[y][x-1].isEmpty && chessBoardData[y][x-2].isEmpty && chessBoardData[y][x-3].isEmpty){
                                            if(color && chessBoardData[y][x+1].threatData.blackCheck.counter == 0){
                                                availableMoves.white.push({
                                                    id:id,
                                                    x:x,
                                                    y,y,
                                                    hasMoved:chessBoardData[y][x].pieceData.hasMoved,
                                                    move: chessBoardData[y][x-2]
                                                });
                                            }if(!color && chessBoardData[y][x+1].threatData.whiteCheck.counter == 0){
                                                availableMoves.black.push({
                                                    id:id,
                                                    x:x,
                                                    y,y,
                                                    hasMoved:chessBoardData[y][x].pieceData.hasMoved,
                                                    move: chessBoardData[y][x-2]
                                                });
                                            }
                                        }
                                    
                                    }
                            }

                        }
                    }
                }
            }
            function verticalThreatData(minY, maxY){
                for(let currentY = y; currentY<=maxY; currentY++){    
                    if (currentY == y)continue;
                    changeData(chessBoardData[currentY][x]);    
                    if(!piece.validateMove.verticalChecker(y, currentY + 1, x))break;
                }
                for(let currentY = y; currentY>=minY; currentY--){  
                    if (currentY == y)continue;    
                    changeData(chessBoardData[currentY][x]);
                    if(!piece.validateMove.verticalChecker(y, currentY - 1, x))break;
                }
        
            }
            function horizontalThreatData(minX, maxX){
                for(let currentX = x; currentX<=maxX; currentX++){  
                    if (currentX == x) continue;
                    changeData(chessBoardData[y][currentX]);
                    if(!piece.validateMove.horizontalChecker(x, currentX + 1, y))break;
                }
                for(let currentX = x; currentX>=minX; currentX--){ 
                    if (currentX == x) continue;  
                    changeData(chessBoardData[y][currentX]);
                    if(!piece.validateMove.horizontalChecker(x, currentX - 1, y))break;
                }
        
            }
            function diagonalThreatData(){
                const findLimitMax = (x, y) =>{
                    let limitMax = 0;
                    if(x < y) limitMax = x;
                    else if (x >  y) limitMax = y;
                    else if(x = y) limitMax = x;
                    return limitMax;
                }
                for (let n = 1; n <= findLimitMax((7-x),y); n++){
                    changeData(chessBoardData[y - n][x + n]);
                    if(!piece.validateMove.diagonalChecker(x, (x+n) + 1, y, (y-n) - 1))break;
                }
                for (let n = 1; n <= findLimitMax((7-x),(7 - y)); n++){
                    changeData(chessBoardData[y + n][x + n]); 
                    if(!piece.validateMove.diagonalChecker(x, (x+n) + 1, y, (y+n) + 1))break;
                }
                for (let n = 1; n <= findLimitMax(x,(7 - y)); n++){
                    changeData(chessBoardData[y + n][x - n]);
                    if(!piece.validateMove.diagonalChecker(x, (x-n) - 1, y, (y+n) + 1))break;
                }
                for (let n = 1; n <= findLimitMax(x, y); n++){
                    changeData(chessBoardData[y - n][x - n]);
                    if(!piece.validateMove.diagonalChecker(x, (x-n) - 1, y, (y-n) - 1))break;
                }
        
            }
            function otherThreatData(modX, modY){
                if((x + modX) <= 7 && (y - modY) >= 0){
                    if(color) changeData(chessBoardData[y - modY][x + modX]);
                    if(!color && (id == 'knight' || id == 'king')) changeData(chessBoardData[y - modY][x + modX]);
                }
                if((x - modX) >=0 && (y + modY) <=7){
                    if(!color) changeData(chessBoardData[y + modY][x - modX]);
                    if(color && (id == 'knight' || id == 'king')) changeData(chessBoardData[y + modY][x - modX]);
                }
                if((x-modX)>= 0 && (y-modY)>=0){
                    if(color)changeData(chessBoardData[y - modY][x - modX]);
                    if(!color && (id == 'knight' || id == 'king')) changeData(chessBoardData[y - modY][x - modX]);
                }
                if((x+modX)<=7 &&(y+modY)<=7){
                    if(!color)changeData(chessBoardData[y + modY][x + modX]);
                    if(color && (id == 'knight' || id == 'king')) changeData(chessBoardData[y + modY][x + modX]);
                    
                }
                if(id =='knight'){
                    if((x+modY)<=7 && (y+modX)<=7) changeData(chessBoardData[y + modX][x + modY]);
                    if((x+modY)<=7 && (y-modX)>=0) changeData(chessBoardData[y - modX][x + modY]);
                    if((x-modY)>=0 && (y-modX)>=0) changeData(chessBoardData[y - modX][x - modY]);
                    if((x-modY)>=0 && (y+modX)<=7) changeData(chessBoardData[y + modX][x - modY]);
                }      
            }
        }
        function enPassant (oldX, newX, oldY, newY ,color){
            if(turnCheck == color){
                enPassantData = {
                    color:color,
                    x: oldX,
                    y: oldY,
                    target:{
                        x:newX,
                        y:newY,
                    },
                } 
            }
        }
        function eatChecker(x,y, color){
            if(chessBoardData[y][x].isEmpty == false) return chessBoardData[y][x].pieceData.color == !color;
        }
        function eatMove(x, y, quick){
            chessBoardData[y][x].pieceData = null;
            chessBoardData[y][x].isEmpty = true;
            if (quick) return;
            chessBoardData[y][x].tileLocation.removeChild(chessBoardData[y][x].tileLocation.lastChild);
        } 
        function movePiece(oldCoords,newCoords,id,color, hasMoved, pgnPromote, pushData, castling){   
            if(gameOver) return;     
            let oldX = oldCoords[0], oldY = oldCoords[1];
            let newX = newCoords[0], newY = newCoords[1]; 
            let storeEat;
            moveDetail.color = color;
            moveDetail.oldCoords = [oldX, oldY];
            moveDetail.moveNotation.old = [(String.fromCharCode(97+oldX)), (8-oldY)];
            if (eatChecker(newX, newY,color)){
                storeEat =  chessBoardData[newY][newX].pieceData;
                moveDetail.action.eat = storeEat;
                eatMove(newX, newY);
            }else if((enPassantData.x == newX) && (enPassantData.y == newY)&& id == 'pawn' && enPassantData.color != color){
                moveDetail.action.eat = chessBoardData[enPassantData.target.y][enPassantData.target.x].pieceData;
                moveDetail.action.enpass = true;
                storeEat = chessBoardData[enPassantData.target.y][enPassantData.target.x].pieceData;
                eatMove(enPassantData.target.x, enPassantData.target.y);
            }
            
            
            pieceUnmaker(oldX, oldY);
            playAnimation((chessBoardData[oldY][oldX].tileLocation),(chessBoardData[newY][newX].tileLocation),[color,id],castling);
            pieceMaker(newX, newY, id, color, (hasMoved + 1));
            
            refreshData();
            if (isKingInCheck() == true){
                refreshData();
                if(!gameOver) indicator.textContent = "King is in check!";
                undoLastMove(oldX,oldY,newX,newY ,id,color, hasMoved, storeEat);
                refreshData();
                if(moveDetail.action.eat) moveDetail.action.eat = false;
                if(moveDetail.action.enpass) moveDetail.action.enpass = false;
            }else{
                //playAnimation(chessBoardData[oldY][oldX].tileLocation, chessBoardData[newY][newX].tileLocation, [color, id], castling);
                kingCheck(color);
                //promotion logic
                if(moveDetail.action.eat) showEat(storeEat);
                if (id == 'pawn' && (!isKingInCheck() == true)){
                    if(color){
                        if(newY == 0){
                            getPromotionDiv(newX, newY, color, (hasMoved + 1), pgnPromote, aiOn);
                            return;
                        }
                    }
                    if(!color){
                        if(newY == 7){
                            getPromotionDiv(newX, newY, color, (hasMoved + 1),pgnPromote, aiOn);
                            return;
                        }
                    }
                    
                }
                //moveHistory
                moveDetail.piece = id;
                //deep clone needed, either of the two works but JSON parsing may suffer some performance dips and maybe data loss
                //moveDetail.tile = JSON.parse(JSON.stringify(chessBoardData[newY][newX].threatData));
                moveDetail.tile = structuredClone(chessBoardData[newY][newX].threatData);
                moveDetail.moves = (hasMoved + 1);
                moveDetail.moveNotation.new = chessBoardData[newY][newX].notation;
                moveDetail.newCoords = [newX, newY];
                
                if(pushData){
                    moveHistory.push(moveDetail);
                    moveIndex = moveHistory.length;
                    findOpening(chessBoard.generatePgn(chessBoard.getHistory(),true));
                } 
                if(!gameOver) indicator.textContent = chessBoardData[oldY][oldX].notation+' '+
                            id+' '+' -> '+chessBoardData[newY][newX].notation;
                clearMoveDetail();
                clearInfo();
                turnCheck = !turnCheck;
                enPassant(null, null, null, null ,enPassantData.color);
                //only moves black, need to set WHERE ai is on (white/black)
                if(turnCheck == aiTurn && aiOn) ai(aiOn);
                
            }
        }
        //testing
        
        const switchBtn = document.getElementById("switch-btn");
        let switchEnabled = true;
        aiBtn.onclick = ()=>{
            if (!switchEnabled) return;
            aiEnabled++;
            aiEnabled += aiSide;
            aiEnabled = aiEnabled%3;
            if (aiEnabled!=2 && switchEnabled){
                indicator.textContent = "AI has been switched on to "+(aiEnabled?"White!":"Black!");
                aiBtn.textContent = "";
                aiBtn.style.backgroundImage = "url('../../assets/logos/"+(aiEnabled?"white":"black")+ ".svg')";
                aiTurn = aiEnabled;
                switchEnabled = false;
                if(aiEnabled == turnCheck){
                    clearInfo();
                    ai(true);
                }
                setTimeout(() => {
                    switchEnabled = true
                }, 1000);
            }else{
                indicator.textContent = "AI has been turned off!";
                aiBtn.style.backgroundImage = "";
            }
        }
        switchBtn.onclick = () =>{
            if(!confirm("This will restart the game, continue?")){
                return;
            }
            changeSettings();
            makeBoard(aiSide);
            generateGame();
            enPassantData = {
                color:null,
                x: null,
                y: null,
                target:{
                    x:null,
                    y:null,
                },
            } 
        }
        function getAvailableMoves(isMax){
            if(!isMax) return availableMoves.white;
            if(isMax) return availableMoves.black;
        }
        
        //quick move
        const quick = (()=>{
            let quickHistory = [];
            let quickEnPassant = [enPassantData];
            function move(selectedMove){
                let oldX = selectedMove.x, oldY = selectedMove.y,
                newX = selectedMove.move.x, newY = selectedMove.move.y,
                color = chessBoardData[oldY][oldX].pieceData.color,
                id = selectedMove.id,
                hasMoved = selectedMove.hasMoved, 
                quickEat;
                let quickEnPassantData = quickEnPassant[quickEnPassant.length - 1], quick = true;
                //headACHEEEEEEEEE
                //castling check
                
                if (eatChecker(newX, newY,color)){
                    quickEat =  chessBoardData[newY][newX].pieceData;
                    eatMove(newX, newY, quick);
                }else if((quickEnPassantData.x == newX) && (quickEnPassantData.y == newY)&& id == 'pawn' && quickEnPassantData.color != color){
                    quickEat = chessBoardData[quickEnPassantData.target.y][quickEnPassantData.target.x].pieceData;
                    eatMove(quickEnPassantData.target.x, quickEnPassantData.target.y, quick);
                }
                
                if (id == 'pawn'){
                    if(color){
                        if(newY == 0){
                            pieceMaker(newX, newY, 'queen', color, (hasMoved + 1), quick);  
                        }else{
                            pieceMaker(newX, newY, id, color, (hasMoved + 1), quick); 
                        }
                        
                    }
                    if(!color){
                        if(newY == 7){
                            pieceMaker(newX, newY, 'queen', color, (hasMoved + 1), quick); 
                        }else{
                            pieceMaker(newX, newY, id, color, (hasMoved + 1),quick);
                        }
                         
                    }
                    
                }else{
                    pieceMaker(newX, newY, id, color, (hasMoved + 1), quick);  
                }
                pieceUnmaker(oldX, oldY, quick);
                

                //castling
                if (id == 'king'){
                    if(newX == oldX + 2){
                        pieceMaker((oldX + 1), newY, 'rook', color, (hasMoved + 1), quick);
                        pieceUnmaker((oldX + 3), oldY, quick);
                    }
                    if(newX == oldX - 2){
                        pieceMaker((oldX - 1), newY, 'rook', color, (hasMoved + 1),quick);
                        pieceUnmaker((oldX - 4), oldY, quick);
                    }
                }
                //enPassantData
                //this is for enpassant when doing quickmoves
                if(id == 'pawn'){
                    if(color){
                        if(newY == oldY - 2){
                            quickEnPassant.push({
                                color:color,
                                target:{
                                    x:newX,
                                    y:newY
                                },
                                x:newX,
                                y:oldY + 1
                            });
                        }else{
                            quickEnPassant.push({
                                color:color,
                                target:{
                                    x:-1,
                                    y:-1
                                },
                                x:-1,
                                y:-1,
                            });
                        }
                    }
                    if(!color){
                        if(newY == oldY + 2){
                            quickEnPassant.push({
                                color:color,
                                target:{
                                    x:newX,
                                    y:newY
                                },
                                x:oldX,
                                y:oldY - 1
                            });
                        }else{
                            quickEnPassant.push({
                                color:color,
                                target:{
                                    x:-1,
                                    y:-1
                                },
                                x:-1,
                                y:-1,
                            });
                        }
                    }
                }else{
                    quickEnPassant.push({
                        color:color,
                        target:{
                            x:-1,
                            y:-1
                        },
                        x:-1,
                        y:-1,
                    });
                }
                quickHistory.push({
                    oldX:oldX,
                    oldY:oldY,
                    newX:newX,
                    newY:newY,
                    color:color,
                    id:id,
                    hasMoved:hasMoved,
                    quickEat:quickEat,
                });

                //moveDetail for SVM
            }
            function undo(){
                //qD = quick Data
                let qD = quickHistory.pop();
                let quick = true;
                pieceUnmaker(qD.newX, qD.newY, quick);
                pieceMaker(qD.oldX, qD.oldY, qD.id, qD.color, qD.hasMoved, quick);
                if(qD.quickEat)pieceMaker(qD.quickEat.x, qD.quickEat.y, qD.quickEat.id,qD.quickEat.color, qD.quickEat.hasMoved, quick);
                //undoLastMove(qD.oldX, qD.oldY, qD.newX, qD.newY, qD.id, qD.color, qD.hasMoved, qD.quickEat);
                //undo castling
                if (qD.id == 'king'){
                    if (qD.newX == qD.oldX + 2){
                        pieceUnmaker((qD.oldX + 1), qD.newY, quick);
                        pieceMaker((qD.oldX + 3), qD.oldY, 'rook', qD.color, qD.hasMoved, quick);
                        //undoLastMove(, qD.oldY, ), qD.newY, 'rook', qD.color, qD.hasMoved, qD.quickEat, quick);
                    }
                    if(qD.newX == qD.oldX - 2){
                        pieceUnmaker((qD.oldX - 1), qD.newY, quick);
                        pieceMaker((qD.oldX - 4), qD.oldY, 'rook', qD.color, qD.hasMoved, quick);
                        //undoLastMove((qD.oldX - 4), qD.oldY, (qD.oldX - 1), qD.newY, 'rook', qD.color, qD.hasMoved, qD.quickEat, quick);
                    }
                }
                quickEnPassant.pop();
            }
            function refreshData(){
                activePieces = [];
                availableMoves.white = [];
                availableMoves.black = []; 
                for(let y = 0; y <8; y++){
                    for(let x = 0; x <8; x++){
                        //appbott
                        chessBoardData[y][x].threatData.whiteCheck.counter = 0;
                        chessBoardData[y][x].threatData.whiteCheck.threats = [];
                        chessBoardData[y][x].threatData.whiteCheck.coords.x = [];
                        chessBoardData[y][x].threatData.whiteCheck.coords.y = [];
                        chessBoardData[y][x].threatData.blackCheck.counter = 0;
                        chessBoardData[y][x].threatData.blackCheck.threats = [];
                        chessBoardData[y][x].threatData.blackCheck.coords.x = [];
                        chessBoardData[y][x].threatData.blackCheck.coords.y = [];
                        if (chessBoardData[y][x].pieceData != null && chessBoardData[y][x].isEmpty == false){
                            activePieces.push(chessBoardData[y][x].pieceData);
                        }
                    }
                }
                for(let i = 0; i<activePieces.length; i++){
                        getThreatData(activePieces[i].id, activePieces[i].x, activePieces[i].y, activePieces[i].color);
                    }
            }
            
            return {move,undo,refreshData}
        })();
        function ai(aiOn, algo){
            if(aiEnabled == 2) return;
            if(!aiOn) return;
            //if (!algo) return;
            let TotalMoves = 0;   
            let moveSelection = [];         
            //only for evaluation purposes, this can get mess with board data if not handled properly
            let openingAI = getNextMove(generatePgn(getHistory(),true));
            setTimeout(() => {
                if(openingAI){
                    //aiMove(openingAI);
                    //return;
                }
                let newMove;
                if(!aiTurn){
                    newMove = blackRoot(4, !aiTurn);
                }else{
                    newMove = whiteRoot(4, !aiTurn);
                }
                for (let i = 0; i< newMove.evaluatedMoves.length; i++){
                    if((newMove.evaluatedMoves[i].value >= (newMove.bestMove.value - 10)) && (newMove.evaluatedMoves[i].value <= (newMove.bestMove.value + 10))){
                        moveSelection.push(newMove.evaluatedMoves[i]);
                    }
                }
                //important to clear out threats etc for castling
                refreshData();
                let randomIndex = Math.floor(Math.random() * moveSelection.length);
                aiMove(moveSelection[randomIndex].move);
            }, 1000);
            function trueValue(tempValue, whiteSVM, blackSVM, isMaximizer){
                let trueValue = tempValue;
                //this function multiplies the move with the multipliers
                //black multiplier
                if(!whiteSVM && !blackSVM) trueValue = trueValue * 0.8;
                if(whiteSVM && blackSVM) trueValue  = trueValue * 1.0;

                if(isMaximizer){
                    if(whiteSVM && !blackSVM) trueValue = trueValue * 0.8;
                    if(!whiteSVM && blackSVM) trueValue = trueValue * 1.2;
                    //white multiplier
                }else if(!isMaximizer){
                    if(whiteSVM && !blackSVM) trueValue = trueValue * 1.2;
                    if(!whiteSVM && blackSVM) trueValue = trueValue * 0.8;
                }
                return trueValue;
            }
            function isMate(moves, color){
                if(color){
                    if(moves.length == 0 && chessBoardData[whiteKing.y][whiteKing.x].threatData.blackCheck.counter > 0)   return true;
                    if(moves.length == 0 && chessBoardData[whiteKing.y][whiteKing.x].threatData.blackCheck.counter == 0)   return false;
                    for(let i = 0; i <moves.length; i++){
                        if(moves.id != 'king') return false;
                    }
                }else{
                    if(moves.length == 0 && chessBoardData[blackKing.y][blackKing.x].threatData.whiteCheck.counter > 0)   return true;
                    if(moves.length == 0 && chessBoardData[blackKing.y][blackKing.x].threatData.whiteCheck.counter == 0)   return false;
                    for(let i = 0; i <moves.length; i++){
                        if(moves.id != 'king') return false;
                    }
                }
            }
            
            //GET THE MOVE, THEN WAIT

            function blackRoot(depth, isMaximizer){
                //we store the evaluated moves, see if theres "equal evaluated moves then return it"
                let evaluatedMoves = [];
                let currentMoves = getAvailableMoves(isMaximizer);
                let bestMove = -99999;
                let bestMoveFound;
                for(let i = 0; i < currentMoves.length; i++){
                    let newMove = currentMoves[i];
                    quick.move(newMove);
                    quick.refreshData();
                    let tempValue = -999999;
                    if(!isKingInCheck(isMaximizer)){
                        tempValue = miniMax((depth - 1),-10000, 10000, !isMaximizer);
                        if (isMate(getAvailableMoves(!isMaximizer), isMaximizer)) tempValue = 99999;
                    }
                    let whiteSVM = predictWhite(activePieces);
                    let blackSVM = predictBlack(activePieces);
                    quick.undo();
                    tempValue = trueValue(tempValue, whiteSVM, blackSVM, isMaximizer);
                    evaluatedMoves.push({
                        move: newMove,
                        value: tempValue,
                        w:whiteSVM,
                        b:blackSVM,
                        
                    })
                    
                    if(tempValue >= bestMove){
                        bestMove = tempValue;
                        bestMoveFound = newMove;
                    }
                }
                //return bestMoveFound;
                return {
                    bestMove:{
                        move: bestMoveFound,
                        value:bestMove,
                    },
                    evaluatedMoves: evaluatedMoves
                }
                
            }
            function whiteRoot(depth, isMaximizer){
                //we store the evaluated moves, see if theres "equal evaluated moves then return it"
                let evaluatedMoves = [];
                let currentMoves = getAvailableMoves(isMaximizer);
                let bestMove = 99999;
                let bestMoveFound;
                for(let i = 0; i < currentMoves.length; i++){
                    let newMove = currentMoves[i];
                    quick.move(newMove);
                    quick.refreshData();
                    let tempValue = 999999;

                    if(!isKingInCheck(isMaximizer)){
                        tempValue = miniMax((depth - 1),-10000, 10000, !isMaximizer);
                        if (isMate(getAvailableMoves(!isMaximizer), isMaximizer)) tempValue = -99999;
                    }
                    let whiteSVM = predictWhite(activePieces);
                    let blackSVM = predictBlack(activePieces);
                    quick.undo();
                    tempValue = trueValue(tempValue, whiteSVM, blackSVM, isMaximizer);
                    evaluatedMoves.push({
                        move: newMove,
                        value: tempValue,
                        w:whiteSVM,
                        b:blackSVM,
                    })
                    if(tempValue <= bestMove){
                        bestMove = tempValue;
                        bestMoveFound = newMove;
                    }
                }
                //return bestMoveFound;
                return {
                    bestMove:{
                        move: bestMoveFound,
                        value:bestMove,
                    },
                    evaluatedMoves: evaluatedMoves
                }
                
            }
            function miniMax(depth, alpha, beta, isMaximizer){
                TotalMoves++;
                quick.refreshData();
                
                if(depth === 0){
                    return -gameEval(activePieces); 
                }
                let currentMoves = getAvailableMoves(isMaximizer); 
                
                if(isMaximizer){
                    
                    let bestMove = -9999;
                    for(let i = 0; i < currentMoves.length; i++){
                        quick.move(currentMoves[i]);
                        bestMove = Math.max(bestMove, miniMax((depth - 1), alpha, beta, !isMaximizer));
                        quick.undo();
                        
                        alpha = Math.max (alpha, bestMove);
                        if(beta <= alpha){
                            return bestMove;
                        }
                    }
                    return bestMove;
                }else{
                    let bestMove = 9999;
                    for(let i = 0; i < currentMoves.length; i++){
                        quick.move(currentMoves[i]);
                        bestMove = Math.min(bestMove, miniMax((depth - 1), alpha, beta, !isMaximizer));
                        quick.undo();
                        
                        beta = Math.min(beta, bestMove);
                        if(beta<=alpha){
                            return bestMove;
                        }
                        
                    }
                    return bestMove;
                }

            }
            refreshData(); 
        }
        function aiMove(selectedMove){
            let selectedOldCoords = [selectedMove.x, selectedMove.y],
                selectedNewCoords = [selectedMove.move.x, selectedMove.move.y],
                selectedColor = (turnCheck?true:false);
                if(getMoveData(selectedMove.id, selectedOldCoords, selectedNewCoords, selectedColor, selectedMove.hasMoved)){
                    if(!gameOver) indicator.textContent = chessBoardData[selectedOldCoords[1]][selectedOldCoords[0]].notation+' '+
                            selectedMove.id+' '+' -> '+chessBoardData[selectedNewCoords[1]][selectedNewCoords[0]].notation;
                    movePiece(selectedOldCoords, selectedNewCoords, selectedMove.id, selectedColor, selectedMove.hasMoved, 'Q', true);
                }
                refreshData();
                
        }
        function kingCheck(color){
            turnCheck = !turnCheck;
            if(isKingInCheck()){
                refreshData();
                if(!gameOver) indicator.textContent = (turnCheck?"White":"Black")+"'s king is in check!";
                moveDetail.action.checking = true;
                let possible;
                if(isKingInCheck() && turnCheck){
                    possible = availableMoves.white;
                    checkmateChecker(true, possible);
                }
                if(isKingInCheck() && !turnCheck){
                    possible = availableMoves.black;
                    checkmateChecker(false, possible);
                }
            }
            
            //stalemate checker
            if(isKingInCheck() == false){
                let possible;
                if(color){
                    possible = availableMoves.black;
                    checkmateChecker(false, possible, true);
                }
                if(!color){
                    possible = availableMoves.white;
                    checkmateChecker(true, possible, true);
                }
            }
            turnCheck = !turnCheck;
        }
        function undoLastMove (oldX, oldY, newX, newY, id, color, hasMoved, storeEat){
            pieceMaker(oldX, oldY, id, color, hasMoved);
            pieceUnmaker(newX, newY);
            if(storeEat)pieceMaker(storeEat.x, storeEat.y, storeEat.id,storeEat.color, storeEat.hasMoved);
        }
        let blackKing = {
            x:-1,
            y:-1,
        }
        let whiteKing = {
            x:-1,
            y:-1,
        }
        function setKing(color, x, y){
            if(color){
                whiteKing.x = x;
                whiteKing.y = y;
            }
            if(!color){
                blackKing.x = x;
                blackKing.y = y;
            }
        }
        function isKingInCheck(isMax){
            let x, y;
            if(turnCheck){
                x = whiteKing.x;
                y = whiteKing.y;
                if((chessBoardData[y][x].pieceData.color)&&(chessBoardData[y][x].threatData.blackCheck.counter)){
                    return true;  
                }
            }
            if(!turnCheck){
                x = blackKing.x;
                y = blackKing.y;
                if((!chessBoardData[y][x].pieceData.color)&&(chessBoardData[y][x].threatData.whiteCheck.counter)){
                    return true;
                }
            }
            if(isMax){
                if(isMax == true){
                    x = blackKing.x;
                    y = blackKing.y;
                    if((!chessBoardData[y][x].pieceData.color)&&(chessBoardData[y][x].threatData.whiteCheck.counter)){
                        return true;
                    }
                }
                if(!isMax == true){
                    x = whiteKing.x;
                    y = whiteKing.y;
                    if((chessBoardData[y][x].pieceData.color)&&(chessBoardData[y][x].threatData.blackCheck.counter)){
                        return true;  
                    }
                }
            }
            /*
            for(let y = 0; y <8; y++){
                for(let x = 0; x <8; x++){
                    if (chessBoardData[y][x].pieceData != null && chessBoardData[y][x].isEmpty == false){
                        if(chessBoardData[y][x].pieceData.id == 'king'){
                            if((chessBoardData[y][x].pieceData.color)&&(chessBoardData[y][x].threatData.blackCheck.counter)&& turnCheck){
                                return true;  
                            }
                            if((!chessBoardData[y][x].pieceData.color)&&(chessBoardData[y][x].threatData.whiteCheck.counter)&& !turnCheck){
                                if (!turnCheck) return true;
                                return true;
                            }
                            
                        }
                    }
    
                    
                }
            }
            */
            return false;
        }
        function checkmateChecker(color, possible, stalemate){
            if(possible.length == 0){
                let numberOfMoves = 0;
                    refreshData();
                        if ((moveHistory.length + 1) % 2 == 0){
                            numberOfMoves = (moveHistory.length + 1) / 2;
                        }else if ((moveHistory.length + 1) % 2 == 1) {
                            numberOfMoves = Math.floor((moveHistory.length + 1)/2) + 1
                        }
                        winIndicator.style.display = 'block';
                if(color == stalemate){
                    moveDetail.action.mate = 'draw';
                    indicator.textContent =' stalemate in '+numberOfMoves+' moves';
                    winIndicator.classList.add( (color?'white':'black')+'-turn');
                    turnCheck = !turnCheck;
                    refreshData();
                        
                }else{
                    moveDetail.action.mate = true;
                    indicator.textContent = (color?'black':'white')+" wins in "+numberOfMoves+' moves';
                    winIndicator.textContent = 'Checkmate'
                    winIndicator.classList.add('checkmate');
                    turnCheck = !turnCheck;
                    refreshData();
                }
                gameOver = true;
            }else if(possible.length > 0){
                for(let n = 0; n < possible.length; n++){
                    let hasMoved = possible[n].hasMoved;
                    let oldX = possible[n].x, oldY = possible[n].y;
                    let newX = possible[n].move.x, newY = possible[n].move.y;
                    let storeEat;
                    hasMoved++;
                    if (eatChecker(newX, newY,color)){
                        storeEat =  chessBoardData[newY][newX].pieceData;
                        eatMove(newX, newY);
                    }
                    pieceMaker(newX, newY, possible[n].id, color, (hasMoved + 1));
                    pieceUnmaker(oldX, oldY);
                    refreshData();
                    
                    if (isKingInCheck() == false && n != possible.length - 1){
                        undoLastMove(oldX, oldY, newX, newY, possible[n].id, color, (hasMoved - 1), storeEat);
                        refreshData(); 
                        break;
                    }
                    if(n == possible.length -1 && isKingInCheck()){
                        let numberOfMoves = 0;
    
                        if ((moveHistory.length + 1) % 2 == 0){
                            numberOfMoves = (moveHistory.length + 1) / 2;
                        }else if ((moveHistory.length + 1) % 2 == 1) {
                            numberOfMoves = Math.floor((moveHistory.length + 1)/2) + 1
                        }
                        
                        winIndicator.style.display = 'block';
                        if(stalemate != null) {
                            moveDetail.action.mate = 'draw';
                            indicator.textContent =' stalemate in '+numberOfMoves+' moves';
                            winIndicator.classList.add('black-turn');
                            turnCheck = !turnCheck;
                            refreshData();
                        }else{

                            moveDetail.action.mate = true;
                            indicator.textContent = (color?'black':'white')+" wins in "+numberOfMoves+' moves';
                            winIndicator.textContent = 'Checkmate'
                            winIndicator.classList.add('checkmate');
                            turnCheck = !turnCheck;
                            refreshData();
                        }
                        
                        gameOver = true;
    
                    } 
                    
                    undoLastMove(oldX, oldY, newX, newY, possible[n].id, color, (hasMoved - 1), storeEat);
                    refreshData();
                }  
            }
            
            
        }
        const validateMove =(()=>{
            function horizontalChecker(oldX, newX, y){
                let allowHorizontal = true;
                if (oldX < newX){
                    for(let x = oldX; x < newX; x++){
                        if(x == oldX) continue;
                        if(chessBoardData[y][x].isEmpty == false) allowHorizontal = false;
                    }
                }
                if (oldX > newX){
                    for(let x = oldX; x > newX; x--){
                        if(x == oldX) continue;
                        if(chessBoardData[y][x].isEmpty == false) allowHorizontal = false;
                    }
                    
                }
                return allowHorizontal;
            }
            function verticalChecker(oldY, newY, x){
                let allowVertical = true;
                if (oldY < newY){
                    for(let y = oldY; y < newY; y++){
                        if(y == oldY) continue;
                        if(chessBoardData[y][x].isEmpty == false) allowVertical = false;
                    } 
                }
                if (oldY > newY){
                    for(let y = oldY; y > newY; y--){
                        if(y == oldY) continue;
                        if(chessBoardData[y][x].isEmpty == false) allowVertical = false;
                    }
                }
                return allowVertical;
            }
            function diagonalChecker(oldX, newX, oldY, newY){
                let allowDiagonal = true;
                if(newX > oldX){
                    for (let n = 1; n<(newX - oldX); n++){
                        if(newY<oldY){
                            if(chessBoardData[oldY - n][oldX + n].isEmpty == false) allowDiagonal = false;
                            
                        }
                        if(newY>oldY){
                            if(chessBoardData[oldY + n][oldX + n].isEmpty == false) allowDiagonal = false;
                        }
                    }
                }
                if(newX < oldX){
                    for (let n = 1; n<(oldX - newX); n++){
                        if(newY<oldY){
                            if(chessBoardData[oldY - n][oldX - n].isEmpty == false) allowDiagonal = false;
                        }
                        if(newY>oldY){
                            if(chessBoardData[oldY + n][oldX - n].isEmpty == false) allowDiagonal = false;
                        }
                    }
                }
                return allowDiagonal;
            }
            function horseChecker(newX,newY, color){
                let allowHorse = true;
                if (eatChecker(newX,newY,color)) return true;
                if(chessBoardData[newY][newX].isEmpty == false){
                    allowHorse = false;
                }
                return allowHorse;
            }
            function kingChecker(newX, newY, color){
                let allowKing = true;
                if (eatChecker(newX,newY,color)) return true;
                if(chessBoardData[newY][newX].isEmpty == false) allowKing = false;
                return allowKing;
            }
            return{
                diagonalChecker,
                horizontalChecker, 
                horseChecker,
                kingChecker,
                verticalChecker,
            };
        })();
        function undoMove(){
            refreshData();
            if(moveHistory.length > 0){
                if (gameOver){
                   gameOver = !gameOver; 
                   turnCheck = !turnCheck;
                   winIndicator.style.display = 'none';
                   winIndicator.textContent = '';
                   winIndicator.classList.remove('black-turn');
                   winIndicator.classList.remove('checkmate');
                } 
                enPassant(null, null, null, null ,!enPassantData.color); 
                let undoData = moveHistory.pop();
                redoData.push(undoData);
                let storeEat= '';
                if (undoData.action.eat) {
                    storeEat = undoData.action.eat;
                    const capturedPiecesDiv = document.getElementById("captured-"+(undoData.color?"black":"white")+"-holder");
                    if(capturedPiecesDiv.hasChildNodes()) capturedPiecesDiv.removeChild(capturedPiecesDiv.lastChild);
                }
                if(undoData.action.enpass) {
                    if(undoData.color) enPassant(storeEat.x, storeEat.x, (storeEat.y - 1), storeEat.y, storeEat.color);
                    if(!undoData.color) enPassant(storeEat.x, storeEat.x, (storeEat.y + 1), storeEat.y, storeEat.color);

                }
                if(undoData.action.castle) {
                    if (undoData.oldCoords[0] < undoData.newCoords[0]){
                        undoLastMove((undoData.oldCoords[0] + 3),undoData.oldCoords[1],undoData.newCoords[0] - 1, undoData.newCoords[1],'rook', undoData.color,0);
                    }
                    if (undoData.oldCoords[0] > undoData.newCoords[0]){
                        undoLastMove((undoData.oldCoords[0] - 4),undoData.oldCoords[1],undoData.newCoords[0] + 1, undoData.newCoords[1],'rook', undoData.color,0);
                    }
                }

                /*
                if(!gameOver) indicator.textContent = chessBoardData[undoData.oldCoords[1]][undoData.oldCoords[0]].notation+' '+
                        undoData.piece+' '+' > '+chessBoardData[undoData.newCoords[1]][undoData.newCoords[0]].notation;
                        */
                indicator.textContent = '';
                undoLastMove(undoData.oldCoords[0],undoData.oldCoords[1],undoData.newCoords[0], undoData.newCoords[1],undoData.piece, undoData.color,(undoData.moves - 1),storeEat);
                openingIndicator.textContent = '';
                findOpening(chessBoard.generatePgn(getHistory(),true));
                turnCheck = !turnCheck;
                refreshData();
                indicator.textContent = "Teachess";
            }
        }
        function redoMove(){
            refreshData();
            if(redoData.length > 0){
                let tempRedoData = redoData.pop();
                if(getMoveData(tempRedoData.piece, [tempRedoData.oldCoords[0], tempRedoData.oldCoords[1]], [tempRedoData.newCoords[0], tempRedoData.newCoords[1]], tempRedoData.color, (tempRedoData.moves - 1))){
                    /*
                    if(!gameOver) indicator.textContent = chessBoardData[movingData.oldCoords.y][movingData.oldCoords.x].notation+' '+
                            movingData.id+' '+' > '+chessBoardData[newY][newX].notation;*/
                    movePiece([tempRedoData.oldCoords[0], tempRedoData.oldCoords[1]], [tempRedoData.newCoords[0], tempRedoData.newCoords[1]], tempRedoData.piece, tempRedoData.color, (tempRedoData.moves - 1), tempRedoData.action.promote, true);
                    refreshData();
                }
                
            }
            
        }
        function showEat(eatData){
            const capturedPiece = document.createElement("div");
            capturedPiece.classList.add((eatData.color?"white":"black")+'-'+eatData.id);
            capturedPiece.classList.add('captured-piece');
            capturedPiece.setAttribute('title',eatData.id);
            if(eatData.color){
                const whiteHolder = document.getElementById("captured-white-holder");
                whiteHolder.appendChild(capturedPiece)
            }

            if(!eatData.color){
                const blackHolder = document.getElementById("captured-black-holder");
                blackHolder.appendChild(capturedPiece);
            }
            
        }
        //rename aiOn to aiPromote so we dont get errors
        function getPromotionDiv(newX, newY, color, hasMoved, pgnPromote, aiPromote){
            turnCheck = !turnCheck
            const promotionWrapper = document.getElementById('promotion-wrapper');
            const promotionQueen = document.getElementById('promote-queen');
            const promotionRook = document.getElementById('promote-rook');
            const promotionBishop = document.getElementById('promote-bishop');
            const promotionKnight = document.getElementById('promote-knight');
            promotionRook.classList.add((color?'white':'black')+'-rook');
            promotionBishop.classList.add((color?'white':'black')+'-bishop');
            promotionQueen.classList.add((color?'white':'black')+'-queen');
            promotionKnight.classList.add((color?'white':'black')+'-knight');
            if(!pgnPromote){  
                promotionWrapper.style.zIndex = '30';
                promotionWrapper.style.height = '100vh'; 
            }
            promotionQueen.onclick = () =>{
                promote('Q');
            }
            promotionRook.onclick = () =>{
                promote('R');
            }
            promotionKnight.onclick = () =>{
                promote('N');
            }
            promotionBishop.onclick = () =>{
                promote('B');
            }
            
            function promotionAction(){
                turnCheck = !turnCheck;
                refreshData();
                kingCheck(color);
                moveDetail.piece = 'pawn';
                moveDetail.moveNotation.new = chessBoardData[newY][newX].notation;
                moveDetail.newCoords =[newX,newY];
                moveHistory.push(moveDetail);
                moveIndex = moveHistory.length;
                if(!pgnPromote){
                    promotionWrapper.style.zIndex ='-10';
                }
                promotionQueen.classList.remove((color?'white':'black')+'-queen');
                promotionRook.classList.remove((color?'white':'black')+'-rook');
                promotionBishop.classList.remove((color?'white':'black')+'-bishop');
                promotionQueen.classList.remove((color?'white':'black')+'-queen');
                promotionKnight.classList.remove((color?'white':'black')+'-knight');
                

            }
            function promote(piece){
                let promoteID;
                switch (piece){
                    case 'Q':
                        promoteID = 'queen';
                        break;
                    case 'B':
                        promoteID = 'bishop';
                        break;
                    case 'N':
                        promoteID = 'knight';
                        break;
                    case 'R':
                        promoteID = 'rook';
                        break;
                    default:
                        promoteID = 'pawn';
                        break;
                }
                pieceUnmaker(newX, newY);
                pieceMaker(newX, newY, promoteID, color, hasMoved);
                moveDetail.action.promote = piece;
                promotionAction();
                clearInfo();
                clearMoveDetail();
                turnCheck = !turnCheck;
                enPassant(null, null, null, null ,enPassantData.color);
                if(turnCheck == aiTurn && aiPromote) ai(aiPromote);

            }
            if(pgnPromote){
                promote(pgnPromote);
            }
        }
        function clearMoveDetail(){
            moveDetail = {
            color: null,
            piece: null,
            moves: null,
            tile:null,
            moveNotation: {
                new:null,
                old:null,
            },
            oldCoords: [],
            newCoords:[],
            action: {
            eat: false,
            castle: false,
            enpass: false,
            checking: false,
            mate: false,
            promote: false,
        }
            }
        }
        return {getThreatData, getMoveData,movePiece, pieceMaker, validateMove, undoMove, redoMove, aiMove, getAvailableMoves, quick};
    })();
    function makeBoard(turn){
        gameOver = false;
        moveHistory = [];
        redoData = [];
        availableMoves = {
            black:[],
            white:[]
        };
        winIndicator.style.display = 'none';
        winIndicator.textContent = '';
        winIndicator.classList.remove('black-turn');
        winIndicator.classList.remove('checkmate');
        turnCheck = true;
        clearInfo();
        chessBoardData = [];
        while (gameBoard.hasChildNodes()) gameBoard.removeChild(gameBoard.lastChild);
        for(let y = 0; y < 8; y++){
            let chessBoardTileContainer = document.createElement('div');
            chessBoardTileContainer.classList.add('tile-container');
            let chessBoardTileData = [];
            for(let x = 0; x < 8; x++){    
                let chessBoardTileDiv = document.createElement('div');
                chessBoardTileDiv.classList.add('tile');
                chessBoardTileDiv.classList.add(((y+1) + (x+1))%2?'white-tile':'black-tile');
                let TileData ={
                    isEmpty: true,
                    notation: (String.fromCharCode(97+x))+(8 - y),
                    pieceData:null,
                    tileLocation: chessBoardTileDiv,
                    threatData:{
                        whiteCheck: {
                            counter:0,
                            threats:[],
                            coords:{
                                x:[],
                                y:[],
                            } 
                        },
                        blackCheck: {
                            counter: 0,
                            threats:[],
                            coords:{
                                x:[],
                                y:[],
                            }
                        }
                    },
                    x:x,
                    y:y
                };
                chessBoardTileDiv.textContent = TileData.notation;
                let piecePic = document.createElement("div");
                piecePic.classList.add('piece-pic');
                piecePic.ondragover = (e) =>{
                    e.preventDefault();
                }
                piecePic.ondragenter = (e) =>{
                    e.preventDefault();

                    piecePic.classList.add("placement");
                }
                piecePic.ondragleave = (e) =>{
                    e.preventDefault();
                    piecePic.classList.remove("placement");
                }
                piecePic.ondrop =(e)=>{
                    e.preventDefault();
                    piecePic.classList.remove("placement");
                }
                piecePic.onmouseenter = (e) =>{
                    e.preventDefault();
                    if(movingData.id != null){
                        piecePic.classList.add("placement");
                    }
                }
                piecePic.onmouseleave = (e) =>{
                    e.preventDefault();

                    if(movingData.id != null){
                        piecePic.classList.remove("placement");
                    }   
                }
                chessBoardTileDiv.onmouseenter = (e) =>{
                    e.preventDefault();
                }
                chessBoardTileDiv.ondragover = (e) =>{
                    e.preventDefault();
                }
                chessBoardTileDiv.ondragenter = (e) =>{
                    e.preventDefault();
                    if(movingData.oldCoords.y !=null && movingData.oldCoords.x != null){
                        if(!gameOver) indicator.textContent = chessBoardData[movingData.oldCoords.y][movingData.oldCoords.x].notation+' '+
                        movingData.id+' '+' -> '+chessBoardData[y][x].notation;
                    }
                }

                chessBoardTileDiv.ondrop = (e) =>{
                    e.preventDefault();
                    movingData.newCoords.x = x;
                    movingData.newCoords.y = y;
                    clickTile();
                }
                
                chessBoardTileDiv.onclick = () =>{
                    if(movingData.oldCoords.y && movingData.oldCoords.x != null){
                        if(!gameOver) indicator.textContent = chessBoardData[movingData.oldCoords.y][movingData.oldCoords.x].notation+' '+
                        movingData.id+' '+' -> '+chessBoardData[y][x].notation;
                    }
                    movingData.newCoords.x = x;
                    movingData.newCoords.y = y;
                    clickTile();
                    piecePic.classList.remove("placement");
                }
                if(!turn){
                    chessBoardTileDiv.append(piecePic);
                    chessBoardTileContainer.append(chessBoardTileDiv);
                }else{
                    chessBoardTileDiv.prepend(piecePic);
                    chessBoardTileContainer.prepend(chessBoardTileDiv);
                }
                chessBoardTileData.push(TileData);
            }   
            if(!turn){
                gameBoard.append(chessBoardTileContainer);
            }else{
                gameBoard.prepend(chessBoardTileContainer);
            }
            
            chessBoardData.push(chessBoardTileData);
        }
        function clickTile(){
            let oldX = movingData.oldCoords.x, oldY = movingData.oldCoords.y;
            let newX = movingData.newCoords.x, newY = movingData.newCoords.y;
            aiOn = true;
            if(piece.getMoveData(movingData.id, [oldX, oldY], [newX, newY],movingData.color, movingData.hasMoved)){
                if(!gameOver) indicator.textContent = chessBoardData[movingData.oldCoords.y][movingData.oldCoords.x].notation+' '+
                        movingData.id+' '+' -> '+chessBoardData[newY][newX].notation;
                piece.movePiece([oldX, oldY], [newX, newY], movingData.id, movingData.color, movingData.hasMoved, false, true);
                redoData = [];
            }else if (piece.getMoveData(movingData.id, [oldX, oldY], [newX, newY],movingData.color, movingData.hasMoved)){;
                if(movingData.color != turnCheck){
                    if(!gameOver) indicator.textContent = "not your turn!"
                }else{
                    if(!gameOver) indicator.textContent = 'invalid move';
                }
                clearInfo();
                refreshData();  
            }
            aiOn = false;
        }   
        const yNotation = document.getElementById('y-notation');

        const xNotation = document.getElementById('x-notation');
        if(turn){
            for(let i = 0; i<16; i+=2){
                yNotation.childNodes[i + 1].textContent = ((i/2) + 1);
            }
            for(let i = 0; i<16; i+=2){
                xNotation.childNodes[i + 1].textContent = (String.fromCharCode(104-(i/2)));
            }
        }
        if(!turn){
            for(let i = 0; i<16; i+=2){
                yNotation.childNodes[i + 1].textContent = (8 - (i/2) );
            }
            for(let i = 0; i<16; i+=2){
                xNotation.childNodes[i + 1].textContent = (String.fromCharCode(97+(i/2)));
            }
        }
    }
    function clearInfo(){
        movingData.color = null;
        movingData.hasMoved = null;
        movingData.id = null;
        movingData.newCoords.x = null;
        movingData.newCoords.y = null;
        movingData.oldCoords.x = null;
        movingData.oldCoords.y = null;
        movingData.piece = null;
    }
    let activePieces = [];
    function refreshData(){
        activePieces = [];
        availableMoves.white = [];
        availableMoves.black = []; 
        for(let y = 0; y <8; y++){
            for(let x = 0; x <8; x++){
                //appbott
                chessBoardData[y][x].threatData.whiteCheck.counter = 0;
                chessBoardData[y][x].threatData.whiteCheck.threats = [];
                chessBoardData[y][x].threatData.whiteCheck.coords.x = [];
                chessBoardData[y][x].threatData.whiteCheck.coords.y = [];
                chessBoardData[y][x].threatData.blackCheck.counter = 0;
                chessBoardData[y][x].threatData.blackCheck.threats = [];
                chessBoardData[y][x].threatData.blackCheck.coords.x = [];
                chessBoardData[y][x].threatData.blackCheck.coords.y = [];
                chessBoardData[y][x].tileLocation.classList.remove('highlighted');
                clearInfo();
                if (chessBoardData[y][x].pieceData != null && chessBoardData[y][x].isEmpty == false){
                    activePieces.push(chessBoardData[y][x].pieceData);
                }
                chessBoardData[y][x].tileLocation.style.color = ((notations == 2||notations == 3)?"":"transparent"); 
                
                } 
            }
            for(let i = 0; i<activePieces.length; i++){
                piece.getThreatData(activePieces[i].id, activePieces[i].x, activePieces[i].y, activePieces[i].color);
            }
            //turnIndicator
            if(!gameOver){
                turnIndicatorPic.classList.add((turnCheck?'white':'black')+'-turn');
                turnIndicatorPic.classList.remove((!turnCheck?'white':'black')+'-turn'); 
            }
            //openingIndicator.textContent = '';
            findOpening(chessBoard.generatePgn(chessBoard.getHistory(),true));

    }
    function generateGame(){
        const capturedWhitePiecesDiv = document.getElementById("captured-white-holder");
        const capturedBlackPiecesDiv = document.getElementById("captured-black-holder");
        while(capturedWhitePiecesDiv.hasChildNodes()) capturedWhitePiecesDiv.removeChild(capturedWhitePiecesDiv.lastChild);
        while(capturedBlackPiecesDiv.hasChildNodes()) capturedBlackPiecesDiv.removeChild(capturedBlackPiecesDiv.lastChild);
        indicator.textContent = 'Teachess';
        for (let x = 0; x<8;x++){
            piece.pieceMaker(x,6,'pawn',true, 0, false);
            piece.pieceMaker(x,1,'pawn',false, 0, false); 
        }
        //kings
        piece.pieceMaker(4,0,'king',false,0, false);
        piece.pieceMaker(4,7,'king',true,0, false);
        //rooks
        piece.pieceMaker(0,0,'rook',false,0, false);
        piece.pieceMaker(0,7,'rook',true,0, false);
        piece.pieceMaker(7,0,'rook',false,0, false);
        piece.pieceMaker(7,7,'rook',true,0, false);
        //queens
        piece.pieceMaker(3,0,'queen',false,0, false);
        piece.pieceMaker(3,7,'queen',true,0, false);
        //bishops
        piece.pieceMaker(2,0,'bishop',false,0, false);
        piece.pieceMaker(2,7,'bishop',true,0, false);
        piece.pieceMaker(5,0,'bishop',false,0, false);
        piece.pieceMaker(5,7,'bishop',true,0, false);
        //knights
        piece.pieceMaker(1,0,'knight',false,0, false);
        piece.pieceMaker(1,7,'knight',true,0, false);
        piece.pieceMaker(6,0,'knight',false,0, false);
        piece.pieceMaker(6,7,'knight',true,0, false);
        refreshData();
    }
    function generateImgGame(array, turn){
        turnCheck = turn;
        const capturedWhitePiecesDiv = document.getElementById("captured-white-holder");
        const capturedBlackPiecesDiv = document.getElementById("captured-black-holder");
        while(capturedWhitePiecesDiv.hasChildNodes()) capturedWhitePiecesDiv.removeChild(capturedWhitePiecesDiv.lastChild);
        while(capturedBlackPiecesDiv.hasChildNodes()) capturedBlackPiecesDiv.removeChild(capturedBlackPiecesDiv.lastChild);
        indicator.textContent = 'Teachess';
        for(let i = 0; i < 8; i++){
            for(let j = 0; j<8; j++){
                if((array[i][j]).piece !=null){
                    piece.pieceMaker(j,i,array[i][j].piece,array[i][j].color, 0, false);
                }
            }
        }
        refreshData();
    }
    function viewNotation(){
        notations++;
        notations = (notations%4);
        refreshData();
        return notations;
    }
    //pgn generator
    function redundantChecker(data){
        if(data.color){
            if(data.tile.whiteCheck.counter > 0){
                for(let i = 0; i <= data.tile.whiteCheck.counter; i++){
                    if(data.tile.whiteCheck.threats[i] == data.piece){
                        if(data.tile.whiteCheck.coords.x[i] == data.oldCoords[0]){
                            return data.moveNotation.old[1];
                        }
                        return data.moveNotation.old[0];
                    }
                }
            }
        }
        if (!data.color){
            if(data.tile.blackCheck.counter > 0){
                for(let i = 0; i <= data.tile.blackCheck.counter; i++){
                    if(data.tile.blackCheck.threats[i] == data.piece){
                        if(data.tile.blackCheck.coords.x[i] == data.oldCoords[0]){
                            return data.moveNotation.old[1];
                        }
                        return data.moveNotation.old[0];
                    }
                }
            }
        }
        return '';
    }
    function generatePgn(data, openingCheck){
        let pgnString = '';
        let moveNumber = 0;
        let chLimit = 1;
        let pgnResult = '*';
        for(let i = 0; i < data.length; i++){
            let abbreviation = '';
            let action = '';
            switch (data[i].piece){
                case 'knight':
                    abbreviation = 'N';
                    abbreviation = abbreviation+redundantChecker(data[i]);
                    break;
                case 'bishop':
                    abbreviation = 'B';
                    abbreviation = abbreviation+redundantChecker(data[i]);
                    break;
                case 'queen':
                    abbreviation= 'Q';
                    abbreviation = abbreviation+redundantChecker(data[i]);
                    break;
                case 'king':
                    abbreviation = 'K';
                    break;
                case 'rook':
                    abbreviation = 'R';
                    abbreviation = abbreviation+redundantChecker(data[i]);
                    break;
                case 'pawn':
                    if(data[i].action.eat) abbreviation = data[i].moveNotation.old[0];
                    break;
                default:
                    abbreviation='';
                    break;
            }
            if(data[i].action.promote)action = action+'='+data[i].action.promote;
            if(data[i].action.checking && !data[i].action.mate){
                action = action+'+'
            }else if(data[i].action.mate != false){
                if(data[i].action.mate == 'draw'){
                    pgnResult = '1/2-1/2';
                }else{
                    action = action+'#'
                    pgnResult = (i%2 == 0?'1-0':'0-1');
                }
                
            }
            function castle (oldX, newX){
                if (oldX<newX) return 'O-O';
                if (oldX>newX) return 'O-O-O';
            }
            if (i%2 == 0) moveNumber++;
            if(!data[i].action.castle){
                pgnString = pgnString+(i%2 == 0?moveNumber+'. ':'')+abbreviation+(data[i].action.eat?'x':'')+data[i].moveNotation.new+action;
            }else{
                pgnString = pgnString+(i%2 == 0?moveNumber+'. ':'')+castle((data[i].oldCoords[0]),(data[i].newCoords[0]));
            }
            
            
            if(pgnString.length >= (70 * chLimit)){
                pgnString = pgnString+'\n';
                chLimit++;
            }else{
                pgnString = pgnString+' ';
            }
            findOpening(pgnString);
        }
        if (openingCheck)return pgnString;  
        
        pgnString = pgnString + pgnResult;
        let pgnTags =[
            '[Event "?"]',
            '[Site "?"]',
            '[Date "????.??.??"]',
            '[Round "?"]',
            '[White "?"]',
            '[Black "?"]',
            '[Result "'+pgnResult+'"]'
        ];
        let pgnTagString = '';
        pgnTags.forEach(element => {
            pgnTagString = pgnTagString+element+'\n';
        });
        pgnTagString = pgnTagString+'\n';
        let pgn = pgnTagString+pgnString;
        
        return pgn;
    }               
    
    function getHistory(){
        return moveHistory;
    }
    function getBoardData(){
        return chessBoardData;
    }
    function translatePgn(moveList, translate, color){
        //movingData.id, [oldX, oldY], [newX, newY],movingData.color, movingData.hasMoved)
        //need id
        if(!translate) openingIndicator.textContent = "";
        for(let i = 0;i<moveList.length; i++){
            let moveString;
            let pgnData = {
                id:null,
                newX: null,
                newY: null,
                color:null,
                oldX:null,
                oldY:null,
                hasMoved:null,
                notation:null,
            }
            if(!translate) moveString = moveList[i].split('');
            if(translate) moveString = moveList.split('');
            let identifier = 0;
            //id
            switch (moveString[identifier]){
                case 'N':
                    pgnData.id = 'knight';
                    identifier++;
                    break;
                case 'B':
                    pgnData.id = 'bishop';
                    identifier++;
                    break;
                case 'O':
                case 'K':
                    pgnData.id = 'king';
                    identifier++;
                    break;
                case 'Q':
                    pgnData.id = 'queen';
                    identifier++;
                    break;
                case 'R':
                    pgnData.id = 'rook';
                    identifier++;
                    break;
                default:
                    pgnData.id ='pawn';
                    break;
            }
            //color
            if(!translate){
                if(i%2==0){
                    pgnData.color = true;
                }else{
                    pgnData.color = false;
                }
            }
            if(translate){
                pgnData.color = color;
            }
            let promotionPGN = false;
            if(moveString[identifier] != '-'){
                if(moveString[identifier + 1] == 'x') {
                    if(isNaN(moveString[identifier])){
                        pgnData.oldX = ((moveString[identifier]).charCodeAt() - 97);
                    }else{
                        pgnData.oldY = (8 - (parseInt(moveString[identifier])));
                        
                    }
                    identifier+=2;
                }
                if(moveString[identifier] == 'x') identifier++;
                if (identifier == 0){
                    pgnData.oldX = ((moveString[identifier]).charCodeAt() - 97);
                }
                if (identifier == 1 && moveString[identifier] != 'x' && moveString.length == 4){
                    if(isNaN(moveString[identifier])){
                        pgnData.oldX = ((moveString[identifier]).charCodeAt() - 97);
                    }else{
                        pgnData.oldY = (8 - (parseInt(moveString[identifier])));
                        
                    }
                    identifier++;
                }
                pgnData.newX = ((moveString[identifier]).charCodeAt() - 97);
                identifier++;
                pgnData.newY = (8 - (parseInt(moveString[identifier])));
                //needs refactor but should work fine
                
                if(pgnData.id == 'pawn'){
                    if(pgnData.color){
                        if(chessBoardData[(pgnData.newY) + 1][pgnData.oldX].pieceData != null){
                            pgnData.oldY = pgnData.newY + 1;
                        }else{
                            pgnData.oldY = pgnData.newY + 2;
                        }
                        
                    }
                    if(!pgnData.color){
                        if(chessBoardData[(pgnData.newY) - 1][pgnData.oldX].pieceData != null){
                            pgnData.oldY = pgnData.newY - 1;
                        }else{
                            pgnData.oldY = pgnData.newY - 2;
                        }
                    }
                    if (moveString[identifier + 1] = '='){
                            promotionPGN = moveString[identifier + 2];
                    }
                }else{
                    
                    if(pgnData.color){
                        for(let i = 0; i < chessBoardData[pgnData.newY][pgnData.newX].threatData.whiteCheck.counter; i++){
                            if(chessBoardData[pgnData.newY][pgnData.newX].threatData.whiteCheck.threats[i] == pgnData.id){
                                if(pgnData.oldX != null && pgnData.oldY == null && (chessBoardData[pgnData.newY][pgnData.newX].threatData.whiteCheck.coords.x[i] == pgnData.oldX)){
                                    pgnData.oldY = chessBoardData[pgnData.newY][pgnData.newX].threatData.whiteCheck.coords.y[i];
                                }else if(pgnData.oldY != null && pgnData.oldX == null && (chessBoardData[pgnData.newY][pgnData.newX].threatData.whiteCheck.coords.y[i] == pgnData.oldY)){
                                    pgnData.oldX = chessBoardData[pgnData.newY][pgnData.newX].threatData.whiteCheck.coords.x[i];
                                }else if(pgnData.oldY == null && pgnData.oldX == null){
                                    pgnData.oldY = chessBoardData[pgnData.newY][pgnData.newX].threatData.whiteCheck.coords.y[i];
                                    pgnData.oldX = chessBoardData[pgnData.newY][pgnData.newX].threatData.whiteCheck.coords.x[i];
                                }
    
                            }
                        }
                    }else if (!pgnData.color){
                        for(let i = 0; i < chessBoardData[pgnData.newY][pgnData.newX].threatData.blackCheck.counter; i++){
                            if(chessBoardData[pgnData.newY][pgnData.newX].threatData.blackCheck.threats[i] == pgnData.id){
                                if(pgnData.oldX != null && pgnData.oldY == null && (chessBoardData[pgnData.newY][pgnData.newX].threatData.blackCheck.coords.x[i] == pgnData.oldX)){
                                    pgnData.oldY = chessBoardData[pgnData.newY][pgnData.newX].threatData.blackCheck.coords.y[i];
                                }else if(pgnData.oldY != null && pgnData.oldX == null && (chessBoardData[pgnData.newY][pgnData.newX].threatData.blackCheck.coords.y[i] == pgnData.oldY)){
                                    pgnData.oldX = chessBoardData[pgnData.newY][pgnData.newX].threatData.blackCheck.coords.x[i];
                                }else if(pgnData.oldY == null && pgnData.oldX == null){
                                    pgnData.oldY = chessBoardData[pgnData.newY][pgnData.newX].threatData.blackCheck.coords.y[i];
                                    pgnData.oldX = chessBoardData[pgnData.newY][pgnData.newX].threatData.blackCheck.coords.x[i];
                                }
    
                            }
                        }
                    }
                }

            }else if (moveString[identifier] = '-') {
                pgnData.oldX = 4;
                if  (pgnData.color){
                    pgnData.oldY = 7;
                    pgnData.newY = 7;
                } 
                if  (!pgnData.color){
                    pgnData.oldY = 0;
                    pgnData.newY = 0;
                }
                if(moveString.length == 3)pgnData.newX = 6;
                if(moveString.length == 5)pgnData.newX = 2;
                
            }
            pgnData.hasMoved = chessBoardData[pgnData.oldY][pgnData.oldX].pieceData.hasMoved;
            pgnData.notation = chessBoardData[pgnData.oldY][pgnData.oldX].notation;
            
            if(translate){
                return pgnData;
            }
            
            try {
                if(piece.getMoveData(pgnData.id, [pgnData.oldX, pgnData.oldY], [pgnData.newX, pgnData.newY],pgnData.color,chessBoardData[pgnData.oldY][pgnData.oldX].pieceData.hasMoved)){
                    piece.movePiece([pgnData.oldX, pgnData.oldY], [pgnData.newX, pgnData.newY], pgnData.id, pgnData.color, chessBoardData[pgnData.oldY][pgnData.oldX].pieceData.hasMoved,promotionPGN, true);
                    findOpening(chessBoard.generatePgn(chessBoard.getHistory(),true));
                    redoData = [];
                }
            } catch (error) {
                let errorMove = '';
                for(let i = 0; i < moveString.length; i++){
                    errorMove = errorMove + moveString[i];
                }
                alert("Invalid Move: "+errorMove);
                makeBoard();
                generateGame();
            }
            
        }
    }
    const inputPgn = document.getElementById("input-pgn");
    function findOpening(pgn){
        //return;
        pgn = pgn.trim();
        pgn = pgn.replace(/(\r\n|\n)/gm, " ");
        moveHistoryIndicator.textContent = pgn;
        if(inputPgn.style.display =="inline-block"){
            hideDisplay();
        }
        //linear search, for testing purposes, need to refactor to a binary search
        for(let i = 0; i<openingData.length; i++){
            if(openingData[i].pgn == pgn){
                openingIndicator.textContent = openingData[i].eco+': '+openingData[i].name;
                break;
            }
            if(openingData[i].pgn.length > pgn.length){
                break;
            }
        }
    }
    function traverseHistory(action){
        switch(action){
            case 'undo':
                piece.undoMove();
                break;
            case 'redo':
                piece.redoMove();
                break;
            case 'start':
                while(moveHistory.length > 0){
                    piece.undoMove();
                }
                break;
            case 'end':
                while(redoData.length > 0){
                    piece.redoMove();
                }
                break;
            default:
                break;
        }
    }
    function changeSettings(){
        aiSide = !aiSide;
        aiEnabled = 2;
        aiBtn.style.backgroundImage = "";
        aiBtn.textContent = "ai";
    }
    return{makeBoard,generateGame,getHistory, generatePgn, generateImgGame, translatePgn, viewNotation, traverseHistory, getBoardData, refreshData, changeSettings}
})();

