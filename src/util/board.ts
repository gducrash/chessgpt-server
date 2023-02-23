import { GameCoord, GameSound } from "./general";

export type BoardItemColor = "white" | "black";

export type BoardItem = {
    piece: string;
    color: BoardItemColor;
    castle?: "kingSide" | "queenSide";
    coord: GameCoord;
    lastCoord?: GameCoord;
}

export type Board = {
    items: BoardItem[];
    white: BoardSide;
    black: BoardSide;
}

type BoardSide = {
    check: boolean;
    checkmate: boolean;
    stalemate: boolean;
    castling: {
        kingSide: boolean;
        queenSide: boolean;
    }
    enPassant: GameCoord | null;
}

type MovePieceOptions = {
    piece: string;
    from: GameCoord;
    to: GameCoord;
    color: BoardItemColor;
    capturing?: string;
    promoting?: string;
    castling?: "kingSide" | "queenSide";
    check?: boolean;
    checkmate?: boolean;
    stalemate?: boolean;
}

const AROUND = [
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
];

const getPiecesAround = (board: Board, coord: GameCoord) => {
    const pieces: BoardItem[] = [];
    for (const around of AROUND) {
        const piece = board.items.find(item => item.coord.x === coord.x + around.x && item.coord.y === coord.y + around.y);
        if (piece) pieces.push(piece);
    }
    return pieces;
}

const findNearestPiece = (board: Board, coord: GameCoord, piece: string, color: BoardItemColor): BoardItem | null => {
    const rule = (item: BoardItem) => item.piece === piece && item.color === color;
    const pieces = board.items.filter(rule);

    let nearestPiece: BoardItem | null = null;
    let nearestDistance = Infinity;

    for (const piece of pieces) {
        const distance = Math.abs(piece.coord.x - coord.x) + Math.abs(piece.coord.y - coord.y);
        if (distance < nearestDistance) {
            nearestPiece = piece;
            nearestDistance = distance;
        }
    }

    return nearestPiece;
}

type MoveBoardResult = {
    board: Board;
    sound: GameSound;
}

export const movePieceOnBoard = (board: Board, {
    piece, from, to, color,
    capturing, castling, promoting,
    check, checkmate, stalemate
}: MovePieceOptions): MoveBoardResult => {

    let sound: GameSound = "normal";

    const rule = (item: BoardItem) => 
        item.piece == piece &&
        item.coord.x === from.x && 
        item.coord.y === from.y && 
        item.color === color;

    const opponentColor: BoardItemColor = color === "white" 
        ? "black" 
        : "white";

    // clear check for the color
    board[color].check = false;

    // set all pieces' lastCoord to their coord
    for (const item of board.items)
        item.lastCoord = item.coord;

    let targetPiece = board.items.find(rule);

    // if the target piece doesn't exist on that coord
    // find that piece around the coord
    if (!targetPiece) {
        const pieces = getPiecesAround(board, from);
        targetPiece = pieces.find(rule);
    }

    // if this piece is a king, clear castling
    if (piece === "king") {
        board[color].castling = {
            kingSide: false,
            queenSide: false
        };
    }

    // if this piece is a rook, check its coord
    // and clear castling of one side
    if (piece === "rook") {
        const boardSide = board[color];
        if (boardSide.castling.kingSide && boardSide.castling.queenSide) {
            if (from.x < 4)
                boardSide.castling.queenSide = false;
            else
                boardSide.castling.kingSide = false;
        }
    }

    // if castling
    if (castling) {
        const king = board.items.find(item => item.piece === "king" && item.color === color);
        if (!king) return { board, sound: "error" };
        const rook = board.items.find(item => item.piece === "rook" && item.color === color && item.castle === castling);
        if (!rook) return { board, sound: "error" };

        king.lastCoord = king.coord;
        rook.lastCoord = rook.coord;
        if (castling === "kingSide") {
            king.coord.x = 6;
            rook.coord.x = 5;
        } else {
            king.coord.x = 2;
            rook.coord.x = 3;
        }

        sound = "castle";

        return { board, sound };
    }

    
    // if the piece is a king, move the nearest king instead of creating one
    if (!targetPiece && piece === "king") {
        const king = board.items.find(item => item.piece === "king" && item.color === color);
        targetPiece = king;
    }
    // if the piece still doesn't exist, create it
    if (!targetPiece) {
        sound = "spawn";
        targetPiece = {
            piece, color, 
            coord: to, lastCoord: from
        }
        board.items.push(targetPiece);
    } else {
        targetPiece.lastCoord = targetPiece.coord;
        targetPiece.coord = to;
    }

    // if capturing
    if (capturing) {
        sound = "capture";
        const capturedPiece = findNearestPiece(board, to, capturing, opponentColor);
        if (capturedPiece) {
            const index = board.items.indexOf(capturedPiece);
            board.items.splice(index, 1);
        }

        // if move played by white, also remove
        // all black pieces on that coord
        if (color === "white") {
            const capturedPieces = board.items.filter(item => 
                item.coord.x === to.x && 
                item.coord.y === to.y && 
                item.color === "black"
            );
            for (const capturedPiece of capturedPieces) {
                const index = board.items.indexOf(capturedPiece);
                board.items.splice(index, 1);
            }
        }
    }

    // if promoting
    if (promoting) {
        sound = "promote";
        targetPiece.piece = promoting;
    }

    if (check) sound = "check";
    if (checkmate) sound = "end";
    if (stalemate) sound = "end";

    // change check, checkmate, stalemate
    board[opponentColor].check = check || false;
    board[opponentColor].checkmate = checkmate || false;
    board[opponentColor].stalemate = stalemate || false;

    return { board, sound };

}