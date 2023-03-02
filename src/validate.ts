import * as zod from 'zod';

export const moveCoordSchema = zod.object({
    x: zod.number().int().min(0).max(7),
    y: zod.number().int().min(0).max(7),
});
export const movePieceSchema = zod.union([
    zod.literal('pawn'),
    zod.literal('rook'),
    zod.literal('knight'),
    zod.literal('bishop'),
    zod.literal('queen'),
    zod.literal('king'),
]);

export const moveSchemaNormal = zod.object({
    piece: movePieceSchema,
    from: moveCoordSchema,
    to: moveCoordSchema,
    capturing: movePieceSchema.optional(),
    promoting: movePieceSchema.optional(),
    check: zod.boolean().optional(),
    checkmate: zod.boolean().optional(),
    selfCheckmate: zod.boolean().optional(),
    stalemate: zod.boolean().optional(),
});
export const moveSchemaResign = zod.object({
    resign: zod.boolean(),
});
export const moveSchema = zod.union([moveSchemaNormal, moveSchemaResign]);
