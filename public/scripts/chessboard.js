//Piece Type
let NONE = 0;
let PAWN = 1;
let KNIGHT = 2;
let BISHOP = 3;
let ROOK = 4;
let QUEEN = 5;
let KING = 6;

//Piece Color
let WHITE = 8;
let BLACK = 16;

//Create Board
let board = new Array(8).fill(0).map(() => new Array(8).fill(0));

//Piece Mapping
let pieceDesp = {
            'p': PAWN,
            'n': KNIGHT,
            'b': BISHOP,
            'r': ROOK,
            'q': QUEEN,
            'k': KING
        }

//Initial Board Description
let FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w";
let fenBoard = FEN.split(' ')[0];
let playerTurn = (FEN.split(' ')[1] == 'w')?1:0;
//Initalise board with FEN string
let rank = 1, file = 1;
for(let i=0;i<fenBoard.length;i++)   {
    if(fenBoard[i].charCodeAt(0) >= "0".charCodeAt(0) && fenBoard[i].charCodeAt(0) <= "9".charCodeAt(0))  {
        file+=(fenBoard[i].charCodeAt(0) - "0".charCodeAt(0));
    }
    else if(fenBoard[i] == "/") {
        rank++;
        file = 1;
    }
    else    {
        placePiece(rank, file, fenBoard[i]);
        file++;
    }
}

//Piece placer
function placePiece(rank, file, piece)   {
    let pieceColor = (piece == piece.toUpperCase()) ? 8:16;
    let pieceType = pieceDesp[piece.toLowerCase()];
    board[rank-1][file-1] = (pieceColor | pieceType);
}

//Chessboard update after a move is played
function updateChessBoard(source, dest) {
    let source_rank = Math.floor(source/10);
    let source_file = source%10;
    let dest_rank = Math.floor(dest/10);
    let dest_file = dest%10;
    board[dest_rank-1][dest_file-1] = board[source_rank-1][source_file-1];
    board[source_rank-1][source_file-1] = 0;
    console.log(board);
}