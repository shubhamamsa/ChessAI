class ChessBoardConfig {
    constructor(fen)   {

        this.NONE = 0;
        this.PAWN = 1;
        this.KNIGHT = 2;
        this.BISHOP = 3;
        this.ROOK = 4;
        this.QUEEN = 5;
        this.KING = 6;
        
        this.WHITE = 8;
        this.BLACK = 16;
        
        this.activeBlackPieces = new Set();
        this.activeWhitePieces = new Set();
        
        this.boardConf = new Array(10).fill(0).map(() => new Array(10).fill(0));
        this.validMoves = {};
        this.CASTLE = {};
        this.CASTLE[this.WHITE | this.KING] = true;
        this.CASTLE[this.WHITE | this.QUEEN] = true;
        this.CASTLE[this.BLACK | this.KING] = true;
        this.CASTLE[this.BLACK | this.QUEEN] = true;
        this.enPassant = [];

        this.pieceDesp = {
            'p': this.PAWN,
            'n': this.KNIGHT,
            'b': this.BISHOP,
            'r': this.ROOK,
            'q': this.QUEEN,
            'k': this.KING
        }
    
        this.INITIAL_CONFIG = fen.split(' ')[0];
        this.ACTIVE_PLAYER = (fen.split(' ')[1] == 'w')?this.WHITE:this.BLACK;

        this.MOVES = new LegalMoves();
        
        this.createInitialConfig();

    }

    createInitialConfig()   {
        let rank = 8, file = 1;
        for(let i=0;i<this.INITIAL_CONFIG.length;i++)   {
            if(this.INITIAL_CONFIG[i].charCodeAt(0) >= "0".charCodeAt(0) && this.INITIAL_CONFIG[i].charCodeAt(0) <= "9".charCodeAt(0))  {
                file+=(this.INITIAL_CONFIG[i].charCodeAt(0) - "0".charCodeAt(0));
            }
            else if(this.INITIAL_CONFIG[i] == "/") {
                rank--;
                file = 1;
            }
            else    {
                let pieceCat = (this.pieceDesp[this.INITIAL_CONFIG[i].toLowerCase()] | 
                (this.INITIAL_CONFIG[i].toLowerCase() == this.INITIAL_CONFIG[i]?this.BLACK:this.WHITE));
                
                this.placePiece(rank, file, pieceCat, null, null);
                file++;
            }
        }
        this.validMoves = this.calcMoves();
    }

    placePiece(destRank, destFile, piece, sourceRank, sourceFile)   {
        let pieceColor = (piece < 16) ? this.WHITE:this.BLACK;
        this.boardConf[destRank][destFile] = piece;
        if(pieceColor == this.WHITE)    {
            this.activeWhitePieces.add((destRank)*10+destFile);
            this.activeBlackPieces.delete((destRank)*10+destFile);
        }
        else    {
            this.activeBlackPieces.add((destRank)*10+destFile);
            this.activeWhitePieces.delete((destRank)*10+destFile);
        }
        
        if(sourceRank !== null && sourceFile !== null)    {
            this.boardConf[sourceRank][sourceFile] = 0;
            if(pieceColor == this.WHITE)
                this.activeWhitePieces.delete((sourceRank)*10+sourceFile);
            else
                this.activeBlackPieces.delete((sourceRank)*10+sourceFile);
        }
    }

    updateChessBoard(sourceRank, sourceFile, destRank, destFile) {
        if(this.validMoves[sourceRank+""+sourceFile] !== undefined && this.verifyMove(sourceRank, sourceFile, destRank, destFile))  {
            let chessMove = this.updateSpecialMoves(sourceRank, sourceFile, destRank, destFile);
            let piece = this.boardConf[sourceRank][sourceFile];
            this.placePiece(destRank, destFile, piece, sourceRank, sourceFile);
            this.ACTIVE_PLAYER = (this.ACTIVE_PLAYER == this.WHITE) ? this.BLACK:this.WHITE;
            this.validMoves = this.calcMoves();
            return chessMove;
        }
        return [];
    }

    updateSpecialMoves(sourceRank, sourceFile, destRank, destFile)  {
        let moves = [[sourceRank+""+sourceFile, destRank+""+destFile]];
        let rmPiece = [];
        if(this.boardConf[sourceRank][sourceFile] === (this.ACTIVE_PLAYER | this.PAWN))    {
            if(destRank == this.enPassant[0] && destFile == this.enPassant[1])  {
                this.boardConf[sourceRank][destFile] = 0;
                rmPiece.push(sourceRank+""+destFile);
            }
        }
        this.enPassant = [];
        if(this.boardConf[sourceRank][sourceFile] === (this.ACTIVE_PLAYER | this.KING)) {
            this.CASTLE[this.ACTIVE_PLAYER | this.KING] = false;
            this.CASTLE[this.ACTIVE_PLAYER | this.QUEEN] = false;
            if(destFile - sourceFile === 2) {
                this.boardConf[destRank][destFile-1] = this.boardConf[destRank][8];
                this.boardConf[destRank][8] = 0;
                moves.push([destRank+"8", destRank+""+destFile-1]);
            }
            else if(sourceFile - destFile === 2)    {
                this.boardConf[destRank][destFile+1] = this.boardConf[destRank][1];
                this.boardConf[destRank][1] = 0;
                moves.push([destRank+"1", destRank+""+(destFile+1)]);
            }
        }
        else if(this.boardConf[sourceRank][sourceFile] === (this.ACTIVE_PLAYER | this.PAWN))    {
            let dir = (this.ACTIVE_PLAYER==this.WHITE) ? 1:-1;
            if(Math.abs(sourceRank-destRank) == 2)  {
                this.enPassant = [sourceRank+dir, sourceFile];
            }
        }
        if(sourceRank == 1) {
            if(sourceFile == 1)
                this.CASTLE[this.WHITE | this.QUEEN] = false;
            else if(sourceFile == 8)
                this.CASTLE[this.WHITE | this.KING] = false;
        }
        else if(destRank == 1) {
            if(destFile == 1)
                this.CASTLE[this.WHITE | this.QUEEN] = false;
            else if(destFile == 8)
                this.CASTLE[this.WHITE | this.KING] = false;
        }
        if(sourceRank == 8) {
            if(sourceFile == 1)
                this.CASTLE[this.BLACK | this.QUEEN] = false;
            else if(sourceFile == 8)
                this.CASTLE[this.BLACK | this.KING] = false;
        }
        else if(destRank == 8) {
            if(destFile == 1)
                this.CASTLE[this.BLACK | this.QUEEN] = false;
            else if(destFile == 8)
                this.CASTLE[this.BLACK | this.KING] = false;
        }
        return [moves, rmPiece];
    }

    calcMoves()    {
        let legalMoves = {};
        if(this.ACTIVE_PLAYER == this.WHITE)   {
            this.activeWhitePieces.forEach(elm => {
                let rank_t = Math.floor(elm/10);
                let file_t = elm%10;
                legalMoves[rank_t+""+file_t] = (this.calcIndividualMoves(rank_t, file_t));
            });
        }
        else    {
            this.activeBlackPieces.forEach(elm => {
                let rank_t = Math.floor(elm/10);
                let file_t = elm%10;
                legalMoves[rank_t+""+file_t] = (this.calcIndividualMoves(rank_t, file_t));
            });
        }
        return legalMoves;
    }
    calcIndividualMoves(rank, file) {
        let pieceType = (this.boardConf[rank][file] ^ this.ACTIVE_PLAYER);
        switch(pieceType)   {
            case this.PAWN:
                return this.MOVES.pawn(rank, file, this.boardConf, this.ACTIVE_PLAYER, this.enPassant);
            case this.KNIGHT:
                return this.MOVES.kk(rank, file, this.KNIGHT, this.boardConf, this.ACTIVE_PLAYER);
            case this.BISHOP:
                return this.MOVES.brq(rank, file, this.BISHOP, this.boardConf, this.ACTIVE_PLAYER);
            case this.ROOK:
                return this.MOVES.brq(rank, file, this.ROOK, this.boardConf, this.ACTIVE_PLAYER);
            case this.QUEEN:
                return this.MOVES.brq(rank, file, this.QUEEN, this.boardConf, this.ACTIVE_PLAYER);
            case this.KING:
                let moves = this.MOVES.kk(rank, file, this.KING, this.boardConf, this.ACTIVE_PLAYER);
                return moves.concat(this.MOVES.castle(rank, file, this.boardConf, this.ACTIVE_PLAYER, this.CASTLE));
        }
    }
    verifyMove(sr, sf, dr, df)  {
        if(this.validMoves[sr+""+sf] === undefined)
            return false;
        for(let i=0;i<this.validMoves[sr+""+sf].length;i++) {
            if(this.validMoves[sr+""+sf][i][0] === dr && this.validMoves[sr+""+sf][i][1] === df)
                return true;
        }
        return false;
    }
    retrievePieceMoves(position)    {
        if(this.validMoves[position] === undefined)
            return [];
        return this.validMoves[position];
    }
};

