import { predictPawn, predictKnight, predictBishop, predictRook, predictQueen, predictKing, predictNothing, trainSVM } from "./svmTrain.js";
let imageResult = [];
let colorBoard = [];
let svmTrain = false;
export function loadBoard(img){
    if(svmTrain == false){
        trainSVM();
        svmTrain = true;
    }
    
    imageResult = [];
    colorBoard = [];
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    let context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, img.width, img.height);
    let size = img.height;
    let subCanvasSize = 103; // Size of each sub-canvas
    for (let x = 0; x < size; x += subCanvasSize) {
        for (let y = 0; y < size; y += subCanvasSize) {
            // Create a new canvas for each square
            let subCanvas = document.createElement('canvas');
            subCanvas.width = subCanvasSize;
            subCanvas.height = subCanvasSize;

            // Get the context of the sub-canvas
            let subContext = subCanvas.getContext('2d');

            // Draw the corresponding image data onto the sub-canvas
            subContext.drawImage(canvas, y, x, subCanvasSize, subCanvasSize, 0, 0, subCanvasSize, subCanvasSize);
            let imageData = subContext.getImageData(0, 0, subCanvasSize, subCanvasSize);
            let data = imageData.data;
            let sum = 0;
            let count = 0;
            let start = Math.floor(subCanvasSize * 0.35);
            let end = Math.floor(subCanvasSize * 0.65);
            for (let row = start; row < end; row++) {
                for (let col = start; col < end; col++) {
                    let index = (row * subCanvasSize + col) * 4;
                    let grayscale = data[index] * 0.3 + data[index + 1] * 0.59 + data[index + 2] * 0.11;
                    sum += grayscale;
                    count++;
                }
            }
            let avg = sum / count;
            
            if (avg > 100) {
                colorBoard.push({
                    color:1,
                    pawn:predictPawn(preprocessB(subCanvas))+predictPawn(preprocessC(subCanvas)),
                    knight:predictKnight(preprocessA(subCanvas))+predictKnight(preprocessB(subCanvas))+predictKnight(preprocessC(subCanvas))+predictKnight(preprocessD(subCanvas))+predictKnight(preprocessE(subCanvas)),
                    bishop:predictBishop(preprocessA(subCanvas))+predictBishop(preprocessB(subCanvas))+predictBishop(preprocessC(subCanvas)),
                    rook: predictRook(preprocessA(subCanvas))+predictRook(preprocessB(subCanvas))+predictRook(preprocessC(subCanvas))+predictRook(preprocessD(subCanvas)),
                    queen:predictQueen(preprocessB(subCanvas)),
                    king:predictKing(preprocessA(subCanvas))+predictKing(preprocessB(subCanvas))+predictKing(preprocessC(subCanvas))+predictKing(preprocessD(subCanvas))+predictKing(preprocessE(subCanvas)),
                    nothing:predictNothing(preprocessA(subCanvas))
                   
                }) 
            } else if (avg < 100) {
                colorBoard.push({
                    color:0,
                    pawn:predictPawn(preprocessA(subCanvas)),
                    knight:predictKnight(preprocessA(subCanvas)),
                    bishop:predictBishop(preprocessA(subCanvas))+predictBishop(preprocessD(subCanvas))+predictBishop(preprocessE(subCanvas))+predictBishop(preprocessC(subCanvas)),
                    rook:predictRook(preprocessA(subCanvas))+predictRook(preprocessB(subCanvas))+predictRook(preprocessC(subCanvas))+predictRook(preprocessD(subCanvas))+predictRook(preprocessA(subCanvas))+predictRook(preprocessE(subCanvas)),
                    queen: predictQueen(preprocessA(subCanvas)),
                    king:predictKing(preprocessA(subCanvas))+predictKing(preprocessD(subCanvas)),
                    nothing:predictNothing(preprocessA(subCanvas))+predictNothing(preprocessB(subCanvas))+predictNothing(preprocessD(subCanvas))
                    })
                    
            }
        }
    }
    let tempData = [];
    for(let i = 1; i<=64; i++){
        tempData.push(colorBoard[i - 1]);
        if(i%8==0 ){
            imageResult.push(tempData);
            tempData = [];
        }
    }
    return buildBoard(imageResult);
}

