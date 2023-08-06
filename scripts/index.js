import { chessBoard } from "./chessboard.js";
/* create's the board and populates it on load*/
chessBoard.makeBoard();
chessBoard.generateGame();

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
    console.log(inputPgn.value);
    parsePGN();
    generateWrapper.style.zIndex = -10;
    inputPgn.value= '';
    moveHistoryHolder.style.gridTemplateRows = "2fr";
    inputPgn.style.display = "none";
    generateBtn.style.display = "none";
    moveHistoryIndicator.style.display = "inline-block";
}
downloadBtn.onclick = () =>{
    navigator.clipboard.writeText(chessBoard.generatePgn(chessBoard.getHistory()));
    indicator.textContent = 'PGN copied to your clipboard!';
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
//for compiling openings only, make sure to comment out!
/*
let openingData = '';
async function translate(){
    //[eco:eco, name:name, pgn:pgn]
    await fetch('./assets/openings/a.txt')
    .then((response)=>response.text())
    .then((data)=>{
        openingData = openingData + data;
    });
    await fetch('./assets/openings/b.txt')
    .then((response)=>response.text())
    .then((data)=>{
        openingData = openingData + data;
    });
    await fetch('./assets/openings/c.txt')
    .then((response)=>response.text())
    .then((data)=>{
        openingData = openingData + data;
    });
    await fetch('./assets/openings/d.txt')
    .then((response)=>response.text())
    .then((data)=>{
        openingData = openingData + data;
    });
    await fetch('./assets/openings/e.txt')
    .then((response)=>response.text())
    .then((data)=>{
        openingData = openingData + data;
    });
    openingData = openingData.split('\n');
    for(let i = 0; i<openingData.length; i++){
        openingData[i] = openingData[i].split('\t');
    }
    openingData.sort((a,b)=>{return a[2].length - b[2].length});
    for(let i = 0; i<openingData.length; i++){
        openingData[i] = openingData[i].join('\t');
    }
    openingData = openingData.join('\n');
    console.log(openingData);
}
translate();
*/