//reads the amount of good moves vs not good moves
let goodMoves = 0;
let notGoodMoves = 0;
async function readWhite(){
    let boardPosition = [];
    let boardLabel = [];
    let tempData;
    await fetch("./scripts/svm/datasets/white-dataset.txt")
    .then((response)=>response.text())
    .then((data)=>{
        tempData = data.replace(/(\n)/gm, ':').replace(/(\r)/gm, '').split(':');
    });
    for(let i = 0; i<tempData.length; i++){
        //exits out neutral openings
        if(i > 3){
            if(i%2==0){
                boardPosition.push(tempData[i]);
            }else{
                if(parseInt(tempData[i])){
                    goodMoves++;
                }else{
                    notGoodMoves++;
                }
                boardLabel.push(parseInt(tempData[i]));
            }
        }
        
    }
    let tempArray = [];
    for(let i = 0; i <boardPosition.length; i++){
        let boardArray = [];
        let tempYarray = [];
        let tempBoardArray = boardPosition[i].split(',');
        for(let j = 0; j<tempBoardArray.length + 1; j++){
            if(j%8 == 0 && j != 0){
                boardArray.push(tempYarray);
                tempYarray = [];
            }
            tempYarray.push(parseInt(tempBoardArray[j]));
        }
        tempArray.push(boardArray);
    }
    console.log("White: "+goodMoves);
    console.log(notGoodMoves);
    return[tempArray,boardLabel];
}

async function readBlack(){
    goodMoves = 0;
    notGoodMoves = 0;
    let boardPosition = [];
    let boardLabel = [];
    let tempData;
    await fetch("./scripts/svm/datasets/black-dataset.txt")
    .then((response)=>response.text())
    .then((data)=>{
        tempData = data.replace(/(\n)/gm, ':').replace(/(\r)/gm, '').split(':');
    });
    for(let i = 0; i<tempData.length; i++){
        //exits the neutral openings
        if(i > 3){
            if(i%2==0){
                boardPosition.push(tempData[i]);
            }else{
                if(parseInt(tempData[i])){
                    goodMoves++;
                }else{
                    notGoodMoves++;
                }
                boardLabel.push(parseInt(tempData[i]));
            }
        }
        
    }
    let tempArray = [];
    for(let i = 0; i <boardPosition.length; i++){
        let boardArray = [];
        let tempYarray = [];
        let tempBoardArray = boardPosition[i].split(',');
        for(let j = 0; j<tempBoardArray.length + 1; j++){
            if(j%8 == 0 && j != 0){
                boardArray.push(tempYarray);
                tempYarray = [];
            }
            tempYarray.push(parseInt(tempBoardArray[j]));
        }
        tempArray.push(boardArray);
    }
    console.log("Black: "+goodMoves);
    console.log(notGoodMoves);
    return[tempArray,boardLabel];
}

async function readTestWhite(){
    let boardPosition = [];
    let boardLabel = [];
    let tempData;
    await fetch("./scripts/svm/datasets/white-accuracy-test.txt")
    .then((response)=>response.text())
    .then((data)=>{
        tempData = data.replace(/(\n)/gm, ':').replace(/(\r)/gm, '').split(':');
    });
    for(let i = 0; i<tempData.length; i++){
        //exits out neutral openings
        if(i > 3){
            if(i%2==0){
                boardPosition.push(tempData[i]);
            }else{
                if(parseInt(tempData[i])){
                    goodMoves++;
                }else{
                    notGoodMoves++;
                }
                boardLabel.push(parseInt(tempData[i]));
            }
        }
        
    }
    let tempArray = [];
    for(let i = 0; i <boardPosition.length; i++){
        let boardArray = [];
        let tempYarray = [];
        let tempBoardArray = boardPosition[i].split(',');
        for(let j = 0; j<tempBoardArray.length + 1; j++){
            if(j%8 == 0 && j != 0){
                boardArray.push(tempYarray);
                tempYarray = [];
            }
            tempYarray.push(parseInt(tempBoardArray[j]));
        }
        tempArray.push(boardArray);
    }
    return[tempArray,boardLabel];
}

async function readTestBlack(){
    goodMoves = 0;
    notGoodMoves = 0;
    let boardPosition = [];
    let boardLabel = [];
    let tempData;
    await fetch("./scripts/svm/datasets/black-accuracy-test.txt")
    .then((response)=>response.text())
    .then((data)=>{
        tempData = data.replace(/(\n)/gm, ':').replace(/(\r)/gm, '').split(':');
    });
    for(let i = 0; i<tempData.length; i++){
        //exits the neutral openings
        if(i > 3){
            if(i%2==0){
                boardPosition.push(tempData[i]);
            }else{
                if(parseInt(tempData[i])){
                    goodMoves++;
                }else{
                    notGoodMoves++;
                }
                boardLabel.push(parseInt(tempData[i]));
            }
        }
        
    }
    let tempArray = [];
    for(let i = 0; i <boardPosition.length; i++){
        let boardArray = [];
        let tempYarray = [];
        let tempBoardArray = boardPosition[i].split(',');
        for(let j = 0; j<tempBoardArray.length + 1; j++){
            if(j%8 == 0 && j != 0){
                boardArray.push(tempYarray);
                tempYarray = [];
            }
            tempYarray.push(parseInt(tempBoardArray[j]));
        }
        tempArray.push(boardArray);
    }
    return[tempArray,boardLabel];
}


export{readWhite, readBlack, readTestWhite, readTestBlack};