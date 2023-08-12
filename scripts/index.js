import { chessBoard } from "./chessboard.js";
/* create's the board and populates it on load*/
chessBoard.makeBoard();
chessBoard.generateGame();


//page buttons


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