import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

import { sessions, createGameSession, getGameSession, makeMove } from './api.js';
import { GameMove } from './util/moves.js';
import { moveSchema } from './validate.js';
import { GameSound } from './util/general.js';
import { MINUTE, HOUR } from './constants.js';
import { Board } from './util/board.js';

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

async function main() {
    // periodic session cleanup
    setInterval(everyFiveMinutes, MINUTE * 5);

    app.get('/', (_req: Request, res: Response) => {
        res.send('Hello World!');
    });
    app.get('/stats', (_req: Request, res: Response) => {
        res.json(getStats());
    });
    
    app.post('/session/create', async (_req: Request, res: Response) => {
        const id = uuidv4();
        createGameSession(id);
        const session = getGameSession(id);
        res.send({ id, session });
    });

    app.post('/session/:id/move', async (req: Request, res: Response) => {
        const id = req.params.id;
        const session = getGameSession(id);
        if (!session || session.ended) return res.status(404).send({ error: 'Session not found' });

        // if the last move was more than 30 seconds ago, it's white's turn again
        const thirtySecondsAgo = Date.now() - 30000;
        if (session.lastMoveDate && session.lastMoveDate.getTime() < thirtySecondsAgo) {
            session.turn = "white";
        }

        const move = req.body.move;
        try {
            moveSchema.parse(move);
        } catch (err) {
            return res.status(400).send({ error: 'Invalid move' });
        }

        let botMove: GameMove|null, 
            botResponse: string, 
            gameEnd: boolean, 
            sound: GameSound|undefined,
            beforeBotResponseBoard: Board|undefined;
        try {
            [botMove, gameEnd, sound, beforeBotResponseBoard] = await makeMove(id, move);
        } catch (err: any) {
            return res.status(400).send({ error: err.message });
        }

        if (gameEnd)
            session.ended = true;

        res.send({ 
            turn: session.turn,
            move: botMove, 
            date: session.lastMoveDate, 
            response: session.response, 
            board: session.board,
            beforeBotResponseBoard,
            gameEnd, sound
        });
    });

    app.post('/session/:id/latestMove', async (req: Request, res: Response) => {
        const id = req.params.id;
        const session = getGameSession(id);
        if (!session || session.ended) return res.status(404).send({ error: 'Session not found' });
        res.send({ 
            turn: session.turn,
            move: session.lastMove, 
            date: session.lastMoveDate,
            response: session.response,
            board: session.board,
            gameEnd: session.ended
        });
    });

    app.listen(PORT, () => {
        console.log(`🎉 Server running on port ${PORT}`);
    });
}

const everyFiveMinutes = () => {
    // delete sessions that either ended or have been inactive for an hour or more
    const oneHourAgo = Date.now() - HOUR;
    for (const [id, session] of sessions) {
        if (session.ended || session.lastMoveDate?.getTime() < oneHourAgo) {
            sessions.delete(id);
        }
    }
}

const getStats = () => {
    const sessionsArr = Array.from(sessions.values());
    return {
        activeSessions: {
            total: sessionsArr.length,
        }
    };
}

main();