const gameBoard = document.getElementById('game-board');
const chessBoard =(()=>{

    let chessBoardData = [];
    let tempHolder = [];
    let isMoving = false;
    let movingData = {
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
                    if(movingData.piece){ 
                        movePiece(x,y);
                    }
                }
                chessBoardTileContainer.append(chessBoardTileDiv);
                chessBoardTileData.push(TileData);
            }
            gameBoard.append(chessBoardTileContainer);
            chessBoardData.push(chessBoardTileData);
        }
    }
    const movePiece = (x,y) =>{
        if(movingData.x != x || movingData.y != y){
            movingData.x = x;
            movingData.y = y;
            chessBoardData[y][x].tileLocation.append(movingData.piece);
            chessBoardData[tempHolder[1]][tempHolder[0]].isEmpty = true;
            chessBoardData[y][x].isEmpty = false;
            console.log(chessBoardData);
        }
            movingData.piece = null;
            movingData.x = null;
            movingData.y = null;
    }
    const pieceMaker = (x,y,id) =>{
        let gameBoardArrayData = gameBoard.querySelectorAll('.tile-container');
        let piece = document.createElement('div');
        piece.classList.add('piece');
        piece.textContent = 'piece';
        let pieceData = {
            id:id,
        }
        piece.onclick=(e) =>{
            console.log(pieceData.id);
            tempHolder = [x,y];
            //IMPORTANT TO STOP PARENT FROM TRIGGERING NULL 
            e.stopPropagation();
            movingData.piece = piece;
        }
        chessBoardData[y][x].isEmpty = false;
        gameBoardArrayData[y].childNodes[x].append(piece);
    }

    
    return {makeBoard,pieceMaker};
})();
chessBoard.makeBoard();
chessBoard.pieceMaker(0,6, 'rook');
chessBoard.pieceMaker(1,6, 'pawn');