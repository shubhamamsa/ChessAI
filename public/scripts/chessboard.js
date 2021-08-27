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

let whitePieces = new Set();
let blackPieces = new Set();

let WKCastle = 1, WQCastle = 1, BQCastle = 1, BKCastle = 1;
let QRookFile = 0, KRookFile = 7;

let legalMoves = {};

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
let playerTurn = FEN.split(' ')[1];
//Initalise board with FEN string
let rank = 8, file = 1;
for(let i=0;i<fenBoard.length;i++)   {
    if(fenBoard[i].charCodeAt(0) >= "0".charCodeAt(0) && fenBoard[i].charCodeAt(0) <= "9".charCodeAt(0))  {
        file+=(fenBoard[i].charCodeAt(0) - "0".charCodeAt(0));
    }
    else if(fenBoard[i] == "/") {
        rank--;
        file = 1;
    }
    else    {
        placePiece(rank, file, fenBoard[i]);
        file++;
    }
}
calcMoves();

//Piece placer
function placePiece(rank, file, piece)   {
    let pieceColor = (piece == piece.toUpperCase()) ? 8:16;
    let pieceType = pieceDesp[piece.toLowerCase()];
    board[rank-1][file-1] = (pieceColor | pieceType);
    if(pieceColor == WHITE)
        whitePieces.add((rank-1)*10+file-1);
    else
        blackPieces.add((rank-1)*10+file-1);
}

//Chessboard update after a move is played
async function updateChessBoard(source, dest) {
    let source_rank = Math.floor(source/10);
    let source_file = source%10;
    let dest_rank = Math.floor(dest/10);
    let dest_file = dest%10;
    if(playerTurn == 'w')   {
        if(board[source_rank-1][source_file-1] == (WHITE | ROOK)) {
            if(source_file-1 == QRookFile)
                WQCastle = 0;
            else if(source_file-1 == KRookFile)
                WKCastle = 0;
        }
        else if(board[source_rank-1][source_file-1] == (WHITE | KING))    {
            WQCastle = WKCastle = 0;
        }
        whitePieces.delete((source_rank-1)*10+source_file-1);
        whitePieces.add((dest_rank-1)*10+dest_file-1);
        blackPieces.delete((dest_rank-1)*10+dest_file-1);
    }
    else    {
        if(board[source_rank-1][source_file-1] == (BLACK | ROOK)) {
            if(source_file-1 == QRookFile)
                BQCastle = 0;
            else if(source_file-1 == KRookFile)
                BKCastle = 0;
        }
        else if(board[source_rank-1][source_file-1] == (BLACK | KING))    {
            BQCastle = BKCastle = 0;
        }
        blackPieces.delete((source_rank-1)*10+source_file-1);
        blackPieces.add((dest_rank-1)*10+dest_file-1);
        whitePieces.delete((dest_rank-1)*10+dest_file-1);
    }
    if((board[source_rank-1][source_file-1] & 7) == (KING)) {
        if(source_file - dest_file == 2)    {
            board[dest_rank-1][dest_file+1-1] = board[dest_rank-1][QRookFile];
            board[dest_rank-1][QRookFile] = 0;
            let newParent = $("#"+dest_rank+""+(dest_file+1));
            newParent.empty();
            $("#"+dest_rank+""+(QRookFile+1)).children().appendTo(newParent);
            if(playerTurn == 'w')   {
                whitePieces.delete((source_rank-1)*10+QRookFile);
                whitePieces.add((dest_rank-1)*10+dest_file+1-1);
            }
            else    {
                blackPieces.delete((source_rank-1)*10+QRookFile);
                blackPieces.add((dest_rank-1)*10+dest_file+1-1);
            }
        }
        else if(dest_file-source_file == 2) {
            board[dest_rank-1][dest_file-1-1] = board[dest_rank-1][KRookFile];
            board[dest_rank-1][KRookFile] = 0;
            let newParent = $("#"+dest_rank+""+(dest_file-1));
            newParent.empty();
            $("#"+dest_rank+""+(KRookFile+1)).children().appendTo(newParent);
            if(playerTurn == 'w')   {
                whitePieces.delete((dest_rank-1)*10+KRookFile);
                whitePieces.add((dest_rank-1)*10+dest_file-1-1);
            }
            else    {
                blackPieces.delete((dest_rank-1)*10+KRookFile);
                blackPieces.add((dest_rank-1)*10+dest_file-1-1);
            }
        }
    }
    board[dest_rank-1][dest_file-1] = board[source_rank-1][source_file-1];
    board[source_rank-1][source_file-1] = 0;
    await changePlayer();
    if(playerTurn == 'w')
        playerTurn = 'b';
    else
        playerTurn = 'w';
    await calcMoves();
    // console.log(playerTurn);
    // console.log(legalMoves);
    // console.log(board);
}

function calcMoves()    {
    legalMoves = {};
    if(playerTurn == 'w')   {
        whitePieces.forEach(elm => {
            calcIndividualMoves(Math.floor(elm/10), elm%10);
        });
    }
    else    {
        blackPieces.forEach(elm => {
            calcIndividualMoves(Math.floor(elm/10), elm%10);
        });
    }
}