class LegalMoves {
    constructor()   {
        this.NONE = 0;
        this.PAWN = 1;
        this.KNIGHT = 2;
        this.BISHOP = 3;
        this.ROOK = 4;
        this.QUEEN = 5;
        this.KING = 6;
        
        this.WHITE = 8;
        this.BLACK = 16;
    }
    pawn(rank, file, board, playerTurn, enPassant)   {
        let legalMoves = [];

        let direction = ((playerTurn) == this.WHITE) ? 1:-1;
        let defRank = ((playerTurn) == this.WHITE) ? 2:7;
        let enemyPiece = (playerTurn == this.WHITE) ? [this.BLACK, Infinity]:[this.WHITE, this.BLACK-1];
        
        if(rank+direction <= 8 && rank+direction >= 1 && board[rank+direction][file] == 0)    {
            legalMoves.push([rank+direction, file]);
            if(rank == defRank && board[rank+2*direction][file] == 0)
                legalMoves.push([rank+2*direction, file]);
        }

        if(rank+direction <= 8 && rank+direction >= 1 && file+1 <= 8 && board[rank+direction][file+1] >= enemyPiece[0] && board[rank+direction][file+1] <= enemyPiece[1])
            legalMoves.push([rank+direction, file+1]);
        
            if(rank+direction <= 8 && rank+direction >= 1 && file-1 >= 1 && board[rank+direction][file-1] >= enemyPiece[0] && board[rank+direction][file-1] <= enemyPiece[1])
            legalMoves.push([rank+direction, file-1]);
        if(enPassant !== [])  {
            if(rank+direction === enPassant[0] && (file+1 === enPassant[1] || file-1 === enPassant[1]))
                legalMoves.push(enPassant);
        }
        return legalMoves;  
    }

