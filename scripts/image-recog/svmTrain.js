import {readKnight, readBishop, readPawn, readRook, readQueen, readKing, readNothing} from "./parseData.js";
class SVM {
    constructor() {
        this.weights = new Array(10000).fill(0);
        this.bias = 0;
    }

    predict(inputs) {
        let sum = this.bias;
        for (let i = 0; i < this.weights.length; i++) {
            sum += this.weights[i] * inputs[i];
        }
        return sum >= 0 ? 1 : 0;
    }

    train(inputs, labels, learningRate = 0.1, iterations = 100) {
        for (let iter = 0; iter < iterations; iter++) {
            for (let i = 0; i < inputs.length; i++) {
                let prediction = this.predict(inputs[i]);
                let error = labels[i] - prediction;
                let labelWeight = labels[i] === 1 ? 5.3 : 0.1;
    
                for (let j = 0; j < this.weights.length; j++) {
                    this.weights[j] += learningRate * error * inputs[i][j] * labelWeight;
                }
    
                this.bias += learningRate * error * labelWeight;
            }
        }
    }
}

let pawn = new SVM();
let pawnData = await readPawn();

let knight = new SVM();
let knightData = await readKnight();


let bishop = new SVM();
let bishopData = await readBishop();

let rook = new SVM();
let rookData = await readRook();

let queen = new SVM();
let queenData = await readQueen();

let king = new SVM();
let kingData = await readKing();

let nothing = new SVM();
let nothingData = await readNothing();

let labels = [1, 1, 1, 1, 1, 1, 1, 1, 1];
while (labels.length < 54) labels.push(0);
//training functions
function trainPawn(){
    let data = pawnData.concat(knightData, bishopData, rookData, queenData, kingData);
    pawn.train(data, labels);
    /*
    for(let i = 0; i<labels.length; i++){
        console.log(pawn.predict(data[i]));
    }*/
}
function trainKnight(){
     let data = knightData.concat(pawnData, bishopData, rookData, queenData, kingData);
     knight.train(data, labels);

}
function trainBishop(){
    let data = bishopData.concat(pawnData, knightData, rookData, queenData, kingData);
    bishop.train(data, labels)
}
function trainRook(){
    let data = rookData.concat(pawnData, knightData, bishopData, queenData, kingData);
    rook.train(data, labels);
}
function trainQueen(){
    let data = queenData.concat(pawnData, knightData, bishopData, rookData, kingData);
    queen.train(data, labels);
    
}
function trainKing(){
    let data = kingData.concat(pawnData, knightData, bishopData, rookData, queenData);
    king.train(data, labels);
    
}
function trainNothing(){
    let data = nothingData.concat(pawnData, knightData, bishopData, rookData, kingData, queenData);
    let nlabels = [1, 1, 1, 1, 1, 1, 1, 1, 1];
    while (nlabels.length < 63) nlabels.push(0);
    nothing.train(data, nlabels);   
}
function trainSVM(){
    trainPawn();
    trainKnight();
    trainBishop();
    trainRook();
    trainQueen();
    trainKing();
    trainNothing();
}
function predictPawn(array){
    return pawn.predict(array);
}
function predictKnight(array){
    return knight.predict(array);
}
function predictBishop(array){
    return bishop.predict(array);
}
function predictRook(array){
    return rook.predict(array);
}
function predictQueen(array){
    return queen.predict(array);
}
function predictKing(array){
    return king.predict(array);
}
function predictNothing(array){
    return nothing.predict(array);
}

export { predictPawn, predictKnight, predictBishop, predictRook, predictQueen, predictKing, predictNothing, trainSVM }