function calcIndividualMoves(rank, file) {
    let pieceType = board[rank][file];
    if(playerTurn == 'w')
        pieceType = (pieceType ^ WHITE);
    else
        pieceType = (pieceType ^ BLACK);
    switch(pieceType)   {
        case PAWN:
            PawnLegalMoves(rank, file);
            break;
        case KNIGHT:
            KKLegalMoves(rank, file, KNIGHT);
            break;
        case BISHOP:
            BRQLegalMoves(rank, file, BISHOP);
            break;
        case ROOK:
            BRQLegalMoves(rank, file, ROOK);
            break;
        case QUEEN:
            BRQLegalMoves(rank, file, QUEEN);
            break;
        case KING:
            KKLegalMoves(rank, file, KING);
            break;
    }
}

function PawnLegalMoves(rank, file)   {
    let tempMoves = [];
    let direction = ((board[rank][file]^PAWN) == WHITE) ? 1:-1;
    let defRank = ((board[rank][file]^PAWN) == WHITE) ? 1:6;
    let enemyPiece = ((board[rank][file]^PAWN) == WHITE) ? [BLACK, Infinity]:[WHITE, BLACK-1];
    if(rank+direction < 8 && rank+direction >= 0 && board[rank+direction][file] == 0)    {
        tempMoves.push([rank+direction+1, file+1]);
        if(rank == defRank && board[rank+2*direction][file] == 0)
            tempMoves.push([rank+2*direction+1, file+1]);
    }
    if(rank+direction < 8 && rank+direction >= 0 && file+1 < 8 && board[rank+direction][file+1] >= enemyPiece[0] && board[rank+direction][file+1] <= enemyPiece[1])
        tempMoves.push([rank+direction+1, file+1+1]);
    if(rank+direction < 8 && rank+direction >= 0 && file-1 >= 0 && board[rank+direction][file-1] >= enemyPiece[0] && board[rank+direction][file-1] <= enemyPiece[1])
        tempMoves.push([rank+direction+1, file-1+1]);
    
    legalMoves[(rank+1)+""+(file+1)] = tempMoves;
}

function BRQLegalMoves(rank, file, pieceType) {
    let directions = [];
    if(pieceType == ROOK)
        directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    else if(pieceType == BISHOP)
        directions = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    else    {
        directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        directions = directions.concat([[-1, -1], [1, -1], [-1, 1], [1, 1]]);
    }
    let tempMoves = [];
    directions.forEach((elm)=>{
        let rankDir = elm[0];
        let fileDir = elm[1];
        let enemyPieces = (playerTurn == 'w') ? [BLACK, Infinity] : [WHITE, BLACK-1];
        let tempRank = 1, tempFile = 1;
        let posRank = rankDir*tempRank + rank;
        let posFile = fileDir*tempFile + file;
        while(posRank < 8 && posRank >= 0 && posFile < 8 && posFile >= 0)   {
            if(board[posRank][posFile] == 0)
                tempMoves.push([posRank+1, posFile+1]);
            else if(board[posRank][posFile] >= enemyPieces[0] && board[posRank][posFile] <= enemyPieces[1]) {
                tempMoves.push([posRank+1, posFile+1]);
                break;
            }
            else
                break;
            tempRank+=1;
            tempFile+=1;
            posRank = rankDir*tempRank + rank;
            posFile = fileDir*tempFile + file;
        }
    });
    legalMoves[(rank+1)+""+(file+1)] = tempMoves;
}

function KKLegalMoves(rank, file, pieceType)   {
    let directions = [];
    if(pieceType == KNIGHT) {
        directions = [[-2, -1], [-1, -2],
                    [1, -2], [2, -1],
                    [2, 1], [1, 2],
                    [-1, 2], [-2, 1]
        ];
    }
    else    {
        directions = [[-1, 0], [-1, -1],
                    [0, -1], [1, -1],
                    [1, 0], [1, 1],
                    [0, 1], [-1, 1]
        ];
    }
    let tempMoves = [];
    directions.forEach((elm)=>{
        let rankDir = elm[0];
        let fileDir = elm[1];
        let enemyPieces = (playerTurn == 'w') ? [BLACK, Infinity] : [WHITE, BLACK-1];
        let posRank = rankDir + rank;
        let posFile = fileDir + file;
        if(posRank >= 0 && posRank < 8 && posFile >= 0 && posFile < 8)  {
            if(board[posRank][posFile] == 0)
                tempMoves.push([posRank+1, posFile+1]);
            else if(board[posRank][posFile] >= enemyPieces[0] && board[posRank][posFile] <= enemyPieces[1])
                tempMoves.push([posRank+1, posFile+1]);
        }
    });
    if(pieceType == KING)   {
        if(playerTurn == 'w')   {

            if(WKCastle)    {
                if(board[rank][KRookFile] == WHITE | ROOK)
                    if(board[rank][file+1] == 0 && board[rank][file+2] == 0)
                        tempMoves.push([rank+1, file+2+1]);
            }
            if(WQCastle)    {
                if(board[rank][QRookFile] == WHITE | ROOK)
                    if(board[rank][file-1] == 0 && board[rank][file-2] == 0 && board[rank][file-3] == 0)
                        tempMoves.push([rank+1, file-2+1]);
            }
        }
        else    {
            if(BKCastle)    {
                if(board[rank][KRookFile] == BLACK | ROOK)
                    if(board[rank][file+1] == 0 && board[rank][file+2] == 0)
                        tempMoves.push([rank+1, file+2+1]);
            }
            if(BQCastle)    {
                if(board[rank][QRookFile] == BLACK | ROOK)
                    if(board[rank][file-1] == 0 && board[rank][file-2] == 0 && board[rank][file-3] == 0)
                        tempMoves.push([rank+1, file-2+1]);
            }
        }
    }
    legalMoves[(rank+1)+""+(file+1)] = tempMoves;
}