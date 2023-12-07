//this parses the data from our training data
async function readKnight(){
    let tempData;
    await fetch("./scripts/image-recog/training-data/knight.txt")
    .then((response)=>response.text())
    .then((data)=>{
        tempData = data.replace(/(\n)/gm, ' ').replace(/(\r)/gm, '').split(' ');
    });
    for(let i = 0; i< tempData.length; i++){
        tempData[i] = tempData[i].split(/[ ,]+/).map(Number);
    }
    return tempData;
}
async function readPawn(){
    let tempData;
    await fetch("./scripts/image-recog/training-data/pawn.txt")
    .then((response)=>response.text())
    .then((data)=>{
        tempData = data.replace(/(\n)/gm, ' ').replace(/(\r)/gm, '').split(' ');
    });
    for(let i = 0; i< tempData.length; i++){
        tempData[i] = tempData[i].split(/[ ,]+/).map(Number);
    }
    return tempData;
}
async function readRook(){
    let tempData;
    await fetch("./scripts/image-recog/training-data/rook.txt")
    .then((response)=>response.text())
    .then((data)=>{
        tempData = data.replace(/(\n)/gm, ' ').replace(/(\r)/gm, '').split(' ');
    });
    for(let i = 0; i< tempData.length; i++){
        tempData[i] = tempData[i].split(/[ ,]+/).map(Number);
    }
    return tempData;
}
async function readBishop(){
    let tempData;
    await fetch("./scripts/image-recog/training-data/bishop.txt")
    .then((response)=>response.text())
    .then((data)=>{
        tempData = data.replace(/(\n)/gm, ' ').replace(/(\r)/gm, '').split(' ');
    });
    for(let i = 0; i< tempData.length; i++){
        tempData[i] = tempData[i].split(/[ ,]+/).map(Number);
    }
    return tempData;
}
async function readKing(){
    let tempData;
    await fetch("./scripts/image-recog/training-data/king.txt")
    .then((response)=>response.text())
    .then((data)=>{
        tempData = data.replace(/(\n)/gm, ' ').replace(/(\r)/gm, '').split(' ');
    });
    for(let i = 0; i< tempData.length; i++){
        tempData[i] = tempData[i].split(/[ ,]+/).map(Number);
    }
    return tempData;
}
async function readQueen(){
    let tempData;
    await fetch("./scripts/image-recog/training-data/queen.txt")
    .then((response)=>response.text())
    .then((data)=>{
        tempData = data.replace(/(\n)/gm, ' ').replace(/(\r)/gm, '').split(' ');
    });
    for(let i = 0; i< tempData.length; i++){
        tempData[i] = tempData[i].split(/[ ,]+/).map(Number);
    }
    return tempData;
}
async function readNothing(){
    let tempData;
    await fetch("./scripts/image-recog/training-data/nothing.txt")
    .then((response)=>response.text())
    .then((data)=>{
        tempData = data.replace(/(\n)/gm, ' ').replace(/(\r)/gm, '').split(' ');
    });
    for(let i = 0; i< tempData.length; i++){
        tempData[i] = tempData[i].split(/[ ,]+/).map(Number);
    }
    return tempData;
}

export{readKnight, readBishop, readPawn, readRook, readQueen, readKing, readNothing}