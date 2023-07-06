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
        hasMoved: 0,
    };
    let availableMoves = {
        white: [],
        black: [],
    };
    let checkMate;
    //1 for white, 0 for black;
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
                    x:x,
                    y:y,
                    isEmpty: true,
                    tileLocation: chessBoardTileDiv,
                    pieceData:null,
                    threatData: {
                        whiteCheck: {
                            counter: 0,
                            threats: [],
                        },
                        blackCheck: {
                            counter: 0,
                            threats: [],
                        },
                    }
 
                };
                chessBoardTileDiv.textContent = TileData.threatData.isThreatened;
                chessBoardTileDiv.onclick = ()=>{
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
    };
    const clickTile =() =>{
        let oldX = movingData.oldCoords.x, oldY = movingData.oldCoords.y;
        let newX = movingData.newCoords.x, newY = movingData.newCoords.y;
        /*
        console.log(chessBoardData[newY][newX]);
        */
        //(id, oldCoords, newCoords, color) <-false for black, true for white
        //console.log(availableMoves);
        if(getMoveData(movingData.id, [oldX, oldY], [newX, newY],movingData.color)){
            movePiece([oldX, oldY], [newX, newY], movingData.id, movingData.color, movingData.hasMoved);
        }else{
            clearInfo();
        }
        
        /**/
    };

    const clearInfo = () =>{
        movingData.id = null;
        movingData.piece = null;
        movingData.oldCoords.x = null;
        movingData.oldCoords.y = null;
        movingData.newCoords.x = null;
        movingData.newCoords.y = null;
        movingData.color = null;
        movingData.hasMoved = null;
        
    };
    const refreshData = () =>{
            //its bad but it works :c
            let activePieces = [];
            availableMoves.white = [];
            availableMoves.black = []; 
            for(let y = 0; y <8; y++){
                for(let x = 0; x <8; x++){
                    chessBoardData[y][x].threatData.whiteCheck.counter = 0;
                    chessBoardData[y][x].threatData.whiteCheck.threats = [];
                    chessBoardData[y][x].threatData.blackCheck.counter = 0;
                    chessBoardData[y][x].threatData.blackCheck.threats = [];
                    chessBoardData[y][x].tileLocation.classList.remove('white-check');
                    chessBoardData[y][x].tileLocation.classList.remove('black-check');
                    if (chessBoardData[y][x].pieceData != null && chessBoardData[y][x].isEmpty == false){
                        activePieces.push(chessBoardData[y][x].pieceData);
                    }

                    
                }
            }
    
            for(let i = 0; i<activePieces.length; i++){
                getThreatData(activePieces[i].id, activePieces[i].x, activePieces[i].y, activePieces[i].color);
            }
    };

    const getThreatData = (id, x, y, color)=>{
        const changeData = (boardData) =>{
            if(color){
                boardData.threatData.whiteCheck.counter++;
                boardData.threatData.whiteCheck.threats.push(chessBoardData[y][x]);
                boardData.tileLocation.classList.add('white-check');
            }
            if(!color){
                boardData.threatData.blackCheck.counter++;
                boardData.threatData.blackCheck.threats.push(chessBoardData[y][x]);
                boardData.tileLocation.classList.add('black-check');
            }
            if(boardData.isEmpty  || ((boardData.pieceData !=null)&&(boardData.pieceData.color == !color)) ){
                if(color && id !=null&& id != 'pawn') {
                    availableMoves.white.push({
                        id:id,
                        x:x,
                        y:y,
                        hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                        move : boardData,
                    });
    
                }
                if(!color && id != null && id != 'pawn'){
                    availableMoves.black.push({
                        id:id,
                        x:x,
                        y:y,
                        hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                        move : boardData,
                    });
                }  
                //pawn
            }
            if ((boardData.pieceData !=null)&&(boardData.pieceData.color == !color) && id == 'pawn'){
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
            if (id == 'pawn'){
                if(color){
                    if((y - 1>=0)?chessBoardData[y - 1][x].isEmpty:false){
                        availableMoves.white.push({
                            id:id,
                            x:x,
                            y:y,
                            hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                            move : chessBoardData[y-1][x].pieceData,
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
                    if((y + 1 <=7)?chessBoardData[y + 1][x].isEmpty:false){
                        availableMoves.black.push({
                            id:id,
                            x:x,
                            y:y,
                            hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                            move : chessBoardData[y+1][x],
                        });
                        if((y + 2 <=7)?(chessBoardData[y+1][x].isEmpty && chessBoardData[y+2][x].isEmpty && chessBoardData[y][x].pieceData.hasMoved == 0):false){
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
                
            }
            
            
        }
            const verticalThreatData = (minY, maxY) =>{          
                    for(let currentY = y; currentY<=maxY; currentY++){    
                        if (currentY == y)continue;
                        changeData(chessBoardData[currentY][x]);    
                        if(!moveChecker.verticalChecker(y, currentY + 1, x))break;
                    }
                    for(let currentY = y; currentY>=minY; currentY--){  
                        if (currentY == y)continue;    
                        changeData(chessBoardData[currentY][x]);
                        if(!moveChecker.verticalChecker(y, currentY - 1, x))break;
                    }
            }
            const horizontalThreatData = (minX, maxX) =>{
                for(let currentX = x; currentX<=maxX; currentX++){  
                    if (currentX == x) continue;
                    changeData(chessBoardData[y][currentX]);
                    if(!moveChecker.horizontalChecker(x, currentX + 1, y))break;
                }
                for(let currentX = x; currentX>=minX; currentX--){ 
                    if (currentX == x) continue;  
                    changeData(chessBoardData[y][currentX]);
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
                for (let n = 1; n <= findLimitMax((7-x),y); n++){
                    changeData(chessBoardData[y - n][x + n]);
                    if(!moveChecker.diagonalChecker(x, (x+n) + 1, y, (y-n) - 1))break;
                }
                for (let n = 1; n <= findLimitMax((7-x),(7 - y)); n++){
                    changeData(chessBoardData[y + n][x + n]); 
                    if(!moveChecker.diagonalChecker(x, (x+n) + 1, y, (y+n) + 1))break;
                }
                for (let n = 1; n <= findLimitMax(x,(7 - y)); n++){
                    changeData(chessBoardData[y + n][x - n]);
                    if(!moveChecker.diagonalChecker(x, (x-n) - 1, y, (y+n) + 1))break;
                }
                for (let n = 1; n <= findLimitMax(x, y); n++){
                    changeData(chessBoardData[y - n][x - n]);
                    if(!moveChecker.diagonalChecker(x, (x-n) - 1, y, (y-n) - 1))break;
                }
            }
            const otherThreatData = (modX, modY) => {
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
    const movePiece = (oldCoords,newCoords,id,color, hasMoved) =>{
        let oldX = oldCoords[0], oldY = oldCoords[1];
        let newX = newCoords[0], newY = newCoords[1]; 
        let storeEat;
        if (eatChecker(newX, newY,color)){
            storeEat =  chessBoardData[newY][newX].pieceData;
            eatMove(newX, newY);
        } 

        pieceMaker(newX, newY, id, color, (hasMoved + 1));
        pieceUnmaker(oldX, oldY);
        refreshData();

        if (isKingInCheck() == true){
            undoLastMove(oldX,oldY,newX,newY ,id,color, hasMoved, storeEat);
            turnCheck = !turnCheck;
        }
        if(isKingInCheck()){
            refreshData();
            let possible;
            if(isKingInCheck() == 'white'){
                possible = availableMoves.white;
                checkmateChecker(true, possible);
            }
            if(isKingInCheck() == 'black'){
                possible = availableMoves.black;
                checkmateChecker(false, possible);
            }
            
        } 
        clearInfo();
        turnCheck = !turnCheck;
    }
    const undoLastMove = (oldX, oldY, newX, newY, id, color, hasMoved, storeEat) =>{
        pieceMaker(oldX, oldY, id, color, (hasMoved == 0?0:hasMoved - 1));
        pieceUnmaker(newX, newY);
        if(storeEat)pieceMaker(storeEat.x, storeEat.y, storeEat.id,storeEat.color, storeEat.hasMoved);
    }
    const isKingInCheck = () =>{
        for(let y = 0; y <8; y++){
            for(let x = 0; x <8; x++){
                if (chessBoardData[y][x].pieceData != null && chessBoardData[y][x].isEmpty == false){
                    if(chessBoardData[y][x].pieceData.id == 'king'){
                        if((chessBoardData[y][x].pieceData.color)&&(chessBoardData[y][x].threatData.blackCheck.counter)){
                            if (turnCheck) return true; 
                            return 'white';  
                        }
                        if((!chessBoardData[y][x].pieceData.color)&&(chessBoardData[y][x].threatData.whiteCheck.counter)){
                            if (!turnCheck) return true;
                            return 'black'
                        }
                        
                    }
                }

                
            }
        
        }
        return false;
    }
    const checkmateChecker = (color, possible) =>{
        //turnCheck = !turnCheck;
        console.log(color);
        for(let n = 0; n < possible.length; n++){
            
            let hasMoved = possible[n].hasMoved;
            let oldX = possible[n].x, oldY = possible[n].y;
            let newX = possible[n].move.x, newY = possible[n].move.y;
            let storeEat;
            if (eatChecker(newX, newY,color)){
                storeEat =  chessBoardData[newY][newX].pieceData;
                eatMove(newX, newY);
            }

            pieceMaker(newX, newY, possible[n].id, color, (hasMoved + 1));
            pieceUnmaker(oldX, oldY);
            refreshData();
            if (isKingInCheck() == false){
                undoLastMove(oldX, oldY, newX, newY, possible[n].id, color,hasMoved, storeEat);
                refreshData(); 
                console.log('safe');
                break;
            }
            
            if(n == possible.length -1){
                console.log('no here');
                //undoLastMove(oldX, oldY, newX, newY, possible[n].id, color, hasMoved, storeEat);
                checkMate = true;
                console.log('checkmate');
                //refreshData();
            } 
            undoLastMove(oldX, oldY, newX, newY, possible[n].id, color, hasMoved, storeEat);
            refreshData();
            //turnCheck = !turnCheck;*/
        }   

    }
    const getMoveData = (id, oldCoords, newCoords, color) =>{

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
        chessBoardData[y][x].pieceData = null;

        
    }
    //some eat logic
    const eatChecker = (x,y, color) =>{
        if (chessBoardData[y][x].isEmpty == false) return chessBoardData[y][x].pieceData.color == !color;
    }
    const eatMove = (x, y) =>{
        chessBoardData[y][x].tileLocation.removeChild(chessBoardData[y][x].tileLocation.lastChild);
    }

    const pieceMaker = (x, y, id, color, hasMoved) =>{    
        let piece = document.createElement('div');
        piece.classList.add('piece');
        let pieceData = {
            id: id,
            x: x,
            y: y,
            color: color,
            hasMoved: hasMoved?hasMoved:0,
        }
        piece.textContent = id;
        piece.style.backgroundColor = color?'white':'black';
        piece.style.color = !color?'white':'black';
        piece.onclick=(e) =>{
            console.log(chessBoardData[y][x]);
            if(chessBoardData[y][x].pieceData.color == turnCheck){
                e.stopPropagation();  
                if(movingData.piece == null){
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
        chessBoardData[y][x].pieceData = pieceData;
        chessBoardData[y][x].isEmpty = false;
        chessBoardData[y][x].tileLocation.append(piece);
    }

    const generateGame =()=>{
        for (let x = 0; x<8;x++){
            pieceMaker(x,6,'pawn',true);
            pieceMaker(x,1,'pawn',false);

            
        }
        pieceMaker(4,0,'king',false);
        pieceMaker(4,7,'king',true);

        pieceMaker(0,0,'rook',false);
        pieceMaker(0,7,'rook',true);
        pieceMaker(7,0,'rook',false);
        pieceMaker(7,7,'rook',true);

        pieceMaker(3,0,'queen',false);
        pieceMaker(3,7,'queen',true);

        pieceMaker(2,0,'bishop',false);
        pieceMaker(2,7,'bishop',true);
        pieceMaker(5,0,'bishop',false);
        pieceMaker(5,7,'bishop',true);

        pieceMaker(1,0,'knight',false);
        pieceMaker(1,7,'knight',true);
        pieceMaker(6,0,'knight',false);
        pieceMaker(6,7,'knight',true);
    }
    return {makeBoard,pieceMaker,generateGame};
})();
chessBoard.makeBoard();

//x y pieceID
/*chessBoard.pieceMaker(3,3,'king',false);
chessBoard.pieceMaker(0,0, 'king',false);
chessBoard.pieceMaker(1,1, 'pawn',false);
chessBoard.pieceMaker(0,1, 'pawn',false);
chessBoard.pieceMaker(5,4,'queen',true);
chessBoard.pieceMaker(2,2,'pawn',true);
chessBoard.pieceMaker(1 ,2,'pawn',true);
chessBoard.pieceMaker(2,3,'queen',false);
chessBoard.pieceMaker(6,5,'bishop',true);
chessBoard.pieceMaker(0,6,'knight',false);
chessBoard.pieceMaker(3,3,'pawn',false);
chessBoard.pieceMaker(2,4, 'pawn',true);
chessBoard.pieceMaker(3,7, 'queen',true);
*/


chessBoard.generateGame();