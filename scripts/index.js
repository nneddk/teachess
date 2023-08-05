import { chessBoard } from "./chessboard.js";
chessBoard.makeBoard();
chessBoard.generateGame();
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');

const indicator = document.getElementById("indicator");
const generateWrapper = document.getElementById("generate-wrapper");
const generateBtn = document.getElementById("generate-btn");
const cancelGenerateBtn = document.getElementById("cancel-generate-btn");
const inputPgn = document.getElementById("input-pgn");
resetBtn.onclick=()=>{
    generateWrapper.style.zIndex = 10;
    
}
generateBtn.onclick =()=>{
    indicator.textContent = '';
    chessBoard.makeBoard();
    chessBoard.generateGame();
    parsePGN();
    generateWrapper.style.zIndex = -10;
    inputPgn.value= '';
}
cancelGenerateBtn.onclick =()=>{
    generateWrapper.style.zIndex = -10;
    inputPgn.value= '';
}
downloadBtn.onclick = () =>{
    navigator.clipboard.writeText(chessBoard.generatePgn(chessBoard.getHistory()));
    indicator.textContent = 'PGN copied to your clipboard!';
    //console.log(chessBoard.generatePgn(chessBoard.getHistory(),true));
    //downloadBtn.setAttribute("href",downloadPgn(generatePgn(chessBoard.getHistory('moveHistory'))));
}

function parsePGN(){
    let newPGN = inputPgn.value.trim().split('\n');
    newPGN.reverse();
    let pgnTags =[];
    console.log(newPGN);
    for(let i = newPGN.length - 1; i>0; i--){
        console.log(newPGN[i]);
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
    console.log(newPGN);
    newPGN = newPGN.join('\n').replace(/(\n)/gm, ' ').replace(/(\+|#)/gm, '').split(' ');
    console.log(newPGN);
    /*
    newPGN = newPGN.join('\n').replace(/(\r\n|\n)/gm, "").replace(/(\r\n|\n|\r|\+|#)/gm, "").split(' ');
    
    console.log(newPGN);
    */
    newPGN.pop();
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