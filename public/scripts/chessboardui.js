class ChessBoard {
    constructor(parent, boardConf)   {
        
        this.maxFile = 8;
        this.maxRank = 8;
        this.PIECE = "piece";
        this.SQUARE = "square"

        this.SoundSource = {
            "move": new sound("sounds/pieceMove.mp3"),
            // "capture": new sound("sounds/pieceCapture.mp3"),
            // "castle": new sound("sounds/castle.mp3"),
            // "check": new sound("sounds/check.mp3"),
            // "checkmate": new sound("sounds/checkmate.mp3")
        }
        
        for(let i=1;i<=this.maxRank;i++) {
            for(let j=1;j<=this.maxFile;j++) {
                let divBox = document.createElement("div");
                divBox.setAttribute("class", this.SQUARE);
                divBox.setAttribute("id", (8-i+1)+""+j);
                parent.appendChild(divBox);
                // if(i == 8)    {
                //     let temp = document.createElement("p");
                //     temp.innerHTML = j;
                //     divBox.appendChild(temp);
                // }
                // if(j == 1)  {
                //     let temp = document.createElement("p");
                //     temp.innerHTML = 8-i+1;
                //     divBox.appendChild(temp);
                // }
            }
        }

        for(let i=1;i<=this.maxRank;i++)    {
            for(let j = 1;j<=this.maxFile;j++)  {
                let pieceType = boardConf[i][j].toString();
                let parent = (i)+""+j;
                if(pieceType != 0)   {
                    let piece = document.createElement("img");
                    piece.setAttribute("class", this.PIECE);
                    piece.src = "/images/pieces/"+pieceType+".svg";
                    document.getElementById(parent).appendChild(piece);        
                }
            }
        }

    }
    movePieces(movable)    {
        movable.forEach((changePos) => {
            let srcPos = document.getElementById(changePos[0]);
            let destPos = document.getElementById(changePos[1]);
            $(destPos).empty();
            $(srcPos).children().appendTo(destPos);
            $(srcPos).empty();
            this.SoundSource["move"].play();
        });
    }
    removePieces(pieces)    {
        pieces.forEach((elm) => {
            let destPos = document.getElementById(elm);
            $(destPos).empty();
        });
    }
    activatePos(positions)  {
        positions.forEach(function(elm) {
            document.getElementById(elm[0]+""+elm[1]).classList.add('activate');
        });
    }
    deactivatePos(positions)  {
        positions.forEach(function(elm) {
            document.getElementById(elm[0]+""+elm[1]).classList.remove('activate');
        });
    }
};


//NEW FILE MAYBE



function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}