//need 3 sets of test arrays
function preprocessA(originalCanvas){
    let canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    // Get the context of the new canvas
    let context = canvas.getContext('2d');

    // Draw the contents of the original canvas onto the new one
    context.drawImage(originalCanvas, 0, 0, canvas.width, canvas.height);

    // Get the image data from the context
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    
    // Loop through all pixels
    let solidColor = {r: 255, g: 0, b: 0};
    // Create a 2D array
    let arr = new Array(10000).fill(0);

    for(let i = 0; i < data.length; i += 4) {
        let red = data[i];
        let green = data[i + 1];
        let blue = data[i + 2];

        let grayscale = 0.3 * red + 0.59 * green + 0.11 * blue;

        if(grayscale < 80 || grayscale > 300) {
            data[i] = solidColor.r;
            data[i + 1] = solidColor.g;
            data[i + 2] = solidColor.b;
        }

        // Calculate the index for the 1D array
        let index = Math.floor(i / 4);

        if(data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) {
            arr[index] = 1;
        }
    }


    // Put the image data back into the context
    context.putImageData(imageData, 0, 0);
    //document.body.append(canvas);
    return arr;
    //return canvas;
}
function preprocessB(originalCanvas){
    let canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    // Get the context of the new canvas
    let context = canvas.getContext('2d');

    // Draw the contents of the original canvas onto the new one
    context.drawImage(originalCanvas, 0, 0, canvas.width, canvas.height);

    // Get the image data from the context
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    
    // Loop through all pixels
    let solidColor = {r: 255, g: 0, b: 0};
    // Create a 2D array
    let arr = new Array(10000).fill(0);

    for(let i = 0; i < data.length; i += 4) {
        let red = data[i];
        let green = data[i + 1];
        let blue = data[i + 2];

        let grayscale = 0.3 * red + 0.59 * green + 0.11 * blue;

        if(grayscale < 75 || grayscale > 150) {
            data[i] = solidColor.r;
            data[i + 1] = solidColor.g;
            data[i + 2] = solidColor.b;
        }

        // Calculate the index for the 1D array
        let index = Math.floor(i / 4);

        if(data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) {
            arr[index] = 1;
        }
    }


    // Put the image data back into the context
    context.putImageData(imageData, 0, 0);
    //document.body.append(canvas);
    return arr;
    //return canvas;
}
function preprocessC(originalCanvas){
    let canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    // Get the context of the new canvas
    let context = canvas.getContext('2d');

    // Draw the contents of the original canvas onto the new one
    context.drawImage(originalCanvas, 0, 0, canvas.width, canvas.height);

    // Get the image data from the context
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    
    // Loop through all pixels
    let solidColor = {r: 255, g: 0, b: 0};
    // Create a 2D array
    let arr = new Array(10000).fill(0);

    for(let i = 0; i < data.length; i += 4) {
        let red = data[i];
        let green = data[i + 1];
        let blue = data[i + 2];

        let grayscale = 0.3 * red + 0.59 * green + 0.11 * blue;

        if(grayscale < 181 || grayscale > 245) {
            data[i] = solidColor.r;
            data[i + 1] = solidColor.g;
            data[i + 2] = solidColor.b;
        }

        // Calculate the index for the 1D array
        let index = Math.floor(i / 4);

        if(data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) {
            arr[index] = 1;
        }
    }


    // Put the image data back into the context
    context.putImageData(imageData, 0, 0);
    //document.body.append(canvas);
    return arr;
    //return canvas;
}
function preprocessD(originalCanvas){
    let canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    // Get the context of the new canvas
    let context = canvas.getContext('2d');

    // Draw the contents of the original canvas onto the new one
    context.drawImage(originalCanvas, 0, 0, canvas.width, canvas.height);

    // Get the image data from the context
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    
    // Loop through all pixels
    let solidColor = {r: 255, g: 0, b: 0};
    // Create a 2D array
    let arr = new Array(10000).fill(0);

    for(let i = 0; i < data.length; i += 4) {
        let red = data[i];
        let green = data[i + 1];
        let blue = data[i + 2];

        let grayscale = 0.3 * red + 0.59 * green + 0.11 * blue;

        if(grayscale < 155 || grayscale > 215) {
            data[i] = solidColor.r;
            data[i + 1] = solidColor.g;
            data[i + 2] = solidColor.b;
        }

        // Calculate the index for the 1D array
        let index = Math.floor(i / 4);

        if(data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) {
            arr[index] = 1;
        }
    }


    // Put the image data back into the context
    context.putImageData(imageData, 0, 0);
    //document.body.append(canvas);
    return arr;
    //return canvas;
}
function preprocessE(originalCanvas){
    let canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    // Get the context of the new canvas
    let context = canvas.getContext('2d');

    // Draw the contents of the original canvas onto the new one
    context.drawImage(originalCanvas, 0, 0, canvas.width, canvas.height);

    // Get the image data from the context
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    
    // Loop through all pixels
    let solidColor = {r: 255, g: 0, b: 0};
    // Create a 2D array
    let arr = new Array(10000).fill(0);

    for(let i = 0; i < data.length; i += 4) {
        let red = data[i];
        let green = data[i + 1];
        let blue = data[i + 2];

        let grayscale = 0.3 * red + 0.59 * green + 0.11 * blue;

        if(grayscale < 30 || grayscale > 160)  {
            data[i] = solidColor.r;
            data[i + 1] = solidColor.g;
            data[i + 2] = solidColor.b;
        }

        // Calculate the index for the 1D array
        let index = Math.floor(i / 4);

        if(data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) {
            arr[index] = 1;
        }
    }


    // Put the image data back into the context
    context.putImageData(imageData, 0, 0);
    //document.body.append(canvas);
    return arr;
    //return canvas;
}
//pawn = 1, knight = 2, bishop =3, rook = 4, queen = 5, king = 6. positive for white pieces, negative for b;ack pieces. 0 for empty
//have to readjust for black piece relationship
function buildBoard(board){
    let evaluatedBoard = [];
    for(let i = 0; i < 8; i++){
        let tempXArray = [];
        for(let j = 0; j<8; j++){
            let likelyPiece = 0;
            let likelyValue = 0;
            if(board[i][j].color == 1){
                
                if(board[i][j].knight){
                    likelyPiece = "knight";
                    likelyValue = 2;
                }if(board[i][j].bishop){
                    likelyPiece = "bishop";
                    likelyValue = 3;
                }
                
                if(board[i][j].king && (board[i][j].king > board[i][j].queen) ){
                    likelyPiece = "king";
                    likelyValue = 6;
                }
                if(board[i][j].queen && (board[i][j].king < board[i][j].queen) ){
                    likelyValue = 5;
                    likelyPiece = "queen"
                }
                if(likelyPiece == 0){
                    likelyPiece = "bishop";
                    likelyValue = 3;
                }
                if(board[i][j].rook){
                    likelyPiece = "rook";
                    likelyValue = 4;
                }
                if (board[i][j].pawn && !(board[i][j].nothing > 0)){
                    likelyPiece = "pawn"
                    likelyValue = 1;
                }
            }else{
                if(board[i][j].rook){
                    likelyPiece = "rook";
                    likelyValue = 4;
                }
                if(board[i][j].knight){
                    likelyPiece = "knight";
                    likelyValue = 2;
                }if(board[i][j].bishop){
                    likelyPiece = "bishop";
                    likelyValue = 3;
                }
                if(board[i][j].queen){
                    likelyPiece = "queen";
                    likelyValue = 5;
                }
                if(board[i][j].king){
                    likelyPiece = "king";
                    likelyValue = 6;
                }
                if(likelyPiece == 0){
                    likelyPiece = "bishop";
                    likelyValue = 3;
                }
                if (board[i][j].pawn && !(board[i][j].nothing > 0)){
                    likelyPiece = "pawn";
                    likelyValue = 1;
                }
                
            }
            if(board[i][j].nothing > 0){
                likelyPiece = 0;
            }
            if(likelyPiece != 0){
                tempXArray.push({
                    color:board[i][j].color,
                    piece: likelyPiece,
                    value:likelyValue
                });
            }else{
                tempXArray.push({
                    color:null,
                    piece: null,
                    value:-100
                });
            }
            

        }
        evaluatedBoard.push(tempXArray);
    }
    console.log(evaluatedBoard);
    return evaluatedBoard;
}