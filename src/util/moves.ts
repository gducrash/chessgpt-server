import { PIECES, CHECK, CHECKMATE, STALEMATE, CASTLE, RESIGN, END, GAME_END_WORDS } from "../constants.js";
import { GameCoord, isPiece, coordToString, stringToCoord } from "./general.js";

export type GameMove = {
    piece: string;
    from: GameCoord;
    to: GameCoord;
    capturing?: string;
    promoting?: string;
    castling?: "kingSide" | "queenSide";
    check?: boolean;
    checkmate?: boolean;
    selfCheckmate?: boolean;
    stalemate?: boolean;
}|{
    resign: boolean;
}

const getMoveStarters = () => {
    const starters = Object.keys(PIECES);
    starters.push(CHECK);
    starters.push(CHECKMATE);
    starters.push(STALEMATE);
    starters.push(CASTLE);
    starters.push(RESIGN);
    starters.push(END);
    return starters;
}

export const parseMoveString = (moveString: string): GameMove|null => {

    // remove everything before the first starter word
    moveString = moveString.toLowerCase().trim();

    const filterCharacters = [
        '.', ',', '!', '?', ':', ';', 
        '(', ')', '[', ']', '{', '}', 
        '/', '\\', '|', '-', '_', '+', 
        '=', '*', '&', '^', '%', '$', 
        '#', '@', '~', '`', '"', '\'', 
        '>', '<',
    ];

    let split = moveString.split('');
    split = split.filter(c => !filterCharacters.includes(c));

    const moveSplit = split.join('').split('\n').join(' ').split(' ');
    const starters = getMoveStarters();

    let moveStartIndicies = [];
    for (let i = 0; i < moveSplit.length; i++) {
        if (starters.includes(moveSplit[i].toLowerCase())) {
            moveStartIndicies.unshift(i);
        }
    }

    if (GAME_END_WORDS.some(word => moveString.includes(word))) {
        return {
            resign: true,
        };
    }

    let castling: GameMove|null = null;

    for (let moveStartIndex of moveStartIndicies) {

        const moveStrings = moveSplit.slice(moveStartIndex).map(m => m.toLowerCase().trim()).filter(f => f.trim().length);

        if (moveString.includes(RESIGN) || moveString.includes(END) || GAME_END_WORDS.some(word => moveString.includes(word))) {
            return {
                resign: true,
            };
        }

        if (moveString.includes("castl")) {
            if (moveString.includes('queen')) {
                castling = {
                    piece: PIECES.king,
                    from: { x: 4, y: 0 },
                    to: { x: 2, y: 0 },
                    castling: "queenSide",
                };
            } else {
                castling = {
                    piece: PIECES.king,
                    from: { x: 4, y: 0 },
                    to: { x: 6, y: 0 },
                    castling: "kingSide",
                };
            }
        }

        if (moveStrings[1] !== 'from' || moveStrings[3] !== 'to')
            if (castling) return castling; else continue;

        const piece = moveStrings[0];
        if (!isPiece(piece)) 
            if (castling) return castling; else continue;

        const from = stringToCoord(moveStrings[2]);
        const to = stringToCoord(moveStrings[4]);

        if (!from || !to) 
            if (castling) return castling; else continue;

        if (castling) return castling;

        const move: GameMove = {
            piece, from, to,
        };

        if (moveStrings[5] === 'capturing') {
            const piece = moveStrings[6];
            if (!isPiece(piece)) continue;
            move.capturing = piece;
        } else if (moveStrings[5] === 'promoting' && moveStrings[6] === 'to') {
            const piece = !isPiece(moveStrings[7]) ? moveStrings[8] : moveStrings[7];
            if (!isPiece(piece)) continue;
            move.promoting = piece;
        } else if (moveStrings.includes(CHECK)) {
            move.check = true;
        } else if (moveString.includes(CHECKMATE)) {
            move.checkmate = true;
        } else if (moveString.includes(STALEMATE)) {
            move.stalemate = true;
        }

        return move;

    }

    return null;

}

export const generateMoveString = (move: GameMove): string => {
    const moveAny = move as any;
    if (moveAny.resign) return RESIGN;
    if (moveAny.castling) {
        if (moveAny.castling === "kingSide")
            return `${CASTLE} king side`;
        else if (moveAny.castling === "queenSide")
            return `${CASTLE} queen side`;
    }

    let moveString = `${moveAny.piece} from ${coordToString(moveAny.from)} to ${coordToString(moveAny.to)}`;
    if (moveAny.capturing)
        moveString += ` capturing ${moveAny.capturing}`;
    if (moveAny.promoting)
        moveString += ` promoting to ${moveAny.promoting}`;

    if (moveAny.checkmate || moveAny.selfCheckmate)
        moveString += ` checkmate`;
    else if (moveAny.stalemate)
        moveString += ` stalemate`;
    else if (moveAny.check)
        moveString += ` check`;

    return moveString;
}

