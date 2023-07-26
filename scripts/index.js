import { chessBoard } from "./chessboard.js";
chessBoard.makeBoard();
chessBoard.generateGame();
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');

const indicator = document.getElementById("indicator");
resetBtn.onclick=()=>{
    /*
    if(confirm('Reset the board?')){
        indicator.textContent = '';
        chessBoard.makeBoard();
        chessBoard.generateGame();
    }
    */
    parsePGN();
    
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
function parsePGN(){
    let newPGN = indicator.value.split('\n');
    newPGN.reverse();
    let pgnTags =[];
    for(let i = 0; i<8; i++){
        pgnTags.push(newPGN.pop());
    }
    newPGN.reverse();
    newPGN = newPGN.join('\n').replace(/(\r\n|\n|\r|\+|#)/gm, "").split(' ');
    newPGN.pop();
    let moveList = [];
    for(let i = 0; i<newPGN.length;i++){
        if(i%3!=0){
            moveList.push(newPGN[i]);
        }
    }
    chessBoard.translatePgn(moveList);
    //console.log(newPGN);
    //console.log(pgnTags);
}
