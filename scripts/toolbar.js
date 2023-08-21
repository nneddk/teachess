import { chessBoard } from "./chessboard.js";
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');

const indicator = document.getElementById("indicator");
const generateWrapper = document.getElementById("generate-wrapper");
const generateBtn = document.getElementById("generate-btn");
const inputPgn = document.getElementById("input-pgn");

const notationBtn = document.getElementById('notation-btn');
const yNotation = document.getElementById('y-notation');
const xNotation = document.getElementById('x-notation');
const moveHistoryIndicator = document.getElementById('move-history');
const moveHistoryHolder = document.getElementById('move-history-holder');

const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");
const firstMoveBtn = document.getElementById("first-move-btn");
const lastMoveBtn = document.getElementById("last-move-btn");

let holderOpen = false;
//page buttons
resetBtn.onclick=()=>{
    hideDisplay();   
}
export function hideDisplay(){
    holderOpen = !holderOpen;
    
    if(holderOpen){
        moveHistoryHolder.style.gridTemplateRows = "3fr 0.5fr";
        moveHistoryIndicator.style.display = "none";
        inputPgn.style.display = "inline-block";
        generateBtn.style.display = "inline-block"; 
        inputPgn.value = '';
        inputPgn.focus();
    }else{
        moveHistoryHolder.style.gridTemplateRows = "2fr";
        moveHistoryIndicator.style.display = "inline-block";
        inputPgn.style.display = "none";
        generateBtn.style.display = "none";
    }
}
generateBtn.onclick =()=>{
    indicator.textContent = '';
    chessBoard.makeBoard();
    chessBoard.generateGame();
    parsePGN();
    inputPgn.value= '';
    moveHistoryHolder.style.gridTemplateRows = "2fr";
    inputPgn.style.display = "none";
    generateBtn.style.display = "none";
    moveHistoryIndicator.style.display = "inline-block";
}
downloadBtn.onclick = () =>{
    if(chessBoard.getHistory().length != 0){
        navigator.clipboard.writeText(chessBoard.generatePgn(chessBoard.getHistory()));
        indicator.textContent = 'PGN copied to your clipboard!';
    }else{
        indicator.textContent = 'No Moves Recorded';
    }
    
    //console.log(chessBoard.generatePgn(chessBoard.getHistory(),true));
    //downloadBtn.setAttribute("href",downloadPgn(generatePgn(chessBoard.getHistory('moveHistory'))));
}
notationBtn.onclick = () =>{
    let notationValue = chessBoard.viewNotation();
    if(notationValue == 1 || notationValue == 3){
        yNotation.style.opacity = '1';
        xNotation.style.opacity = '1';
        //yNotation.style.width = '3.5vmin';
        /*xNotation.style.height = '3.5vmin';
        */
    }else{
        yNotation.style.opacity = '0';
        xNotation.style.opacity = '0'
        //yNotation.style.width = '0vmin';
       /* xNotation.style.height = '0vmin';
        */
    }
}
undoBtn.onclick =()=>{
    chessBoard.traverseHistory('undo');
}
redoBtn.onclick =()=>{
    chessBoard.traverseHistory('redo');

}
firstMoveBtn.onclick =()=>{
    chessBoard.traverseHistory('start');
}
lastMoveBtn.onclick = ()=>{
    chessBoard.traverseHistory('end');
}
function parsePGN(){
    let newPGN = inputPgn.value.trim().split('\n');
    newPGN.reverse();
    let pgnTags =[];
    for(let i = newPGN.length - 1; i>0; i--){
        if(newPGN[i] == ''){
            pgnTags.push(newPGN.pop());
            break;
        }
        if(newPGN[i].charAt(0)!= '['){
            break;
        }
        pgnTags.push(newPGN.pop());
        
    }
    newPGN.reverse();
    newPGN = newPGN.join('\n').replace(/(\n)/gm, ' ').replace(/(\+|#)/gm, '').split(' ');

    if( (newPGN[(newPGN.length - 1)] == '*')|| (newPGN[(newPGN.length - 1)] == '1/2-1/2')|| (newPGN[(newPGN.length - 1)] == '1-0')||(newPGN[(newPGN.length - 1)] == '0-1') ){
        newPGN.pop();
    }
    
    let moveList = [];
    for(let i = 0; i<newPGN.length;i++){
        if(i%3!=0){
            moveList.push(newPGN[i]);
        }
    }
    chessBoard.translatePgn(moveList);
}