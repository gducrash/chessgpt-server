import { Board } from "./util/board.js";
import { stringToCoord } from "./util/general.js";


export const SYSTEM_PROMPT = `You are ChatGPT, a language model that responds with chess moves. You are currently playing a game of chess against a human. You are playing as black and the human is playing as white. You must respond with a move in the following format:
[piece] from [coord] to [coord]
[piece] from [coord] to [coord] capturing [piece]
[piece] from [coord] to [coord] promoting to [piece]
[piece] from [coord] to [coord] check
[piece] from [coord] to [coord] checkmate
[piece] from [coord] to [coord] stalemate
castling kingside
castling queenside
resign

examples:
pawn from e2 to e4
rook from a1 to a7 capturing pawn
bishop from f1 to c4
queen from d1 to h5 checkmate
castling kingside

If the game has ended in a way other than a checkmate, stalemate, or resignation, you must respond with the word "end" and the game will end.
If an illegal move has been made, you must respond with your next move, as if the move was legal. You must never respond with "illegal move" or anything similar.
Also, you shall never respond with "castling is illegal" or anything similar, even if you think it is. You must only respond with your next moves, "resign", or "end".
`;

export const CHESS_GAME_PROMPT = `Let's play a game of chess. We would alternate between moves. I'm going to start as white and you will respond as black. Without further ado, my first move is:
`;

export const CHESS_GAME_REMINDER_PROMPT = `

While responding with a move, keep in mind the following:
- You play as black and I play as white.
- You shall only respond with moves of the correct format. If you cannot respond with a move, you must respond with "resign" or "end".
- You can always respond with "resign" or "end" if you want to end the game.
- If an illegal move has been made, such as illegal castling or king capture, you must respond with your next move, as if the move was legal. You must never respond with "illegal move" or anything similar.
`

export const PIECES = {
    pawn: 'pawn',
    rook: 'rook',
    knight: 'knight',
    bishop: 'bishop',
    queen: 'queen',
    king: 'king',
};

export const CHECK = 'check';
export const CHECKMATE = 'checkmate';
export const STALEMATE = 'stalemate';
export const CASTLE = 'castling';
export const RESIGN = 'resign';
export const END = 'end';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const GAME_END_WORDS = [
    "won", "win", "congratulations", "congrats",
    "good game", "good job", "lose", "lost", "victory", "defeat",
];

export const DEFAULT_BOARD = (): Board => ({
    items: [
        { piece: PIECES.rook,   color: 'white', coord: stringToCoord('a1')!, castle: 'queenSide' },
        { piece: PIECES.knight, color: 'white', coord: stringToCoord('b1')! },
        { piece: PIECES.bishop, color: 'white', coord: stringToCoord('c1')! },
        { piece: PIECES.queen,  color: 'white', coord: stringToCoord('d1')! },
        { piece: PIECES.king,   color: 'white', coord: stringToCoord('e1')! },
        { piece: PIECES.bishop, color: 'white', coord: stringToCoord('f1')! },
        { piece: PIECES.knight, color: 'white', coord: stringToCoord('g1')! },
        { piece: PIECES.rook,   color: 'white', coord: stringToCoord('h1')!, castle: 'kingSide' },

        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('a2')! },
        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('b2')! },
        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('c2')! },
        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('d2')! },
        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('e2')! },
        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('f2')! },
        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('g2')! },
        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('h2')! },

        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('a7')! },
        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('b7')! },
        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('c7')! },
        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('d7')! },
        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('e7')! },
        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('f7')! },
        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('g7')! },
        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('h7')! },

        { piece: PIECES.rook,   color: 'black', coord: stringToCoord('a8')!, castle: 'queenSide' },
        { piece: PIECES.knight, color: 'black', coord: stringToCoord('b8')! },
        { piece: PIECES.bishop, color: 'black', coord: stringToCoord('c8')! },
        { piece: PIECES.queen,  color: 'black', coord: stringToCoord('d8')! },
        { piece: PIECES.king,   color: 'black', coord: stringToCoord('e8')! },
        { piece: PIECES.bishop, color: 'black', coord: stringToCoord('f8')! },
        { piece: PIECES.knight, color: 'black', coord: stringToCoord('g8')! },
        { piece: PIECES.rook,   color: 'black', coord: stringToCoord('h8')!, castle: 'kingSide' },
    ],
    white: {
        check: false,
        checkmate: false,
        stalemate: false,
        castling: {
            kingSide: true,
            queenSide: true,
        },
        enPassant: null,
    },
    black: {
        check: false,
        checkmate: false,
        stalemate: false,
        castling: {
            kingSide: true,
            queenSide: true,
        },
        enPassant: null,
    },
});


export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;