const boardShape = document.getElementById('chessBoard');
const maxFile = 8;
const maxRank = 8;
let currentPiece = null;
let currentParent = null;
let dropParent = null;
let pieceMoveSound = new sound("sounds/pieceMove.mp3");
let movable = [];

function init()    {
    for(let i=1;i<=maxRank;i++) {
        for(let j=1;j<=maxFile;j++) {
            const height = (8-i)*12.5;
            const width = (j-1)*12.5;
            let divBox = document.createElement("div");
            divBox.setAttribute("class", "droppable");
            divBox.setAttribute("id", (i)+""+j);
            divBox.style.width = "12.5%";
            divBox.style.height = "12.5%";
            if((i+j)%2 == 0)
                divBox.style.background = "#f0f0f0";
            else
                divBox.style.background = "#4f77b8";
            divBox.style.marginTop = height+"%";
            divBox.style.marginLeft = width+"%";
            divBox.style.position = "absolute";
            divBox.style.display = "flex";
            divBox.style.justifyContent = "center";
            boardShape.appendChild(divBox);
        }
    }

    for(let i=1;i<=maxRank;i++) 
        for(let j = 1;j<=maxFile;j++)   
            placePiece((8-i+1)+""+j, board[8-i][j-1].toString());
    
    $(".BlackPiece, .WhitePiece").draggable({
        zIndex: 5,
        containment: "#chessBoard",
        revert : true,
        revertDuration: 0
    });
    
    $(".BlackPiece").draggable("option", "disabled", playerTurn == 'w');
    $(".WhitePiece").draggable("option", "disabled", playerTurn == 'b');

    $(".droppable").droppable({
        hoverClass: "activeBox",
        drop: function()  {
            if(movable !== undefined)   {
                movable.forEach(elm => {
                    $("#"+elm[0]+""+elm[1]).droppable("option", "disabled", true);
                    $("#"+elm[0]+""+elm[1]).css("opacity", "100%");
                });
            }
            movable = [];
            if(dropParent != null)
                dropParent.removeClass("droppedBox");
            dropParent = $(this);
            updateChessBoard(parseInt(currentParent.prop('id')), parseInt(dropParent.prop('id')));
            dropParent.empty();
            currentPiece.appendTo(dropParent);
            dropParent.addClass("droppedBox");
            pieceMoveSound.play();
        }
    });

    $(".droppable").droppable("option", "disabled", true);
    
    $(".BlackPiece, .WhitePiece").on("mousedown", function(ev){
        ev.preventDefault();
        if(movable !== undefined)   {
            movable.forEach(elm => {
                $("#"+elm[0]+""+elm[1]).droppable("option", "disabled", true);
                $("#"+elm[0]+""+elm[1]).css("opacity", "100%");
            });
        }
        movable = [];
        currentPiece = $(this);
        currentParent = currentPiece.parent();
        movable = legalMoves[parseInt(currentParent.prop('id'))];
        if(movable !== undefined)   {
            movable.forEach(elm => {
                $("#"+elm[0]+""+elm[1]).droppable("option", "disabled", false);
                $("#"+elm[0]+""+elm[1]).css("opacity", "20%");
            });
        }
    });   
 }

 
function placePiece(parent, pieceType) {
    if(pieceType != 0)   {
        let piece = document.createElement("img");
        if(pieceType >= parseInt(16))
        piece.setAttribute("class", "BlackPiece");
        else
        piece.setAttribute("class", "WhitePiece");
        piece.src = "/images/pieces/"+pieceType+".svg";
        piece.style.height = "90%";
        piece.style.top = "5%";
        piece.style.position = "relative";
        document.getElementById(parent).appendChild(piece);        
    }
}
    
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

function changePlayer()  {
    for(const [key, value] of Object.entries(legalMoves))   {
        $("#"+(value+1)).droppable('option', 'disabled', true);
        $("#"+(value+1)).css("opacity", "100%");
    }
    $(".BlackPiece").draggable("option", "disabled", playerTurn == 'b');
    $(".WhitePiece").draggable("option", "disabled", playerTurn == 'w');
}
    
init();