const boardShape = document.getElementById('chessBoard');
const FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w";

const chessBoard = new ChessBoardConfig(FEN);
const game = new ChessBoard(boardShape, chessBoard.boardConf);

const pieces = document.getElementsByClassName(game.PIECE);
const squares = document.getElementsByClassName(game.SQUARE);

let srcPoint = null, destPoint = null;

$(pieces).draggable({
    zIndex: 5,
    containment: "#chessBoard",
    revert : true,
    revertDuration: 0
});

$(squares).droppable({
    hoverClass: "activeBox",
    drop: function()  {
        destPoint = $(this);
        makeMove();
    }
});

$(pieces).on("mousedown", function() {
    if(srcPoint !== null)
    game.deactivatePos(chessBoard.retrievePieceMoves(srcPoint.prop('id')));
    srcPoint = $(this).parent();
    game.activatePos(chessBoard.retrievePieceMoves(srcPoint.prop('id')));
});

function makeMove() {
    this.sourceRank = Math.floor(parseInt(srcPoint.prop('id'))/10);
    this.sourceFile = parseInt(srcPoint.prop('id'))%10;
    this.destRank = Math.floor(parseInt(destPoint.prop('id'))/10);
    this.destFile = parseInt(destPoint.prop('id'))%10;
    game.deactivatePos(chessBoard.retrievePieceMoves(srcPoint.prop('id')));
    this.moves = chessBoard.updateChessBoard(this.sourceRank, this.sourceFile, this.destRank, this.destFile);
    if(this.moves[0] !== undefined)
        game.movePieces(this.moves[0]);
    if(this.moves[1] !== undefined)
        game.removePieces(this.moves[1]);
}