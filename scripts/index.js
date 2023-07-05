const gameBoard = document.getElementById('game-board');
const chessBoard =(()=>{
    let chessBoardData = [];
    let movingData = {
        id: null,
        piece: null,
        oldCoords: {
            x: null,
            y: null,
        },
        newCoords: {
            x:null,
            y:null,
        },
        color: null,
        hasMoved: null,
    };
    let turnCheck = 1;
    //creates board element
    const makeBoard = () =>{
        while (gameBoard.hasChildNodes()) {
            gameBoard.removeChild(gameBoard.lastChild);
          }
        
        for(let y = 0; y < 8; y++){
            let chessBoardTileContainer = document.createElement('div');
            chessBoardTileContainer.classList.add('tile-container');
            let chessBoardTileData = [];
            for(let x = 0; x < 8; x++){
                
                let chessBoardTileDiv = document.createElement('div');
                chessBoardTileDiv.classList.add('tile');
                chessBoardTileDiv.style.backgroundColor = (((y+1) + (x+1))%2?'rgb(118,150,86)':'rgb(238,238,210');
                //object for easier data manipulation
                let TileData ={
                    isEmpty: true,
                    tileLocation: chessBoardTileDiv,
                    pieceData:null,
                    threatData: {
                        whiteCheck: false,
                        blackCheck: false,
                    }
 
                };
                chessBoardTileDiv.textContent = TileData.threatData.isThreatened;
                chessBoardTileDiv.onclick = ()=>{
                    console.log('click');
                    movingData.newCoords.x = x;
                    movingData.newCoords.y = y;
                    clickTile();
                }
                chessBoardTileContainer.append(chessBoardTileDiv);
                chessBoardTileData.push(TileData);
            }
            gameBoard.append(chessBoardTileContainer);
            chessBoardData.push(chessBoardTileData);
        }
    }
    const clickTile =() =>{
        let oldX = movingData.oldCoords.x, oldY = movingData.oldCoords.y;
        let newX = movingData.newCoords.x, newY = movingData.newCoords.y;
        console.log(movingData.id);
        console.log('move from: '+oldX+':'+oldY);
        console.log('move to: '+newX+':'+newY);
        console.log(chessBoardData[newY][newX]);
        
        //(id, oldCoords, newCoords, color) <-false for black, true for white
        console.log();
        console.log('valid move: '+getMoveData(movingData.id, [oldX, oldY], [newX, newY],movingData.color));
        
        if(getMoveData(movingData.id, [oldX, oldY], [newX, newY],movingData.color)){

            movePiece([oldX, oldY], [newX, newY], movingData.id, movingData.color);
        }else{
            clearInfo();
        }
        
        /**/
    }

    const clearInfo = () =>{
        movingData.id = null;
        movingData.piece = null;
        movingData.oldCoords.x = null;
        movingData.oldCoords.y = null;
        movingData.newCoords.x = null;
        movingData.newCoords.y = null;
        
    }
    //could use a refactor, but for now works.
    let activePieces = [];
    const refreshData = () =>{
            //its bad but it works :c
            
            for(let y = 0; y <8; y++){
                for(let x = 0; x <8; x++){
                    chessBoardData[y][x].threatData.whiteCheck = false;
                    chessBoardData[y][x].threatData.blackCheck = false;
                    chessBoardData[y][x].tileLocation.classList.remove('white-check');
                    chessBoardData[y][x].tileLocation.classList.remove('black-check');
                    if (chessBoardData[y][x].pieceData != null && chessBoardData[y][x].isEmpty == false){
                        activePieces.push(chessBoardData[y][x].pieceData);
                    }
                    
                }
            } console.log(activePieces);
    
            for(let i = 0; i<activePieces.length; i++){
                getThreatData(activePieces[i].id, activePieces[i].x, activePieces[i].y, activePieces[i].color);
            }
            activePieces = [];
    }
    const getThreatData = (id, x, y, color)=>{
            const verticalThreatData = (minY, maxY) =>{          
                    for(let currentY = y; currentY<=maxY; currentY++){     
                        if(color){
                            chessBoardData[currentY][x].threatData.whiteCheck = true;
                            chessBoardData[currentY][x].tileLocation.classList.add('white-check');
                        } 
                        if(!color){
                            chessBoardData[currentY][x].threatData.blackCheck = true;
                            chessBoardData[currentY][x].tileLocation.classList.add('black-check');
                        } 
                        if(!moveChecker.verticalChecker(y, currentY + 1, x))break;
                    }
                    for(let currentY = y; currentY>=minY; currentY--){      
                        if(color) {
                            chessBoardData[currentY][x].threatData.whiteCheck = true;
                            chessBoardData[currentY][x].tileLocation.classList.add('white-check');
                        }
                        if(!color){
                            chessBoardData[currentY][x].threatData.blackCheck = true;
                            chessBoardData[currentY][x].tileLocation.classList.add('black-check');
                        } 
                        if(!moveChecker.verticalChecker(y, currentY - 1, x))break;
                    }
            }
            const horizontalThreatData = (minX, maxX) =>{
                for(let currentX = x; currentX<=maxX; currentX++){  
                    if(color){
                        chessBoardData[y][currentX].threatData.whiteCheck = true;
                        chessBoardData[y][currentX].tileLocation.classList.add('white-check');
                    } 
                    if(!color){
                        chessBoardData[y][currentX].threatData.blackCheck = true;
                        chessBoardData[y][currentX].tileLocation.classList.add('black-check');
                    } 
                    if(!moveChecker.horizontalChecker(x, currentX + 1, y))break;
                }
                for(let currentX = x; currentX>=minX; currentX--){  
                        
                    if(color){
                        chessBoardData[y][currentX].threatData.whiteCheck = true;
                        chessBoardData[y][currentX].tileLocation.classList.add('white-check');
                    } 
                    if(!color){
                        chessBoardData[y][currentX].threatData.blackCheck = true;
                        chessBoardData[y][currentX].tileLocation.classList.add('black-check');
                    } 
                    if(!moveChecker.horizontalChecker(x, currentX - 1, y))break;
                }
            }
            const diagonalThreatData = ()=>{
                const findLimitMax = (x, y) =>{
                    let limitMax = 0;
                    if(x < y) limitMax = x;
                    else if (x >  y) limitMax = y;
                    else if(x = y) limitMax = x;
                    return limitMax;
                }
                for (let n = 0; n <= findLimitMax((7-x),y); n++){
                    if(color){
                        chessBoardData[y - n][x + n].threatData.whiteCheck = true;
                        chessBoardData[y - n][x + n].tileLocation.classList.add('white-check');
                        
                    }
                    if(!color){
                        chessBoardData[y - n][x + n].threatData.blackCheck = true;
                        chessBoardData[y - n][x + n].tileLocation.classList.add('black-check');
                    } 
                    if(!moveChecker.diagonalChecker(x, (x+n) + 1, y, (y-n) - 1))break;
                }
                for (let n = 0; n <= findLimitMax((7-x),(7 - y)); n++){
                    if(color){
                        chessBoardData[y + n][x + n].threatData.whiteCheck = true;
                        chessBoardData[y + n][x + n].tileLocation.classList.add('white-check');
                        
                    }
                    if(!color){
                        chessBoardData[y + n][x + n].threatData.blackCheck = true;
                        chessBoardData[y + n][x + n].tileLocation.classList.add('black-check');
                    } 
                    if(!moveChecker.diagonalChecker(x, (x+n) + 1, y, (y+n) + 1))break;
                }
                for (let n = 0; n <= findLimitMax(x,(7 - y)); n++){
                    if(color){
                        chessBoardData[y + n][x - n].threatData.whiteCheck = true;
                        chessBoardData[y + n][x - n].tileLocation.classList.add('white-check');
                        
                    }
                    if(!color){
                        chessBoardData[y + n][x - n].threatData.blackCheck = true;
                        chessBoardData[y + n][x - n].tileLocation.classList.add('black-check');
                    } 
                    if(!moveChecker.diagonalChecker(x, (x-n) - 1, y, (y+n) + 1))break;
                }
                for (let n = 0; n <= findLimitMax(x, y); n++){
                    if(color){
                        chessBoardData[y - n][x - n].threatData.whiteCheck = true;
                        chessBoardData[y - n][x - n].tileLocation.classList.add('white-check');
                        
                    }
                    if(!color){
                        chessBoardData[y - n][x - n].threatData.blackCheck = true;
                        chessBoardData[y - n][x - n].tileLocation.classList.add('black-check');
                    } 
                    if(!moveChecker.diagonalChecker(x, (x-n) - 1, y, (y-n) - 1))break;
                }
            }
            const otherThreatData = (modX, modY) => {
                if((x + modX) <= 7 && (y - modY) >= 0){
                    if (color){
                        chessBoardData[y - modY][x + modX].threatData.whiteCheck = true;    
                        chessBoardData[y - modY][x + modX].tileLocation.classList.add('white-check');
                    }
                    if (!color && (id == 'knight' || id == 'king')){
                        chessBoardData[y - modY][x + modX].threatData.blackCheck = true;    
                        chessBoardData[y - modY][x + modX].tileLocation.classList.add('black-check');
                    }
                    
                }
                if((x - modX) >=0 && (y + modY) <=7){
                    if(color && (id == 'knight' || id == 'king')){
                        chessBoardData[y + modY][x - modX].threatData.whiteCheck = true;   
                        chessBoardData[y + modY][x - modX].tileLocation.classList.add('white-check');
                    }
                    if(!color){
                        chessBoardData[y + modY][x - modX].threatData.blackCheck = true;   
                        chessBoardData[y + modY][x - modX].tileLocation.classList.add('black-check');
                    }
    
    
                }
                if((x-modX)>= 0 && (y-modY)>=0){
                    if (color){
                        chessBoardData[y - modY][x - modX].threatData.whiteCheck = true;
                        chessBoardData[y - modY][x - modX].tileLocation.classList.add('white-check');
                    }
                    if (!color && (id == 'knight' || id == 'king')){
                        chessBoardData[y - modY][x - modX].threatData.blackCheck = true;
                        chessBoardData[y - modY][x - modX].tileLocation.classList.add('black-check');
                    }
                }
    
                if((x+modX)<=7 &&(y+modY)<=7){
                    if(color && (id == 'knight' || id == 'king')){
                        chessBoardData[y + modY][x + modX].threatData.whiteCheck = true;
                        chessBoardData[y + modY][x + modX].tileLocation.classList.add('white-check');
                    }
                    if(!color){
                        chessBoardData[y + modY][x + modX].threatData.blackCheck = true;
                        chessBoardData[y + modY][x + modX].tileLocation.classList.add('black-check');
                    }
                    
                }
    
                if((x+modY)<=7 && (y+modX)<=7){
                    if(color && id == 'knight'){
                        chessBoardData[y + modX][x + modY].threatData.whiteCheck = true;
                        chessBoardData[y + modX][x + modY].tileLocation.classList.add('white-check');
                    }
                    if(!color &&id == 'knight'){
                        chessBoardData[y + modX][x + modY].threatData.blackCheck = true;
                        chessBoardData[y + modX][x + modY].tileLocation.classList.add('black-check');
                    }
                }
                if((x+modY)<=7 && (y-modX)>=0){
                    if(color && id == 'knight'){
                        chessBoardData[y - modX][x + modY].threatData.whiteCheck = true;
                        chessBoardData[y - modX][x + modY].tileLocation.classList.add('white-check');
                    }
                    if(!color &&id == 'knight'){
                        chessBoardData[y - modX][x + modY].threatData.blackCheck = true;
                        chessBoardData[y - modX][x + modY].tileLocation.classList.add('black-check');
                    }
                }
                if((x-modY)>=0 && (y-modX)>=0){
                    if(color && id == 'knight'){
                        chessBoardData[y - modX][x - modY].threatData.whiteCheck = true;
                        chessBoardData[y - modX][x - modY].tileLocation.classList.add('white-check');
                    }
                    if(!color &&id == 'knight'){
                        chessBoardData[y - modX][x - modY].threatData.blackCheck = true;
                        chessBoardData[y - modX][x - modY].tileLocation.classList.add('black-check');
                    }
                }
                if((x-modY)>=0 && (y+modX)<=7){
                    if(color && id == 'knight'){
                        chessBoardData[y + modX][x - modY].threatData.whiteCheck = true;
                        chessBoardData[y + modX][x - modY].tileLocation.classList.add('white-check');
                    }
                    if(!color &&id == 'knight'){
                        chessBoardData[y + modX][x - modY].threatData.blackCheck = true;
                        chessBoardData[y + modX][x - modY].tileLocation.classList.add('black-check');
                    }
                }
    
                
            }
    
            switch(id){
                //SHOULD REALLY REFACTOR, BUT FOR NOW WORKS OK//
                /*!IMPORTANT, +1/-1 MUST BE ADDED TO CHECKERS BCS I AM DUMB*/
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
            }
    }

    //move logic
    const moveChecker = (()=>{
        const horizontalChecker = (oldX, newX, y) =>{
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
        const verticalChecker = (oldY, newY, x) => {
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
        const diagonalChecker = (oldX, newX, oldY, newY) =>{
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
        const horseChecker = (newX, newY,color) =>{
            let allowHorse = true;
            if (eatChecker(newX,newY,color)) return true;
            if(chessBoardData[newY][newX].isEmpty == false){
                allowHorse = false;
            }
            return allowHorse;
        }
        const kingChecker =(newX,newY,color) =>{
            let allowKing = true;
            if (eatChecker(newX,newY,color)) return true;
            if(chessBoardData[newY][newX].isEmpty == false) allowKing = false;
            return allowKing;
        }
        return{
            horizontalChecker, 
            verticalChecker, 
            diagonalChecker,
            horseChecker,
            kingChecker
        }
    })();
    const movePiece = (oldCoords,newCoords,id,color) =>{
        let oldX = oldCoords[0], oldY = oldCoords[1];
        let newX = newCoords[0], newY = newCoords[1];
        if (eatChecker(newX, newY,color)) eatMove(newX, newY);
        pieceMaker(newX, newY, id, color, true);
        pieceUnmaker(oldX, oldY);
        refreshData();
        undoInfo(oldX, oldY, newX, newY, id, color);
        clearInfo();
    }
    const undoInfo = (oldX, oldY, newX, newY, id, color) =>{
        console.log('Previous Coordinates: '+oldX+':'+oldY);
        console.log('New Coordinates: '+newX+':'+newY);
        console.log('id: '+id+' color :'+color);
        console.log(!turnCheck);
    }
    const getMoveData = (id, oldCoords, newCoords, color) =>{
        //move ranges console.log(id, oldCoords, newCoords);
        //moveX [left, right]
        //moveY [up, down]
        //allows for adding more flags
        let allowMove = false;
        let oldX = oldCoords[0], oldY = oldCoords[1];
        let newX = newCoords[0], newY = newCoords[1];
        let hasMoved = movingData.hasMoved;
        //move data
        switch (id){
            case 'pawn':
                //only move up OR down depending on the color of the piece
                if(oldX == newX && (color?oldY-1:oldY+1) == newY){
                    allowMove = true;
                    if(chessBoardData[newY][newX].isEmpty == false) allowMove = false;
                }
                if((oldX + 1 == newX || oldX - 1 == newX ) && (color?(oldY - 1 == newY):(oldY + 1 == newY))){
                    if(eatChecker(newX,newY,color)){
                        allowMove = true;
                    }
                    
                }
                if (!hasMoved){
                    if(oldX == newX && (color?oldY-2:oldY+2) == newY){
                        allowMove = true;
                        if (oldY < newY){
                            for(let y = oldY; y < newY; y++){
                                if(y == oldY) continue;
                                if(chessBoardData[y][newX].isEmpty == false) allowMove = false;
                            }
                            
                        }
                        if (oldY > newY){
                            for(let y = oldY; y > newY; y--){
                                if(y == oldY) continue;
                                if(chessBoardData[y][newX].isEmpty == false) allowMove = false;
                            }
                        }
                        
                    }
                }
                
                return allowMove;
            case 'rook':
                /*either vertical OR horizontal movement*/
                if((oldX == newX && oldY != newY)||(oldX != newX && oldY == newY)){
                    //check if something is blocking horizontal or vertical movement
                    if((oldX != newX && oldY == newY)){
                        allowMove = moveChecker.horizontalChecker(oldX, newX, oldY);
                        
                    }
                    if((oldX == newX && oldY != newY)){
                        allowMove = moveChecker.verticalChecker(oldY, newY, oldX);
                        
                    }
                    console.log(newX,newY);
                }
                return allowMove;
            case 'bishop':
                if(newX > oldX){
                    for (let n = 1; n<=(newX - oldX); n++){
                        if  (newX == oldX + n && newY == oldY - n) allowMove = moveChecker.diagonalChecker(oldX, newX, oldY, newY);
                        if  (newX == oldX + n && newY == oldY + n) allowMove = moveChecker.diagonalChecker(oldX, newX, oldY, newY);
                    }
                }
                if(newX < oldX){
                    for (let n = 1; n<=(oldX - newX); n++){
                        if  (newX == oldX - n && newY == oldY + n) allowMove = moveChecker.diagonalChecker(oldX, newX, oldY, newY);
                        if  (newX == oldX - n && newY == oldY - n) allowMove = moveChecker.diagonalChecker(oldX, newX, oldY, newY);
                    }
                }
                return allowMove;
            case 'knight':
                if(oldY == newY + 2||oldY == newY - 2){
                    if(oldX == newX + 1||oldX == newX - 1){
                        allowMove = moveChecker.horseChecker(newX,newY,color);
                    }
                }
                if(oldX == newX + 2 ||oldX == newX - 2){
                    if(oldY == newY + 1||oldY == newY - 1){
                        allowMove = moveChecker.horseChecker(newX,newY,color);
                    }
                }
                return allowMove;
            case 'queen':
                /*either vertical OR horizontal movement*/
                if((oldX == newX && oldY != newY)||(oldX != newX && oldY == newY)){
                    //check if something is blocking horizontal or vertical movement
                    if((oldX != newX && oldY == newY)){
                        allowMove = moveChecker.horizontalChecker(oldX, newX, oldY);
                    }
                    if((oldX == newX && oldY != newY)){
                        allowMove = moveChecker.verticalChecker(oldY, newY, oldX);
                    }
                }
                if(newX > oldX){
                    for (let n = 1; n<=(newX - oldX); n++){
                        if  (newX == oldX + n && newY == oldY - n) allowMove = moveChecker.diagonalChecker(oldX, newX, oldY, newY);
                        if  (newX == oldX + n && newY == oldY + n) allowMove = moveChecker.diagonalChecker(oldX, newX, oldY, newY);
                    }
                }
                if(newX < oldX){
                    for (let n = 1; n<=(oldX - newX); n++){
                        if  (newX == oldX - n && newY == oldY + n) allowMove = moveChecker.diagonalChecker(oldX, newX, oldY, newY);
                        if  (newX == oldX - n && newY == oldY - n) allowMove = moveChecker.diagonalChecker(oldX, newX, oldY, newY);
                    }
                }
                return allowMove;
                
            case 'king':
                if((oldX == newX && (oldY == newY + 1||oldY == newY - 1))
                ||((oldX == newX + 1 || oldX == newX - 1) && oldY == newY)){
                    allowMove = moveChecker.kingChecker(newX,newY,color);
                }
                if((oldX + 1 == newX && (oldY - 1 == newY || oldY + 1 == newY))
                ||(oldX - 1 == newX && (oldY -1 == newY || oldY +1 == newY))){
                    allowMove = moveChecker.kingChecker(newX,newY,color);
                }
                //castling logic
                //could use a refactor
                if(!hasMoved && moveChecker.kingChecker(newX,newY,color) && moveChecker.horizontalChecker(oldX,newX,oldY) &&
                 ((newX == oldX + 2 && oldY == newY)||(newX == oldX - 2 && oldY == newY))){
                    console.log('tick');

                    if(chessBoardData[oldY][oldX + 3].pieceData != null &&chessBoardData[oldY][oldX + 3].pieceData.id == 'rook'){
                        rightRook = chessBoardData[oldY][oldX + 3].pieceData;
                        if((newX == oldX + 2 && oldY == newY)
                        &&(rightRook.color == color)
                        &&(rightRook.hasMoved == false)){
                            movePiece([oldX,oldY],[newX,newY],id,color);
                            movePiece([oldX + 3, oldY],[oldX + 1, oldY], rightRook.id, rightRook.color);
                        turnCheck = !turnCheck;
                        }
                    }
                    if(chessBoardData[oldY][oldX - 4].pieceData != null && chessBoardData[oldY][oldX - 4].pieceData.id == 'rook'){
                        leftRook = chessBoardData[oldY][oldX - 4].pieceData;
                        if((newX == oldX - 2 && oldY == newY)
                        &&(leftRook.color == color)
                        &&(leftRook.hasMoved == false)){
                        movePiece([oldX,oldY],[newX,newY],id,color);
                        movePiece([oldX - 4, oldY],[oldX - 1, oldY], leftRook.id, leftRook.color);
                        turnCheck = !turnCheck;
                        }
                    }   
                }

                return allowMove;
                default:
                    return allowMove;

            }
    }
    const pieceUnmaker = (x, y) =>{
        chessBoardData[y][x].tileLocation.removeChild(chessBoardData[y][x].tileLocation.lastChild);
        chessBoardData[y][x].isEmpty = true;
        turnCheck = !turnCheck;
    }
    //some eat logic
    const eatChecker = (x,y, color) =>{
        if (chessBoardData[y][x].isEmpty == false) return chessBoardData[y][x].pieceData.color == !color;
    }
    const eatMove = (x, y) =>{
        chessBoardData[y][x].tileLocation.removeChild(chessBoardData[y][x].tileLocation.lastChild);
    }
    const pieceMaker = (x, y, id, color,hasMoved) =>{
        
        let piece = document.createElement('div');
        piece.classList.add('piece');

        let pieceData = {
            id: id,
            x: x,
            y: y,
            color: color,
            hasMoved: hasMoved?hasMoved:false,
        }
        piece.textContent = id;
        piece.style.backgroundColor = color?'white':'black';
        piece.style.color = !color?'white':'black';
;
        piece.onclick=(e) =>{
            if(chessBoardData[y][x].pieceData.color == turnCheck){
                e.stopPropagation();  
                if(movingData.piece == null){
                    console.log(chessBoardData);
                    setData();
                } else{
                    clearInfo();
                }
            }else{
                console.log('not your turn');
            }

        }
        const setData = ()=>{
            movingData.id = id;
            movingData.piece = piece;
            movingData.oldCoords.x = pieceData.x;
            movingData.oldCoords.y = pieceData.y;
            movingData.color = pieceData.color;
            movingData.hasMoved = pieceData.hasMoved;
        }
        getThreatData(id, x, y, color);
        chessBoardData[y][x].pieceData = pieceData;
        chessBoardData[y][x].isEmpty = false;
        chessBoardData[y][x].tileLocation.append(piece);
        refreshData();
    }

    const generateGame =()=>{
        for (let x = 0; x<8;x++){
            pieceMaker(x,6,'pawn',true);
            pieceMaker(x,1,'pawn',false);
        }
    }
    return {makeBoard,pieceMaker,generateGame};
})();
chessBoard.makeBoard();
//x y pieceID
chessBoard.pieceMaker(3,3,'king',false);
chessBoard.pieceMaker(4,7, 'king',true);
//chessBoard.pieceMaker(0,7,'rook',true);
//chessBoard.pieceMaker(2,5,'knight',false);
//chessBoard.pieceMaker(2,4,'queen',false);
//chessBoard.pieceMaker(2,6,'bishop',false);
/*chessBoard.pieceMaker(0,6,'knight',false);
chessBoard.pieceMaker(3,3,'pawn',false);
chessBoard.pieceMaker(2,4, 'pawn',true);
chessBoard.pieceMaker(3,7, 'queen',true);


*/
//chessBoard.generateGame();