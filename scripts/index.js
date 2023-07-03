const gameBoard = document.getElementById('game-board');
const chessBoard =(()=>{

    let chessBoardData = [];
    let tempHolder = [];
    let isMoving = false;

    let movingData = {
        id: null,
        piece: null,
        x: null,
        y: null
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
                    
                    console.log(movingData.id);
                    console.log('move from: '+movingData.x+':'+movingData.y);
                    console.log('move to: '+x+':'+y);
                    //(id, oldCoords, newCoords, color) <-false for black, true for white
                    
                    console.log(getMoveData(movingData.id, [movingData.x,movingData.y], [x,y],true));
                    /**/
                    if(getMoveData(movingData.id, [movingData.x,movingData.y], [x,y],true)){
                        movePiece([movingData.x,movingData.y], [x,y], movingData.id);
                    }else{
                        clearInfo();
                    }
                    
                }
                chessBoardTileContainer.append(chessBoardTileDiv);
                chessBoardTileData.push(TileData);
            }
            gameBoard.append(chessBoardTileContainer);
            chessBoardData.push(chessBoardTileData);
        }
    }
    const clearInfo = () =>{
        movingData.id = null;
        movingData.piece = null;
        movingData.x = null;
        movingData.y = null;
    }
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
        /*if(newX > oldX){
            for (let n = 1; n<=(newX - oldX); n++){
                if(newY>oldY){
                    if(chessBoardData[oldY - n][oldX + n].isEmpty == false) allowDiagonal = false;
                }
                if(newY<oldY){
                    if(chessBoardData[oldY + n][oldX + n].isEmpty == false) allowDiagonal = false;
                }
            }
        }
        if(newX < oldX){
            for (let n = 1; n<=(oldX - newX); n++){
                if(n == oldX) continue;
                if(newY>oldY){
                    if(chessBoardData[oldY - n][oldX - n].isEmpty == false) allowDiagonal = false;
                }
                if(newY<oldY){
                    if(chessBoardData[oldY + n][oldX + n].isEmpty == false) allowDiagonal = false;
                }
            }
        } */
        return allowDiagonal;

    }
    const getMoveData = (id, oldCoords, newCoords, color) =>{
        //move ranges console.log(id, oldCoords, newCoords);
        //moveX [left, right]
        //moveY [up, down]
        //allows for adding more flags
        let allowMove = false;
        let oldX = oldCoords[0], oldY = oldCoords[1];
        let newX = newCoords[0], newY = newCoords[1];
        switch (id){
            case 'pawn':
                //only move up OR down depending on the color of the piece
                if(oldX == newX && (color?oldY-1:oldY+1) == newY){
                    allowMove = verticalChecker(oldY,newY,oldX);
                }
                return allowMove;
            case 'rook':
                /*either vertical OR horizontal movement*/
                if((oldX == newX && oldY != newY)||(oldX != newX && oldY == newY)){
                    //check if something is blocking horizontal or vertical movement
                    if((oldX != newX && oldY == newY)){
                        allowMove = horizontalChecker(oldX, newX, oldY);
                    }
                    if((oldX == newX && oldY != newY)){
                        allowMove = verticalChecker(oldY, newY, oldX);
                    }
                }
                return allowMove;
            case 'bishop':
                if(newX > oldX){
                    for (let n = 1; n<=(newX - oldX); n++){
                        if  (newX == oldX + n && newY == oldY - n) allowMove = diagonalChecker(oldX, newX, oldY, newY);
                        if  (newX == oldX + n && newY == oldY + n) allowMove = diagonalChecker(oldX, newX, oldY, newY);
                    }
                }
                if(newX < oldX){
                    for (let n = 1; n<=(oldX - newX); n++){
                        if  (newX == oldX - n && newY == oldY + n) allowMove = diagonalChecker(oldX, newX, oldY, newY);
                        if  (newX == oldX - n && newY == oldY - n) allowMove = diagonalChecker(oldX, newX, oldY, newY);
                    }
                }
                return allowMove;

                default:
                    return allowMove;

            }
    }
    const movePiece = (oldCoords,newCoords,id) =>{
        pieceMaker(newCoords[0], newCoords[1], id);
        pieceUnmaker(oldCoords[0],oldCoords[1]);
        clearInfo();
    }
    const pieceUnmaker = (x, y) =>{
        chessBoardData[y][x].tileLocation.removeChild(chessBoardData[y][x].tileLocation.lastChild);
        chessBoardData[y][x].isEmpty = true;
    }
    const pieceMaker = (x, y, id) =>{
        let piece = document.createElement('div');
        piece.classList.add('piece');

        let pieceData = {
            id: id,
            x: x,
            y: y,
        }
        piece.textContent = id
;
        piece.onclick=(e) =>{
            e.stopPropagation();
            
            if (movingData.piece == null){
                movingData.id = id;
                movingData.piece = piece;
                movingData.x = pieceData.x;
                movingData.y = pieceData.y;
            }else{
                clearInfo();
            }/*
            movingData.id = id;
            movingData.piece = piece;
            movingData.x = pieceData.x;
            movingData.y = pieceData.y;

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

chessBoard.pieceMaker(0,6,'bishop');
chessBoard.pieceMaker(0,5,'bishop');
chessBoard.pieceMaker(4,2,'rook');
chessBoard.pieceMaker(2,4, 'pawn');
/*
chessBoard.generateGame();*/