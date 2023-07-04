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
 
                };
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
    }
    const clickTile =() =>{
        let oldX = movingData.oldCoords.x, oldY = movingData.oldCoords.y;
        let newX = movingData.newCoords.x, newY = movingData.newCoords.y;
        console.log(movingData.id);
        console.log('move from: '+oldX+':'+oldY);
        console.log('move to: '+newX+':'+newY);
        //(id, oldCoords, newCoords, color) <-false for black, true for white
        
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
    const moveChecker = (()=>{
        const horizontalChecker = (oldX, newX, y) =>{
            let allowHorizontal = true;
            if (oldX < newX){
                for(let x = oldX; x <= newX; x++){
                    if(x == oldX) continue;
                    if(chessBoardData[y][x].isEmpty == false) allowHorizontal = false;
                }
                return allowHorizontal;
            }
            if (oldX > newX){
                for(let x = oldX; x >= newX; x--){
                    if(x == oldX) continue;
                    if(chessBoardData[y][x].isEmpty == false) allowHorizontal = false;
                }
                return allowHorizontal;
            }
        }
        const verticalChecker = (oldY, newY, x) => {
            let allowVertical = true;
            if (oldY < newY){
                for(let y = oldY; y <= newY; y++){
                    if(y == oldY) continue;
                    if(chessBoardData[y][x].isEmpty == false) allowVertical = false;
                }
                return allowVertical;
            }
            if (oldY > newY){
                for(let y = oldY; y >= newY; y--){
                    if(y == oldY) continue;
                    if(chessBoardData[y][x].isEmpty == false) allowVertical = false;
                }
                return allowVertical;
            }
        }
        const diagonalChecker = (oldX, newX, oldY, newY) =>{
            let allowDiagonal = true;
            if(newX > oldX){
                for (let n = 1; n<=(newX - oldX); n++){
    
                    if(newY<oldY){
                        if(chessBoardData[oldY - n][oldX + n].isEmpty == false) allowDiagonal = false;
                        
                    }
                    if(newY>oldY){
                        if(chessBoardData[oldY + n][oldX + n].isEmpty == false) allowDiagonal = false;
                    }
                }
            }
            if(newX < oldX){
                for (let n = 1; n<=(oldX - newX); n++){
                    if(newY<oldY){
                        if(chessBoardData[oldY - n][oldX - n].isEmpty == false) allowDiagonal = false;
                    }
                    if(newY>oldY){
                        if(chessBoardData[oldY + n][oldX + n].isEmpty == false) allowDiagonal = false;
                    }
                }
            }
            return allowDiagonal;
    
        }
        const horseChecker = (newX, newY) =>{
            let allowHorse = true;
            if(chessBoardData[newY][newX].isEmpty == false) allowHorse = false;
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
                console.log(hasMoved);
                if(oldX == newX && (color?oldY-1:oldY+1) == newY){
                    allowMove = moveChecker.verticalChecker(oldY,newY,oldX);
                }
                if (!hasMoved){
                    if(oldX == newX && (color?oldY-2:oldY+2) == newY){
                        allowMove = moveChecker.verticalChecker(oldY,newY,oldX);
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
                        allowMove = moveChecker.horseChecker(newX,newY);
                    }
                }
                if(oldX == newX + 2 ||oldX == newX - 2){
                    if(oldY == newY + 1||oldY == newY - 1){
                        allowMove = moveChecker.horseChecker(newX,newY);
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
                return allowMove;
                default:
                    return allowMove;

            }
    }
    const movePiece = (oldCoords,newCoords,id,color) =>{
        let oldX = oldCoords[0], oldY = oldCoords[1];
        let newX = newCoords[0], newY = newCoords[1];
        pieceMaker(newX, newY, id, color, true);
        pieceUnmaker(oldX, oldY);
        clearInfo();
    }
    const pieceUnmaker = (x, y) =>{
        chessBoardData[y][x].tileLocation.removeChild(chessBoardData[y][x].tileLocation.lastChild);
        chessBoardData[y][x].isEmpty = true;
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
            e.stopPropagation();
            
            if (movingData.piece == null){
                movingData.id = id;
                movingData.piece = piece;
                movingData.oldCoords.x = pieceData.x;
                movingData.oldCoords.y = pieceData.y;
                movingData.color = pieceData.color;
                movingData.hasMoved = pieceData.hasMoved;
            }else{
                clearInfo();
            }/*
            movingData.id = id;
            movingData.piece = piece;
            movingData.oldCoords.x = pieceData.x;
            movingData.oldCoords.y = pieceData.y;
            movingData.color = pieceData.color;
            movingData.hasMoved = pieceData.hasMoved;
*/

        }
        chessBoardData[y][x].isEmpty = false;
        chessBoardData[y][x].tileLocation.append(piece);
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
chessBoard.pieceMaker(0,6,'bishop',true);
chessBoard.pieceMaker(0,5,'bishop',true);
chessBoard.pieceMaker(4,3,'pawn',false);
chessBoard.pieceMaker(2,4, 'pawn',true);
chessBoard.pieceMaker(3,4, 'queen',true);
chessBoard.pieceMaker(1,7, 'knight',true);
chessBoard.pieceMaker(3,6, 'king',true);
/*
chessBoard.generateGame();*/