import { readWhite,readBlack, readTestWhite, readTestBlack } from "./parseData.js";
import { chessBoard } from "../chess-engine/chessboard.js";
class SVM {
    constructor() {
        this.weights = [];
        this.bias = 0;
        //TP true positives FP false positives, TN true negatives, FN false negatives
        this.confusionMatrix = {TP: 0, FP: 0, TN: 0, FN: 0};
    }

    train(data, labels, learningRate = 0.1, iterations = 1000) {
        let n = data.length;
        this.weights = new Array(data[0].length * data[0][0].length).fill(0);
        this.dataset = data;
        
        for(let i = 0; i < iterations; i++) {

            for(let j = 0; j < n; j++) {
                let labelWeight = labels[j] === 1 ? 2 : 0.01;
                let prediction = this.predict(data[j]);
                if(prediction == labels[j]) {
                    if(prediction ==1) {
                        this.confusionMatrix.TP++;
                    } else {
                        this.confusionMatrix.TN++;
                    }
                } else {
                    if(prediction == 1) {
                        this.confusionMatrix.FP++;
                    } else {
                        this.confusionMatrix.FN++;
                    }
                }
                for(let k = 0; k < data[j].length; k++) {
                    for(let f = 0; f < data[j][k].length; f++) {
                        this.weights[k * data[j][0].length + f] += learningRate * (labels[j] - prediction) * data[j][k][f] * labelWeight;
                    }
                }
                this.bias += learningRate * (labels[j] - prediction);
            }
        }
    }

    predict(point) {
        let sum = this.bias;
        for(let i = 0; i < point.length; i++) {
            for(let j = 0; j < point[i].length; j++) {
                sum += this.weights[i * point[0].length + j] * point[i][j];
            }
        }
        return sum >= 0 ? 1 : 0;
    }

    getMetrics() {
        let precision = this.confusionMatrix.TP / (this.confusionMatrix.TP + this.confusionMatrix.FP);
        let recall = this.confusionMatrix.TP / (this.confusionMatrix.TP + this.confusionMatrix.FN);
        let f1Score = 2 * (precision * recall) / (precision + recall);
        return {precision, recall, f1Score, confusionMatrix: this.confusionMatrix};
    }

}
//converts board data into usable format
function convertBoard(pieces){
    let emptyBoard = [];
        for(let j = 0; j <8; j++){
            let emptyY = [];
            for(let k = 0; k <8; k++){
                emptyY.push(0)
            }
            emptyBoard.push(emptyY);
        }
    for (let i = 0; i <pieces.length; i++){
        let pc = 0;
        switch (pieces[i].notation){
            case 'P':
                pc = 1;
                break;
            case 'N':
                pc = 2;
                break;
            case 'B':
                pc = 3;
                break;
            case 'R':
                pc = 4;
                break;
            case 'Q':
                pc = 5;
                break;
            case 'K':
                pc = 6;
                break;
            default:
                break;
        }
        if(!pieces[i].color) pc = -pc;
        emptyBoard[pieces[i].y][pieces[i].x] = pc;
        
        
    }
    return emptyBoard;
}
//initialize white-biased svm prediction
let whiteSVM = new SVM();
let white = await readWhite();
let whiteData = white[0];
let whiteLabels = white[1];
whiteSVM.train(whiteData, whiteLabels);
export function predictWhite(pieces){
    let board = convertBoard(pieces);
    return (whiteSVM.predict(board));
}

let blackSVM = new SVM();
let black = await readBlack();
let blackData = black[0];
let blackLabels = black[1];
blackSVM.train(blackData, blackLabels);
export function predictBlack(pieces){
    let board = convertBoard(pieces);
    return (blackSVM.predict(board));
}
chessBoard.makeBoard();
chessBoard.generateGame();
chessBoard.refreshData();
/*
//current accuracy
function whiteAccuracy(data, labels) {
    let correct = 0;
    for(let i = 0; i < data.length; i++) {
        let prediction = whiteSVM.predict(data[i]);
        if(prediction === labels[i]) {
            correct++;
        }
    }
    return correct / data.length;
}

// Test the SVM

let testWhite = await readTestWhite();
let testWhiteData = testWhite[0];
let testWhiteLabels = testWhite[1]
console.log("White Accuracy: " + whiteAccuracy(testWhiteData, testWhiteLabels));

function blackAccuracy(data, labels) {
    let correct = 0;
    for(let i = 0; i < data.length; i++) {
        let prediction = blackSVM.predict(data[i]);
        if(prediction === labels[i]) {
            correct++;
        }
    }
    return correct / data.length;
}

// Test the SVM

let testBlack = await readTestBlack();
let testBlackData = testBlack[0];
let testBlackLabels = testBlack[1]
console.log("Black Accuracy: " + blackAccuracy(testBlackData, testBlackLabels));
*/