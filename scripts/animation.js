//this is for piece animation when moving
const boardDiv = document.getElementById('animation-board');
export function playAnimation(oldTile, newTile, newPiece){
    if(boardDiv.hasChildNodes()) boardDiv.removeChild(boardDiv.lastChild);
    newTile.style.opacity = '0';
    let oldPos = oldTile.getBoundingClientRect();
    let newPos = newTile.getBoundingClientRect();
    let oldPosY = oldPos.top;
    let oldPosX = oldPos.left;

    let newPosY = newPos.top;
    let newPosX = newPos.left;
    let posY = oldPosY;
    let posX = oldPosX;
    console.log(newPiece);
    const piece = document.createElement('div');
    piece.classList.add('animation-piece');
    piece.classList.add((newPiece[0]?'white':'black')+'-'+newPiece[1]);
    piece.style.top = oldPosY + 'px';
    piece.style.left = oldPosX + 'px';
    boardDiv.appendChild(piece);
    window.setTimeout(function() {
        jump();
      }, 1); 
    function jump(){
        piece.style.top = newPosY + 3 + 'px';
        piece.style.left = newPosX + 3 +'px';
        
        window.setTimeout(function() {
            piece.style.opacity = '0';
            newTile.style.opacity = '1';
          }, 500);
        
    }
    /*
    while(posY != newPosY){
        piece.style.top = posY + 'px';
        console.log(piece.style.top);
        if(oldPosY>newPosY){
            posY--;
        }
        if(oldPosY<newPosY){
            posY++;
        }
    }*/
    return;
    clearInterval(id);
    id = setInterval(moveAnimationY, 0.00005);
    function moveAnimationY(){
        if(posY == newPosY){
            clearInterval(id);
            boardDiv.removeChild(boardDiv.lastChild);
        }else{
            if(oldPosY<newPosY){
                posY++;
                piece.style.top = posY + 'px';
            }
            if(oldPosY>newPosY){
                posY--;
                piece.style.top = posY + 'px';
            }
        }
    }
    function moveAnimationX(){
        if(oldPosY == newPosY && oldPosX == newPosX){
            clearInterval(id);
            boardDiv.removeChild(boardDiv.lastChild);
        }else{
            if(oldPosY<newPosY){
                posY++;
                piece.style.top = posY + 'px';
            }
            if(oldPosX<newPosX){
                posX++;
                piece.style.left = posX + 'px';
            }

            
            if(oldPosX>newPosX){
                posX--;
                piece.style.left = posX + 'px';
            }
        }
    }
    console.log(oldPosY, oldPosX);;
    console.log(newPosY, newPosX);
}