import { chessBoard } from "./chessboard.js";
chessBoard.makeBoard();
chessBoard.generateGame();
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');

const indicator = document.getElementById("indicator");
resetBtn.onclick=()=>{
    if(confirm('Reset the board?')){
        indicator.textContent = '';
        chessBoard.makeBoard();
        chessBoard.generateGame();
    }
}
downloadBtn.onclick = () =>{
    let pgnFile = null;
    function downloadPgn(text){
        let data = new Blob([text],{type: 'text/plain'});
        if(pgnFile !== null){
            window.URL.revokeObjectURL(pgnFile);
        }
        pgnFile = window.URL.createObjectURL(data);
        return pgnFile;
    }
    navigator.clipboard.writeText(chessBoard.generatePgn(chessBoard.getHistory()));
    indicator.textContent = 'PGN copied to your clipboard!';
    console.log(chessBoard.generatePgn(chessBoard.getHistory()));
    //downloadBtn.setAttribute("href",downloadPgn(generatePgn(chessBoard.getHistory('moveHistory'))));
}
