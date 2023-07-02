console.log('Hello World!');
const gameBoard = document.getElementById('game-board');
const chessBoard =(()=>{

    let chessBoardArray = [];

    const emptyBoard = () =>{
        //fills up the board with 'empty positions'
        for (let y = 1; y <= 8; y++){
            let chessBoardTileData = [];
            for(let x = 1; x <= 8; x++){
                chessBoardTileData.push('_');
            }
            chessBoardArray.push(chessBoardTileData);
        }
        console.log(chessBoardArray);
    }

    //creates board element
    const makeBoard = () =>{
        while (gameBoard.hasChildNodes()) {
            gameBoard.removeChild(gameBoard.lastChild);
          }
        
        for(let y = 8; y >= 1; y--){
            for(let x = 1; x <= 8; x++){
                let chessBoardTileDiv = document.createElement('div');
                chessBoardTileDiv.classList.add('tile');
                chessBoardTileDiv.style.backgroundColor = ((y+x)%2?'rgb(238,238,210':'rgb(118,150,86)');
                //object for easier data manipulation
                let TileData ={
                    yCoord: y,
                    xCoord: String.fromCharCode(96 + x),
                    isEmpty: (!chessBoardTileDiv.hasChildNodes())
                };
                chessBoardTileDiv.onclick = function(){
                    console.log(TileData.isEmpty);
                }
                gameBoard.append(chessBoardTileDiv);
            }
            
        }
    }
    return {makeBoard};
})();
chessBoard.makeBoard();