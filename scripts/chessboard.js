const gameBoard = document.getElementById("game-board");
const undoBtn = document.getElementById("undo-btn");
export const chessBoard =(()=>{
    let numberOfMoves = 0;
    let undoData = {};
    let availableMoves = {
        black:[],
        white:[]
    };
    let chessBoardData = [];
    let movingData = {
        color: null,
        hasMoved: 0,
        id: null,
        newCoords: {
            x:null,
            y:null
        },
        oldCoords: {
            x: null,
            y: null
        },
        piece: null
    };
    //1 for white, 0 for black;
    let turnCheck = 1;
    const piece = (()=>{
        let enPassantData = {
            color:null,
            target:{
                x:null,
                y:null
            },
            x: null,
            y: null
        };
        function pieceMaker(x, y, id, color, hasMoved){
            let pieceDiv = document.createElement("div");
            pieceDiv.classList.add("piece");
            pieceDiv.classList.add((color?"white":"black")+"-"+id);
            let pieceData = {
                color: color,
                hasMoved: (hasMoved?hasMoved:0),
                id:id,
                x:x,
                y:y,  
            };
            pieceDiv.style.color = (color?'white':"black");
            pieceDiv.onclick=(e) =>{
                if(chessBoardData[y][x].pieceData.color == turnCheck){
                    e.stopPropagation();  
                    if(movingData.piece == null){
                        setData();
                        getThreatData(id, pieceData.x, pieceData.y, pieceData.color,true);
                    } else{
                        refreshData();
                    }
                }else{
                 console.log('switch side');  
                }
            }
            function setData(){
                movingData.id = id;
                movingData.piece = piece;
                movingData.oldCoords.x = pieceData.x;
                movingData.oldCoords.y = pieceData.y;
                movingData.color = pieceData.color;
                movingData.hasMoved = pieceData.hasMoved;
            }
            chessBoardData[y][x].pieceData = pieceData;
            chessBoardData[y][x].isEmpty = false;
            chessBoardData[y][x].tileLocation.append(pieceDiv);
        }
        function pieceUnmaker(x, y){
            chessBoardData[y][x].tileLocation.removeChild(chessBoardData[y][x].tileLocation.lastChild);
            chessBoardData[y][x].isEmpty = true;
            chessBoardData[y][x].pieceData = null;
        } 
        function getMoveData (id, oldCoords, newCoords, color){
            let allowMove = false;
            let oldX = oldCoords[0], oldY = oldCoords[1];
            let newX = newCoords[0], newY = newCoords[1];
            let hasMoved = movingData.hasMoved;
            switch (id){
                case 'pawn':
                    //only move up OR down depending on the color of the piece
                    if(oldX == newX && (color?oldY-1:oldY+1) == newY){
                        allowMove = true;
                        if(chessBoardData[newY][newX].isEmpty == false){
                            allowMove = false;
                        } 
                    }
                    if((oldX + 1 == newX || oldX - 1 == newX ) && (color?(oldY - 1 == newY):(oldY + 1 == newY))){
                        if(eatChecker(newX,newY,color)) allowMove = true;
                        if(newX == enPassantData.x && newY == enPassantData.y){
                            allowMove = true;
                            eatMove(enPassantData.target.x, enPassantData.target.y);
                        }
                    }
                    if (!hasMoved){
                        if(oldX == newX && (color?oldY-2:oldY+2) == newY){
                            allowMove = true;
    
                            if (oldY < newY){
                                for(let y = oldY; y < newY; y++){
                                    if(y == oldY) continue;
                                    if(chessBoardData[y][newX].isEmpty == false) allowMove = false;
                                }
                                enPassant(oldX, newX, oldY +1, newY ,color);
                            }
                            if (oldY > newY){
                                for(let y = oldY; y > newY; y--){
                                    if(y == oldY) continue;
                                    if(chessBoardData[y][newX].isEmpty == false) allowMove = false;
                                }
                                enPassant(oldX, newX, oldY -1, newY ,color);
                            } 
                        }
                    }
                    return allowMove;
                case 'rook':
                    if((oldX == newX && oldY != newY)||(oldX != newX && oldY == newY)){
                        if((oldX != newX && oldY == newY)){
                            allowMove = validateMove.horizontalChecker(oldX, newX, oldY);
                        }
                        if((oldX == newX && oldY != newY)){
                            allowMove = validateMove.verticalChecker(oldY, newY, oldX);  
                        }
                    }
                    return allowMove;
                case 'bishop':
                    if(newX > oldX){
                        for (let n = 1; n<=(newX - oldX); n++){
                            if  (newX == oldX + n && newY == oldY - n) allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                            if  (newX == oldX + n && newY == oldY + n) allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                        }
                    }
                    if(newX < oldX){
                        for (let n = 1; n<=(oldX - newX); n++){
                            if  (newX == oldX - n && newY == oldY + n) allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                            if  (newX == oldX - n && newY == oldY - n) allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                        }
                    }
                    return allowMove;
                case 'knight':
                    if(oldY == newY + 2||oldY == newY - 2){
                        if(oldX == newX + 1||oldX == newX - 1) allowMove = validateMove.horseChecker(newX,newY,color);
                    }
                    if(oldX == newX + 2 ||oldX == newX - 2){
                        if(oldY == newY + 1||oldY == newY - 1) allowMove = validateMove.horseChecker(newX,newY,color);
                    }
                    return allowMove;
                case 'queen':
                    /*either vertical OR horizontal movement*/
                    if((oldX == newX && oldY != newY)||(oldX != newX && oldY == newY)){
                        //check if something is blocking horizontal or vertical movement
                        if((oldX != newX && oldY == newY)) allowMove = validateMove.horizontalChecker(oldX, newX, oldY);
                        if((oldX == newX && oldY != newY)) allowMove = validateMove.verticalChecker(oldY, newY, oldX);
                    }
                    if(newX > oldX){
                        for (let n = 1; n<=(newX - oldX); n++){
                            if  (newX == oldX + n && newY == oldY - n) allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                            if  (newX == oldX + n && newY == oldY + n) allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                        }
                    }
                    if(newX < oldX){
                        for (let n = 1; n<=(oldX - newX); n++){
                            if  (newX == oldX - n && newY == oldY + n) allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                            if  (newX == oldX - n && newY == oldY - n) allowMove = validateMove.diagonalChecker(oldX, newX, oldY, newY);
                        }
                    }
                    return allowMove;              
                case 'king':
                    if((oldX == newX && (oldY == newY + 1||oldY == newY - 1))
                    ||((oldX == newX + 1 || oldX == newX - 1) && oldY == newY)){
                        allowMove = validateMove.kingChecker(newX,newY,color);
                    }
                    if((oldX + 1 == newX && (oldY - 1 == newY || oldY + 1 == newY))
                    ||(oldX - 1 == newX && (oldY -1 == newY || oldY +1 == newY))){
                        allowMove = validateMove.kingChecker(newX,newY,color);
                    }
                    //castling logic
                    //could use a refactor
                    if(!hasMoved && validateMove.kingChecker(newX,newY,color) && validateMove.horizontalChecker(oldX,newX,oldY) &&
                     ((newX == oldX + 2 && oldY == newY)||(newX == oldX - 2 && oldY == newY)) 
                     && (color?chessBoardData[oldY][oldX].threatData.blackCheck.counter == 0:chessBoardData[oldY][oldX].threatData.whiteCheck.counter == 0)
                        &&(color?chessBoardData[newY][newX].threatData.blackCheck.counter == 0:chessBoardData[newY][newX].threatData.whiteCheck.counter == 0)){
                        if(chessBoardData[oldY][oldX + 3].pieceData != null &&chessBoardData[oldY][oldX + 3].pieceData.id == 'rook'
                        && (color?chessBoardData[oldY][oldX + 1].threatData.blackCheck.counter == 0:chessBoardData[oldY][oldX + 1].threatData.whiteCheck.counter == 0)){
                            rightRook = chessBoardData[oldY][oldX + 3].pieceData;
                            if((newX == oldX + 2 && oldY == newY)
                            &&(rightRook.color == color)
                            &&(rightRook.hasMoved == false)){
                                movePiece([oldX,oldY],[newX,newY],id,color);
                                movePiece([oldX + 3, oldY],[oldX + 1, oldY], rightRook.id, rightRook.color);
                            turnCheck = !turnCheck;
                            }
                        }
                        if(chessBoardData[oldY][oldX - 4].pieceData != null && chessBoardData[oldY][oldX - 4].pieceData.id == 'rook'
                        && (color?chessBoardData[oldY][oldX - 1].threatData.blackCheck.counter == 0:chessBoardData[oldY][oldX - 1].threatData.whiteCheck.counter == 0)){
                            leftRook = chessBoardData[oldY][oldX - 4].pieceData;
                            if((newX == oldX - 2 && oldY == newY)
                            &&(leftRook.color == color)
                            &&(leftRook.hasMoved == false)){
                            movePiece([oldX,oldY],[newX,newY],id,color);
                            movePiece([oldX - 4, oldY],[oldX - 1, oldY], leftRook.id, leftRook.color);
                            turnCheck = !turnCheck;
                            }
                        }   
                    }
                    return allowMove;
                    default:
                        return allowMove;
                }
        }
        function getThreatData (id, x, y, color, highlight){
            switch(id){
                case 'pawn':
                    otherThreatData(1,1);
                    break;    
                case 'rook':
                    verticalThreatData(0,7);
                    horizontalThreatData(0,7);
                    break;
                case 'bishop':
                    diagonalThreatData();
                    break;
                case 'queen':
                    verticalThreatData(0,7);
                    horizontalThreatData(0,7);
                    diagonalThreatData();
                    break;
                case 'knight':
                    otherThreatData(1,2);
                    break;
                case 'king':
                    otherThreatData(1,1);
                    verticalThreatData((y - 1 < 0?y:y - 1),(y + 1 > 7?y: y + 1));
                    horizontalThreatData((x - 1 < 0?x:x - 1),(x + 1 > 7?x: x + 1));
                    break;
                default:
                    return 'error!';
        
            }
            function changeData(boardData){
                function highlightMoves(x, y, color){
                    if(chessBoardData[y][x].isEmpty || chessBoardData[y][x].pieceData.color == !color){
                        chessBoardData[y][x].tileLocation.classList.add('highlighted');
                    } 
                }
                if(highlight){
                    if (id == 'pawn'){
                        if(color){
                            if((y - 1>=0)?chessBoardData[y - 1][x].isEmpty:false){
                                highlightMoves(x, y - 1,color);
                                if((y - 2 >= 0)?(chessBoardData[y - 1][x].isEmpty && chessBoardData[y-2][x].isEmpty && chessBoardData[y][x].pieceData.hasMoved == 0):false){
                                    highlightMoves(x, y - 2,color);
                                }
                                if ((!boardData.isEmpty && boardData.pieceData.color == !color)){
                                    highlightMoves(boardData.x,boardData.y,color);
                                }
                                if((boardData.x == enPassantData.x) && (boardData.y == enPassantData.y)){
                                    highlightMoves(boardData.x, boardData.y, color);
                                }
                                
                            }
                            
                        }
                        if(!color){
                            if((y + 1<=7)?chessBoardData[y + 1][x].isEmpty:false){
                                highlightMoves(x, y + 1,color);
                                if((y + 2 <= 8)?(chessBoardData[y + 1][x].isEmpty && chessBoardData[y+2][x].isEmpty && chessBoardData[y][x].pieceData.hasMoved == 0):false){
                                    highlightMoves(x, y + 2,color);
                                }
                                if (!boardData.isEmpty && boardData.pieceData.color == !color){
                                    highlightMoves(boardData.x,boardData.y,color);
                                }
                            }
                        }
                        
                        
        
                    }else{
                        highlightMoves(boardData.x, boardData.y,color);
                    }
                    
                }else{
                    if(color){
                        boardData.threatData.whiteCheck.counter++;
                        boardData.threatData.whiteCheck.threats.push(chessBoardData[y][x]);
                    }
                    if(!color){
                        boardData.threatData.blackCheck.counter++;
                        boardData.threatData.blackCheck.threats.push(chessBoardData[y][x]);
                    }
                    if(boardData.isEmpty  || ((boardData.pieceData !=null)&&(boardData.pieceData.color == !color)) ){
                        if(color && id !=null&& id != 'pawn') {
                            availableMoves.white.push({
                                id:id,
                                x:x,
                                y:y,
                                hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                move : boardData,
                            });
            
                        }
                        if(!color && id != null && id != 'pawn'){
                            availableMoves.black.push({
                                id:id,
                                x:x,
                                y:y,
                                hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                move : boardData,
                            });
                        }  
                    }
                    if ((boardData.pieceData !=null)&&(boardData.pieceData.color == !color) && id == 'pawn'){
                        if(color) {
                            availableMoves.white.push({
                                id:id,
                                x:x,
                                y:y,
                                hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                move : boardData,
                            });
            
                        }
                        if(!color){
                            availableMoves.black.push({
                                id:id,
                                x:x,
                                y:y,
                                hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                move : boardData,
                            });
                        }  
                    }
                }   
                if (id == 'pawn'){
                    if(color){
                        if((y - 1>=0)?chessBoardData[y - 1][x].isEmpty:false){
                            availableMoves.white.push({
                                id:id,
                                x:x,
                                y:y,
                                hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                move : chessBoardData[y-1][x],
                            });
                            if((y - 2 >= 0)?(chessBoardData[y - 1][x].isEmpty && chessBoardData[y-2][x].isEmpty && chessBoardData[y][x].pieceData.hasMoved == 0):false){
                                availableMoves.white.push({
                                    id:id,
                                    x:x,
                                    y:y,
                                    hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                    move : chessBoardData[y-2][x],
                                });
                            }
                        }
                    }
                    if(!color){
                        if((y + 1 <=7)?chessBoardData[y + 1][x].isEmpty:false){
                            availableMoves.black.push({
                                id:id,
                                x:x,
                                y:y,
                                hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                move : chessBoardData[y+1][x],
                            });
                            if((y + 2 <=7)?(chessBoardData[y+1][x].isEmpty && chessBoardData[y+2][x].isEmpty && chessBoardData[y][x].pieceData.hasMoved == 0):false){
                                availableMoves.black.push({
                                    id:id,
                                    x:x,
                                    y:y,
                                    hasMoved: chessBoardData[y][x].pieceData.hasMoved,
                                    move : chessBoardData[y+2][x],
                                });
                            }
                        }
                    }    
                }
        
            }
            function verticalThreatData(minY, maxY){
                for(let currentY = y; currentY<=maxY; currentY++){    
                    if (currentY == y)continue;
                    changeData(chessBoardData[currentY][x]);    
                    if(!piece.validateMove.verticalChecker(y, currentY + 1, x))break;
                }
                for(let currentY = y; currentY>=minY; currentY--){  
                    if (currentY == y)continue;    
                    changeData(chessBoardData[currentY][x]);
                    if(!piece.validateMove.verticalChecker(y, currentY - 1, x))break;
                }
        
            }
            function horizontalThreatData(minX, maxX){
                for(let currentX = x; currentX<=maxX; currentX++){  
                    if (currentX == x) continue;
                    changeData(chessBoardData[y][currentX]);
                    if(!piece.validateMove.horizontalChecker(x, currentX + 1, y))break;
                }
                for(let currentX = x; currentX>=minX; currentX--){ 
                    if (currentX == x) continue;  
                    changeData(chessBoardData[y][currentX]);
                    if(!piece.validateMove.horizontalChecker(x, currentX - 1, y))break;
                }
        
            }
            function diagonalThreatData(){
                const findLimitMax = (x, y) =>{
                    let limitMax = 0;
                    if(x < y) limitMax = x;
                    else if (x >  y) limitMax = y;
                    else if(x = y) limitMax = x;
                    return limitMax;
                }
                for (let n = 1; n <= findLimitMax((7-x),y); n++){
                    changeData(chessBoardData[y - n][x + n]);
                    if(!piece.validateMove.diagonalChecker(x, (x+n) + 1, y, (y-n) - 1))break;
                }
                for (let n = 1; n <= findLimitMax((7-x),(7 - y)); n++){
                    changeData(chessBoardData[y + n][x + n]); 
                    if(!piece.validateMove.diagonalChecker(x, (x+n) + 1, y, (y+n) + 1))break;
                }
                for (let n = 1; n <= findLimitMax(x,(7 - y)); n++){
                    changeData(chessBoardData[y + n][x - n]);
                    if(!piece.validateMove.diagonalChecker(x, (x-n) - 1, y, (y+n) + 1))break;
                }
                for (let n = 1; n <= findLimitMax(x, y); n++){
                    changeData(chessBoardData[y - n][x - n]);
                    if(!piece.validateMove.diagonalChecker(x, (x-n) - 1, y, (y-n) - 1))break;
                }
        
            }
            function otherThreatData(modX, modY){
                if((x + modX) <= 7 && (y - modY) >= 0){
                    if(color) changeData(chessBoardData[y - modY][x + modX]);
                    if(!color && (id == 'knight' || id == 'king')) changeData(chessBoardData[y - modY][x + modX]);
                }
                if((x - modX) >=0 && (y + modY) <=7){
                    if(!color) changeData(chessBoardData[y + modY][x - modX]);
                    if(color && (id == 'knight' || id == 'king')) changeData(chessBoardData[y + modY][x - modX]);
                }
                if((x-modX)>= 0 && (y-modY)>=0){
                    if(color)changeData(chessBoardData[y - modY][x - modX]);
                    if(!color && (id == 'knight' || id == 'king')) changeData(chessBoardData[y - modY][x - modX]);
                }
                if((x+modX)<=7 &&(y+modY)<=7){
                    if(!color)changeData(chessBoardData[y + modY][x + modX]);
                    if(color && (id == 'knight' || id == 'king')) changeData(chessBoardData[y + modY][x + modX]);
                    
                }
                if(id =='knight'){
                    if((x+modY)<=7 && (y+modX)<=7) changeData(chessBoardData[y + modX][x + modY]);
                    if((x+modY)<=7 && (y-modX)>=0) changeData(chessBoardData[y - modX][x + modY]);
                    if((x-modY)>=0 && (y-modX)>=0) changeData(chessBoardData[y - modX][x - modY]);
                    if((x-modY)>=0 && (y+modX)<=7) changeData(chessBoardData[y + modX][x - modY]);
                }      
            }
        }
        function enPassant (oldX, newX, oldY, newY ,color){
            if(turnCheck == color){
                enPassantData = {
                    color:color,
                    x: oldX,
                    y: oldY,
                    target:{
                        x:newX,
                        y:newY,
                    },
                } 
            }
        }
        function eatChecker(x,y, color){
            if(chessBoardData[y][x].isEmpty == false) return chessBoardData[y][x].pieceData.color == !color;
        }
        const eatMove = (x, y) => chessBoardData[y][x].tileLocation.removeChild(chessBoardData[y][x].tileLocation.lastChild);
        function movePiece(oldCoords,newCoords,id,color, hasMoved){   
            
            if(color)numberOfMoves++;  
            let oldX = oldCoords[0], oldY = oldCoords[1];
            let newX = newCoords[0], newY = newCoords[1]; 
            let storeEat;
            if (eatChecker(newX, newY,color)){
                storeEat =  chessBoardData[newY][newX].pieceData;
                eatMove(newX, newY);
            } 
            pieceMaker(newX, newY, id, color, (hasMoved + 1));
            pieceUnmaker(oldX, oldY);
            refreshData();
            if (isKingInCheck() == true){
                undoLastMove(oldX,oldY,newX,newY ,id,color, hasMoved, storeEat);
                refreshData();
                turnCheck = !turnCheck;
            }

            if (id == 'pawn'){
                if(color){
                    if(newY == 0){
                        console.log('Promote')
                    }
                }
                if(!color){
                    if(newY == 7){
                        console.log('Promote')
                    }
                }
            }
            if(isKingInCheck()){
                refreshData();
                let possible;
                if(isKingInCheck() == 'white'){
                    possible = availableMoves.white;
                    checkmateChecker(true, possible);
                }
                if(isKingInCheck() == 'black'){
                    possible = availableMoves.black;
                    checkmateChecker(false, possible);
                }
            }
            
            //stalemate checker
            
            if(isKingInCheck() == false){
                let possible;
                if(color){
                    possible = availableMoves.black;
                    checkmateChecker(false, possible, true);
                }
                if(!color){
                    possible = availableMoves.white;
                    checkmateChecker(true, possible, true);
                }
            }
            undoData = {oldX,oldY,newX,newY ,id,color, hasMoved, storeEat};
            clearInfo();
            turnCheck = !turnCheck;
            
            enPassant(null, null, null, null ,enPassantData.color);
        }
        function undoLastMove (oldX, oldY, newX, newY, id, color, hasMoved, storeEat){
            pieceMaker(oldX, oldY, id, color, (hasMoved == 0?0:hasMoved - 1));
            pieceUnmaker(newX, newY);
            if(storeEat)pieceMaker(storeEat.x, storeEat.y, storeEat.id,storeEat.color, storeEat.hasMoved);
        }
        function isKingInCheck(){
            for(let y = 0; y <8; y++){
                for(let x = 0; x <8; x++){
                    if (chessBoardData[y][x].pieceData != null && chessBoardData[y][x].isEmpty == false){
                        if(chessBoardData[y][x].pieceData.id == 'king'){
                            if((chessBoardData[y][x].pieceData.color)&&(chessBoardData[y][x].threatData.blackCheck.counter)){
                                if (turnCheck) return true; 
                                return 'white';  
                            }
                            if((!chessBoardData[y][x].pieceData.color)&&(chessBoardData[y][x].threatData.whiteCheck.counter)){
                                if (!turnCheck) return true;
                                return 'black'
                            }
                            
                        }
                    }
    
                    
                }
            
            }
            return false;
        }
        function checkmateChecker(color, possible, stalemate){
            for(let n = 0; n < possible.length; n++){
                let hasMoved = possible[n].hasMoved;
                let oldX = possible[n].x, oldY = possible[n].y;
                let newX = possible[n].move.x, newY = possible[n].move.y;
                let storeEat;
                if (eatChecker(newX, newY,color)){
                    storeEat =  chessBoardData[newY][newX].pieceData;
                    eatMove(newX, newY);
                }
                pieceMaker(newX, newY, possible[n].id, color, (hasMoved + 1));
                pieceUnmaker(oldX, oldY);
                refreshData();
                if (isKingInCheck() == false){
                    undoLastMove(oldX, oldY, newX, newY, possible[n].id, color, hasMoved, storeEat);
                    refreshData(); 
                    break;
                }
                
                if(n == possible.length -1 && isKingInCheck()){
                    if(stalemate != null) {
                        console.log('stalemate at '+numberOfMoves+' moves');
                    }else{
                        console.log('checkmate at '+numberOfMoves+' moves');
                    }
                    
                } 
                undoLastMove(oldX, oldY, newX, newY, possible[n].id, color, hasMoved, storeEat);
                refreshData();
            }  
        }
        const validateMove =(()=>{
            function horizontalChecker(oldX, newX, y){
                let allowHorizontal = true;
                if (oldX < newX){
                    for(let x = oldX; x < newX; x++){
                        if(x == oldX) continue;
                        if(chessBoardData[y][x].isEmpty == false) allowHorizontal = false;
                    }
                }
                if (oldX > newX){
                    for(let x = oldX; x > newX; x--){
                        if(x == oldX) continue;
                        if(chessBoardData[y][x].isEmpty == false) allowHorizontal = false;
                    }
                    
                }
                return allowHorizontal;
            }
            function verticalChecker(oldY, newY, x){
                let allowVertical = true;
                if (oldY < newY){
                    for(let y = oldY; y < newY; y++){
                        if(y == oldY) continue;
                        if(chessBoardData[y][x].isEmpty == false) allowVertical = false;
                    } 
                }
                if (oldY > newY){
                    for(let y = oldY; y > newY; y--){
                        if(y == oldY) continue;
                        if(chessBoardData[y][x].isEmpty == false) allowVertical = false;
                    }
                }
                return allowVertical;
            }
            function diagonalChecker(oldX, newX, oldY, newY){
                let allowDiagonal = true;
                if(newX > oldX){
                    for (let n = 1; n<(newX - oldX); n++){
                        if(newY<oldY){
                            if(chessBoardData[oldY - n][oldX + n].isEmpty == false) allowDiagonal = false;
                            
                        }
                        if(newY>oldY){
                            if(chessBoardData[oldY + n][oldX + n].isEmpty == false) allowDiagonal = false;
                        }
                    }
                }
                if(newX < oldX){
                    for (let n = 1; n<(oldX - newX); n++){
                        if(newY<oldY){
                            if(chessBoardData[oldY - n][oldX - n].isEmpty == false) allowDiagonal = false;
                        }
                        if(newY>oldY){
                            if(chessBoardData[oldY + n][oldX - n].isEmpty == false) allowDiagonal = false;
                        }
                    }
                }
                return allowDiagonal;
            }
            function horseChecker(newX,newY, color){
                let allowHorse = true;
                if (eatChecker(newX,newY,color)) return true;
                if(chessBoardData[newY][newX].isEmpty == false){
                    allowHorse = false;
                }
                return allowHorse;
            }
            function kingChecker(newX, newY, color){
                let allowKing = true;
                if (eatChecker(newX,newY,color)) return true;
                if(chessBoardData[newY][newX].isEmpty == false) allowKing = false;
                return allowKing;
            }
            return{
                diagonalChecker,
                horizontalChecker, 
                horseChecker,
                kingChecker,
                verticalChecker,
            };
        })();
        undoBtn.onclick = ()=>{
            if (numberOfMoves > 0){
                undoLastMove(undoData.oldX, undoData.oldY, undoData.newX, undoData.newY, undoData.id, undoData.color, undoData.hasMoved, undoData.storeEat);
                turnCheck = !turnCheck;
                undoData = {};
                if (!undoData.color){
                    numberOfMoves--;
                }
                
            }
        }
        return {getThreatData, getMoveData,movePiece, pieceMaker, validateMove};
    })();
    function makeBoard(){
        while (gameBoard.hasChildNodes()) gameBoard.removeChild(gameBoard.lastChild);
        for(let y = 0; y < 8; y++){
            let chessBoardTileContainer = document.createElement('div');
            chessBoardTileContainer.classList.add('tile-container');
            let chessBoardTileData = [];
            for(let x = 0; x < 8; x++){    
                let chessBoardTileDiv = document.createElement('div');
                chessBoardTileDiv.classList.add('tile');
                chessBoardTileDiv.style.backgroundColor = (((y+1) + (x+1))%2?'rgb(118,150,86)':'rgb(238,238,210');
                let TileData ={
                    isEmpty: true,
                    notation: (String.fromCharCode(97+x))+(y+1),
                    pieceData:null,
                    tileLocation: chessBoardTileDiv,
                    threatData:{
                        whiteCheck: {
                            counter:0,
                            threats:[]
                        },
                        blackCheck: {
                            counter: 0,
                            threats:[]
                        }
                    },
                    x:x,
                    y:y
                };
                //chessBoardTileDiv.textContent = TileData.notation;
                chessBoardTileDiv.onclick = () =>{
                    movingData.newCoords.x = x;
                    movingData.newCoords.y = y;
                    clickTile();
                }
                chessBoardTileContainer.append(chessBoardTileDiv);
                chessBoardTileData.push(TileData);
            }
            gameBoard.append(chessBoardTileContainer);
            chessBoardData.push(chessBoardTileData);
        }
        function clickTile(){
            let oldX = movingData.oldCoords.x, oldY = movingData.oldCoords.y;
            let newX = movingData.newCoords.x, newY = movingData.newCoords.y;
            if(piece.getMoveData(movingData.id, [oldX, oldY], [newX, newY],movingData.color)){
                piece.movePiece([oldX, oldY], [newX, newY], movingData.id, movingData.color, movingData.hasMoved);
            }else{
                clearInfo();
                refreshData();
            }
        }   
    }
    function clearInfo(){
        movingData.color = null;
        movingData.hasMoved = null;
        movingData.id = null;
        movingData.newCoords.x = null;
        movingData.newCoords.y = null;
        movingData.oldCoords.x = null;
        movingData.oldCoords.y = null;
        movingData.piece = null;
    }
    function refreshData(){
        let activePieces = [];
        availableMoves.white = [];
        availableMoves.black = []; 
        for(let y = 0; y <8; y++){
            for(let x = 0; x <8; x++){
                chessBoardData[y][x].threatData.whiteCheck.counter = 0;
                chessBoardData[y][x].threatData.whiteCheck.threats = [];
                chessBoardData[y][x].threatData.blackCheck.counter = 0;
                chessBoardData[y][x].threatData.blackCheck.threats = [];
                chessBoardData[y][x].tileLocation.classList.remove('highlighted');
                clearInfo();
                if (chessBoardData[y][x].pieceData != null && chessBoardData[y][x].isEmpty == false){
                    activePieces.push(chessBoardData[y][x].pieceData);
                }   
                }
            }
            for(let i = 0; i<activePieces.length; i++){
                piece.getThreatData(activePieces[i].id, activePieces[i].x, activePieces[i].y, activePieces[i].color);
            }
    }
    function generateGame(){
        for (let x = 0; x<8;x++){
            piece.pieceMaker(x,6,'pawn',true);
            piece.pieceMaker(x,1,'pawn',false); 
        }
        //kings
        piece.pieceMaker(4,0,'king',false);
        piece.pieceMaker(4,7,'king',true);
        //rooks
        piece.pieceMaker(0,0,'rook',false);
        piece.pieceMaker(0,7,'rook',true);
        piece.pieceMaker(7,0,'rook',false);
        piece.pieceMaker(7,7,'rook',true);
        //queens
        piece.pieceMaker(3,0,'queen',false);
        piece.pieceMaker(3,7,'queen',true);
        //bishops
        piece.pieceMaker(2,0,'bishop',false);
        piece.pieceMaker(2,7,'bishop',true);
        piece.pieceMaker(5,0,'bishop',false);
        piece.pieceMaker(5,7,'bishop',true);
        //knights
        piece.pieceMaker(1,0,'knight',false);
        piece.pieceMaker(1,7,'knight',true);
        piece.pieceMaker(6,0,'knight',false);
        piece.pieceMaker(6,7,'knight',true);
        /*
       piece.pieceMaker(4,4, 'king', true);
       piece.pieceMaker(3,7, 'rook', false);
       piece.pieceMaker(6,0, 'rook', false);
       piece.pieceMaker(6,3, 'rook', false);
       piece.pieceMaker(0,5, 'rook', false);*/
        refreshData();
    }
    return{makeBoard,generateGame}
})();
