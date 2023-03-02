import * as dotenv from 'dotenv';
dotenv.config();

import { SYSTEM_PROMPT, CHESS_GAME_PROMPT, CHESS_GAME_REMINDER_PROMPT, DEFAULT_BOARD } from './constants.js';
import { parseMoveString, generateMoveString, GameMove } from './util/moves.js';
import { Board, movePieceOnBoard } from './util/board.js';
import { GameSound, isPiece } from './util/general.js';

interface ChatGPTAPISendMessageOptions {
    parentMessageId?: string;
}
interface ChatGPTAPISendMessageResponse {
    id: string;
    text: string;
}
interface ChatGPTAPIInterface {
    sendMessage (message: string, opts: ChatGPTAPISendMessageOptions): Promise<ChatGPTAPISendMessageResponse>;
}

let api: ChatGPTAPIInterface;

(async () => {
    const { ChatGPTAPI } = await import('chatgpt');
    api = new ChatGPTAPI({
        apiKey: process.env.OPENAI_API_KEY!,
        systemMessage: SYSTEM_PROMPT,
    });
    console.log('🤖 ChatGPT API initialized');
})();

// const api = new ChatGPTUnlockedAPI();

export type GameSession = {
    id: string;
    messageId?: string;

    board: Board;
    turn: 'white' | 'black';
    lastMoveDate: Date;
    lastMove?: GameMove;
    ended?: boolean;
}

export const sessions: Map<string, GameSession> = new Map();

export const createGameSession = (id: string) => {
    const session: GameSession = {
        id, board: DEFAULT_BOARD(),
        turn: 'white', ended: false,
        lastMoveDate: new Date(),
    };
    sessions.set(id, session);
}

export const getGameSession = (id: string) => {
    return sessions.get(id);
}

export const makeMove = async (id: string, userMove: GameMove): Promise<[GameMove|null, string, boolean, GameSound?]> => {

    const session = getGameSession(id);
    if (!session) throw new Error('Session not found');

    const userMoveAny = userMove as any;

    // if turn is black, throw error
    if (session.turn === 'black') throw new Error('It is not your turn');
    if (!isPiece(userMoveAny.piece)) throw new Error('Invalid piece');

    session.turn = 'black';
    session.lastMoveDate = new Date();

    const prevLastMove = session.lastMove;
    session.lastMove = userMove;

    // if user move is resign, end game
    if (userMoveAny.resign) {
        return [null, 'Good game!', true, "end"];
    }

    // update board
    const board = session.board;
    const prevBoard = structuredClone(board);
    movePieceOnBoard(board, {
        piece: userMoveAny.piece,
        from: userMoveAny.from,
        to: userMoveAny.to,
        color: 'white',
        capturing: userMoveAny.capturing,
        promoting: userMoveAny.promoting,
        castling: userMoveAny.castling,
        check: userMoveAny.check,
        checkmate: userMoveAny.checkmate,
        stalemate: userMoveAny.stalemate,
    });

    // if user move checkmate or stalemate, end game
    if (userMoveAny.checkmate || userMoveAny.selfCheckmate || userMoveAny.stalemate) {
        let s: string = "Good Game!";
        if (userMoveAny.checkmate) s = 'You beat me! Good game.';
        else if (userMoveAny.selfCheckmate) s = 'You have no moves left. I win!';
        else if (userMoveAny.stalemate) s = 'Draw! Good game.';
        return [null, s, true, "end"];
    }
    

    // send move to chatgpt
    let userMoveStr = generateMoveString(userMove);
    if (!session.messageId) userMoveStr = CHESS_GAME_PROMPT + userMoveStr;
    else if (Math.random() < 0.32) userMoveStr += CHESS_GAME_REMINDER_PROMPT;

    let res;
    
    try {
        res = await api.sendMessage(userMoveStr, {
            parentMessageId: session.messageId,
        });
    } catch (e) {
        session.turn = 'white';
        session.lastMove = prevLastMove;
        session.board = prevBoard;
        throw e;
    }

    session.messageId = res.id;
    
    // parse response
    const botMove = parseMoveString(res.text) as any;
    if (!botMove) {
        session.turn = 'white';
        session.lastMoveDate = new Date();
        session.lastMove = prevLastMove;
        session.board = prevBoard;
        return [null, res.text, false, "error"];
    }

    // if bot move is resign
    if (botMove.resign) {
        return [botMove, res.text, true, "end"];
    }

    // update board
    const { sound } = movePieceOnBoard(board, {
        piece: botMove.piece,
        from: botMove.from,
        to: botMove.to,
        color: 'black',
        capturing: botMove.capturing,
        promoting: botMove.promoting,
        castling: botMove.castling,
        check: botMove.check,
        checkmate: botMove.checkmate,
        stalemate: botMove.stalemate,
    });

    // if bot move is checkmate or stalemate, end game
    if (botMove.checkmate || botMove.stalemate) {
        return [botMove, res.text, true, "end"];
    }

    // if bot move is valid, update board and turn
    session.turn = 'white';
    session.lastMoveDate = new Date();
    session.lastMove = botMove;

    return [botMove as GameMove, res.text, false, sound];

}
