import { PIECES, FILES, RANKS } from "../constants.js";

export type GameCoord = {
    x: number;
    y: number;
}

export type GameSound =
    | "normal"
    | "capture"
    | "spawn"
    | "castle"
    | "promote"
    | "check"
    | "end"
    | "error";

export const isPiece = (piece: string) => {
    const pieces = Object.keys(PIECES);
    return pieces.includes(piece);
}

export const coordToString = (coord: GameCoord) => {
    return `${FILES[coord.x] ?? 'a'}${RANKS[coord.y] ?? '1'}`;
}

export const stringToCoord = (coordString: string): GameCoord|null => {
    if (coordString.length !== 2) return null;
    const file = coordString[0];
    const rank = coordString[1];
    if (!FILES.includes(file) || !RANKS.includes(rank)) return null;

    return {
        x: FILES.indexOf(file),
        y: RANKS.indexOf(rank),
    };
}