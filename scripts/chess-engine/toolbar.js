import { chessBoard } from "./chessboard.js";
import { identifyPieces } from "../image-recog/imageRecog.js";
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');

const indicator = document.getElementById("indicator");
const generateBtn = document.getElementById("generate-btn");
const uploadBtn = document.getElementById("upload-btn");
const sideBtn = document.getElementById("side-btn");
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
        indicator.textContent = "Input PGN or Upload Picture of your Board!";
        moveHistoryHolder.style.gridTemplateRows = "2fr 0.5fr 0.5fr 0.5fr";
        moveHistoryIndicator.style.display = "none";
        inputPgn.style.display = "inline-block";
        generateBtn.style.display = "inline-block";
        sideBtn.style.display = "inline-block"; 
        uploadBtn.style.display = "inline-block";
        inputPgn.value = '';
        inputPgn.focus();
    }else{
        indicator.textContent = "Teachess";
        moveHistoryHolder.style.gridTemplateRows = "2fr";
        moveHistoryIndicator.style.display = "inline-block";
        inputPgn.style.display = "none";
        generateBtn.style.display = "none";
        sideBtn.style.display = "none"; 
        uploadBtn.style.display = "none";
    }
}
let chessSide = 0;
let pgnTrack = true;
generateBtn.onclick =()=>{
    if(inputPgn.value.length > 0){
        pgnTrack = true;
        indicator.textContent = 'Teachess';
        chessBoard.makeBoard(chessSide);
        chessBoard.generateGame();
        parsePGN();
        inputPgn.value= '';
        
    }else if(imgLoaded){
        pgnTrack = false;
        indicator.textContent = 'Teachess';
        chessBoard.makeBoard(chessSide);
        chessBoard.generateImgGame(editedBoard, turnImg);
        imgLoaded = false;
    }
    moveHistoryHolder.style.gridTemplateRows = "2fr";
    inputPgn.style.display = "none";
    generateBtn.style.display = "none";
    sideBtn.style.display = "none"; 
    uploadBtn.style.display = "none";
    moveHistoryIndicator.style.display = "inline-block";
}
sideBtn.onclick = ()=>{
    chessBoard.changeSettings();
    chessSide = !chessSide;
    if(chessSide){
        sideBtn.style.color = "white";
        sideBtn.style.backgroundColor = "black";
    }else{
        sideBtn.style.color = "black";
        sideBtn.style.backgroundColor = "white";
    }
    
}
let imageLoader = document.getElementById('pic-board');
uploadBtn.onclick = ()=>{
    imageLoader.click();
}
imageLoader.oninput = () =>{
    setTimeout(() => {
       //console.log(identifyPieces());
        boardImgLoad(identifyPieces()); 
    }, 500);
    
}
const loadBoardDiv = document.getElementById("load-board");
const loadWrapper = document.getElementById("generate-wrapper");
let editedBoard = [];
function boardImgLoad(array){
    editedBoard = [];
    loadWrapper.style.zIndex = "10";
    indicator.textContent = "Teachess";
    let piece = [
        null,
        "pawn",
        "knight",
        "bishop",
        "rook",
        "queen",
        "king"
    ]
    while (loadBoardDiv.hasChildNodes()) loadBoardDiv.removeChild(loadBoardDiv.lastChild);
    for(let i = 0; i < 8; i++){
        let chessBoardTileContainer = document.createElement('div');
        chessBoardTileContainer.classList.add('tile-container');
        let tempEditY = [];
        for(let j = 0; j <8; j++){
            
            let chessBoardTileDiv = document.createElement('div');
            chessBoardTileDiv.classList.add('tile');
            if (array[i][j].value != -100){
                const pieceDiv = document.createElement('div');
                pieceDiv.classList.add('piece');
                pieceDiv.classList.add((array[i][j].color?"white-":"black-")+array[i][j].piece);
                pieceDiv.classList.add((array[i][j].color?"white-":"black-")+"preview");

                pieceDiv.onclick = ()=>{
                    if(array[i][j].value == -100) return;
                    pieceDiv.classList.remove((array[i][j].color?"white-":"black-")+editedBoard[i][j].piece);
                    let currentValue = editedBoard[i][j].value;
                    currentValue++;
                    currentValue = currentValue%8;
                    if(currentValue == 7){
                        editedBoard[i][j].piece = null;
                        editedBoard[i][j].value = 0;
                    }else{
                        editedBoard[i][j].piece = piece[currentValue];
                        editedBoard[i][j].value = currentValue;
                        pieceDiv.classList.add((array[i][j].color?"white-":"black-")+piece[currentValue]);
                    }
                    
                }
                
                chessBoardTileDiv.appendChild(pieceDiv);
            }
            tempEditY.push(array[i][j]);
            chessBoardTileContainer.append(chessBoardTileDiv);
        }
        editedBoard.push(tempEditY);
        loadBoardDiv.append(chessBoardTileContainer);
    }
}
const cancelBtn = document.getElementById("cancel-board-btn");
cancelBtn.onclick = ()=>{
    hideDisplay();
    loadWrapper.style.zIndex = "-10";
    imgLoaded = false;
    editedBoard = [];
}
const loadBtn = document.getElementById("pic-board-btn");
const turnBtn = document.getElementById("turn-pick-btn");
let imgLoaded = false;
let turnImg = true;
loadBtn.onclick = () =>{
    indicator.textContent = "Board Data Ready!"
    loadWrapper.style.zIndex = "-10";
    imgLoaded = true;
}
turnBtn.onclick = ()=>{
    turnImg = !turnImg;
    if(turnImg){
        turnBtn.style.backgroundColor = "white";
        turnBtn.style.color = "black";
    }else{
        turnBtn.style.backgroundColor = "black";
        turnBtn.style.color = "white";
    }
}
downloadBtn.onclick = () =>{
    if (!pgnTrack) {
        indicator.textContent = "PGN disabled for image boards"
        return;
    }
    if(chessBoard.getHistory().length != 0){
        let pgnText = chessBoard.generatePgn(chessBoard.getHistory());
        navigator.clipboard.writeText(pgnText);
        indicator.textContent = 'PGN copied to your clipboard!';
    }else{
        indicator.textContent = 'No Moves Recorded';
    }
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
    chessBoard.translatePgn(moveList, false, false);
}