    brq(rank, file, pieceType, board, playerTurn) {
        let directions = [];
        
        if(pieceType == this.ROOK)
            directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        else if(pieceType == this.BISHOP)
            directions = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
        else    {
            directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
            directions = directions.concat([[-1, -1], [1, -1], [-1, 1], [1, 1]]);
        }

        let legalMoves = [];
        
        directions.forEach((elm)=>{
            let rankDir = elm[0];
            let fileDir = elm[1];
            let enemyPieces = (playerTurn == this.WHITE) ? [this.BLACK, Infinity] : [this.WHITE, this.BLACK-1];
            let tempRank = 1, tempFile = 1;
            let posRank = rankDir*tempRank + rank;
            let posFile = fileDir*tempFile + file;
            while(posRank <= 8 && posRank >= 1 && posFile <= 8 && posFile >= 1)   {
                if(board[posRank][posFile] == 0)
                    legalMoves.push([posRank, posFile]);
                else if(board[posRank][posFile] >= enemyPieces[0] && board[posRank][posFile] <= enemyPieces[1]) {
                    legalMoves.push([posRank, posFile]);
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
        return legalMoves;
    }
    kk(rank, file, pieceType, board, playerTurn)   {
        let directions = [];
        
        if(pieceType == this.KNIGHT) {
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

        let legalMoves = [];
        
        directions.forEach((elm) => {
            let rankDir = elm[0];
            let fileDir = elm[1];
            let enemyPieces = (playerTurn == this.WHITE) ? [this.BLACK, Infinity] : [this.WHITE, this.BLACK-1];
            let posRank = rankDir + rank;
            let posFile = fileDir + file;
            if(posRank >= 1 && posRank <= 8 && posFile >= 1 && posFile <= 8)  {
                if(board[posRank][posFile] == 0)
                    legalMoves.push([posRank, posFile]);
                else if(board[posRank][posFile] >= enemyPieces[0] && board[posRank][posFile] <= enemyPieces[1])
                    legalMoves.push([posRank, posFile]);
            }
        });

        return legalMoves;
    }
    castle(rank, file, boardConf, ACTIVE_PLAYER, castling)    {
        let qcastle = 3, kcastle = 7;
        let legalMoves = [];
        let validity = 1;
        if(castling[ACTIVE_PLAYER | this.KING] === true)    {
            for(let i=file+1;i<=kcastle;i++)    {
                if(boardConf[rank][i] !== 0)    {
                    validity = 0;
                    break;
                }
            }
            if(validity)
                legalMoves.push([rank, kcastle]);
        }
        if(castling[ACTIVE_PLAYER | this.QUEEN] === true)   {
            validity = 1;
            for(let i=file-1;i>=qcastle;i--)    {
                if(boardConf[rank][i] !== 0)    {
                    validity = 0;
                    break;
                }
            }
            if(validity)
                legalMoves.push([rank, qcastle]);
        }
        return legalMoves;
    }
};