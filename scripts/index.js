import { chessBoard } from "./chessboard.js";
chessBoard.makeBoard();
chessBoard.generateGame();
const resetBtn = document.getElementById('reset-btn');

const indicator = document.getElementById("indicator");
resetBtn.onclick=()=>{
    if(confirm('Reset the board?')){
        indicator.textContent = '';
        chessBoard.makeBoard();
        chessBoard.generateGame();
    }
}

