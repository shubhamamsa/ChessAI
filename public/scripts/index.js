const boardShape = document.getElementById('chessBoard');
const maxFile = 8;
const maxRank = 8;

let currentPiece = null;
let currentParent = null;
let dropParent = null;

for(let i=1;i<=maxRank;i++) {
    for(let j=1;j<=maxFile;j++) {
        const height = (i-1)*12.5;
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

function placePiece(parent, pieceType) {
    if(pieceType != 0)   {
        let piece = document.createElement("img");
        piece.setAttribute("id", pieceType+"_"+parent);
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

let pieceMoveSound = new sound("sounds/pieceMove.mp3")

for(let i=1;i<=maxRank;i++) 
    for(let j = 1;j<=maxFile;j++)   
        placePiece((8-i+1)+""+j, board[8-i][j-1].toString());

$(".BlackPiece, .WhitePiece").draggable({
    zIndex: 5,
    containment: "#chessBoard",
    revert : true,
    revertDuration: 0
});
$(".droppable").droppable({
    hoverClass: "activeBox",
    drop: function()  {
        if(dropParent != null)
            $("#"+dropParent).removeClass("droppedBox");
        let pieceNum = currentPiece.split('_')[0];
        let parentId = currentPiece.split('_')[1];
        dropParent = this.id;
        updateChessBoard(parseInt(parentId), parseInt(dropParent));
        $("#"+dropParent).empty();
        $("#"+currentPiece).attr("id", pieceNum+"_"+dropParent).appendTo("#"+dropParent);
        $(this).addClass("droppedBox");
        pieceMoveSound.play();
    }
});

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


 $(".BlackPiece, .WhitePiece").on("mousedown", function(ev){
    if(currentPiece != null)
        currentParent.droppable( "option", "disabled", false);
    currentPiece = ev.target.id;
    currentParent = $("#"+currentPiece).parent();
    console.log()
    currentParent.droppable( "option", "disabled", true );
 });