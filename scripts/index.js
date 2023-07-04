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
   

    
  
    //some eat logic
    const eatChecker = (x,y, color) =>{
        if (chessBoardData[y][x].isEmpty == false) return chessBoardData[y][x].pieceData.color == !color;
    }
    const eatMove = (x, y) =>{
        chessBoardData[y][x].tileLocation.removeChild(chessBoardData[y][x].tileLocation.lastChild);
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
        const kingChecker =(newX,newY) =>{
            let allowKing = true;
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
        clearInfo();
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
                    allowMove = moveChecker.kingChecker(newX,newY);
                }
                if((oldX + 1 == newX && (oldY - 1 == newY || oldY + 1 == newY))
                ||(oldX - 1 == newX && (oldY -1 == newY || oldY +1 == newY))){
                    allowMove = moveChecker.kingChecker(newX,newY);
                }
                //castling logic
                if(!hasMoved && moveChecker.kingChecker(newX,newY) && moveChecker.horizontalChecker(oldX,newX,oldY)){
                    let leftRook = chessBoardData[oldY][oldX - 4].pieceData;
                    let rightRook = chessBoardData[oldY][oldX + 3].pieceData;
                    if((newX == oldX + 2 && oldY == newY)
                    &&(rightRook.id == 'rook')
                    &&(rightRook.color == color)
                    &&(rightRook.hasMoved == false)){
                        movePiece([oldX,oldY],[newX,newY],id,color);
                        movePiece([oldX + 3, oldY],[oldX + 1, oldY], rightRook.id, rightRook.color);
                        turnCheck = !turnCheck;
                    }
                    
                    if((newX == oldX - 2 && oldY == newY)
                    &&(leftRook.id == 'rook')
                    &&(leftRook.color == color)
                    &&(leftRook.hasMoved == false)){
                        movePiece([oldX,oldY],[newX,newY],id,color);
                        movePiece([oldX - 4, oldY],[oldX - 1, oldY], rightRook.id, rightRook.color);
                        turnCheck = !turnCheck;
                    }
                }
                return allowMove;
                default:
                    return allowMove;

            }
    }
    //could use a refactor, but for now works.
    let activePieces = [];
    const refreshData = () =>{
        //its bad but it works :c
        
        for(let y = 0; y <8; y++){
            for(let x = 0; x <8; x++){
                chessBoardData[y][x].threatData.whiteCheck = false;
                chessBoardData[y][x].threatData.blackCheck = false;
                chessBoardData[y][x].tileLocation.style.border = 'none';
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
        switch(id){
            /*!IMPORTANT, +1/-1 MUST BE ADDED TO CHECKERS BCS I AM DUMB*/
            case 'queen':
                
                //vertical threat data
                for(let currentY = y; currentY<=7; currentY++){     
                    if(color == true) chessBoardData[currentY][x].threatData.whiteCheck = true;
                    if(color == false) chessBoardData[currentY][x].threatData.blackCheck = true;
                    chessBoardData[currentY][x].tileLocation.style.border = 'solid';
                    if(!moveChecker.verticalChecker(y, currentY + 1, x))break;
                }
                for(let currentY = y; currentY>=0; currentY--){  
                    
                    if(color == true) chessBoardData[currentY][x].threatData.whiteCheck = true;
                    if(color == false) chessBoardData[currentY][x].threatData.blackCheck = true;
                    chessBoardData[currentY][x].tileLocation.style.border = 'solid';
                    if(!moveChecker.verticalChecker(y, currentY - 1, x))break;
                }
                //horizontal threat data
                for(let currentX = x; currentX<=7; currentX++){  
                    
                    if(color == true) chessBoardData[y][currentX].threatData.whiteCheck = true;
                    if(color == false) chessBoardData[y][currentX].threatData.blackCheck = true;
                    chessBoardData[y][currentX].tileLocation.style.border = 'solid';
                    if(!moveChecker.horizontalChecker(x, currentX + 1, y))break;

                }
                for(let currentX = x; currentX>=0; currentX--){  
                    
                    if(color == true) chessBoardData[y][currentX].threatData.whiteCheck = true;
                    if(color == false) chessBoardData[y][currentX].threatData.blackCheck = true;
                    chessBoardData[y][currentX].tileLocation.style.border = 'solid';
                    if(!moveChecker.horizontalChecker(x, currentX - 1, y))break;
                }
                
        }
    }
    const pieceUnmaker = (x, y) =>{
        chessBoardData[y][x].tileLocation.removeChild(chessBoardData[y][x].tileLocation.lastChild);
        chessBoardData[y][x].isEmpty = true;
        turnCheck = !turnCheck;
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
            pieceMaker(x,6,'pawn');
        }
        pieceMaker(0,7,'rook');
        pieceMaker(7,7,'rook');
    }
    return {makeBoard,pieceMaker,generateGame};
})();
chessBoard.makeBoard();
//x y pieceID
chessBoard.pieceMaker(3,3,'queen',true);
chessBoard.pieceMaker(2,4,'queen',false);
chessBoard.pieceMaker(2,6,'bishop',false);
/*chessBoard.pieceMaker(0,6,'knight',false);
chessBoard.pieceMaker(3,3,'pawn',false);
chessBoard.pieceMaker(2,4, 'pawn',true);
chessBoard.pieceMaker(3,7, 'queen',true);
chessBoard.pieceMaker(7,7,'rook',true);
chessBoard.pieceMaker(4,7, 'king',true);
/*
chessBoard.generateGame();*/