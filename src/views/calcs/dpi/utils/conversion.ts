import type { Game } from './dpi.const'

export function getYaw(game: Game): number | null {
	if (game.yawdeg) return game.yawdeg
	if (game.yawrad) return game.yawrad * (180 / Math.PI)
	return null
}

export function convertSens(
	sens: number,
	fromGame: Game,
	toGame: Game
): number | null {
	const yawFrom = getYaw(fromGame)
	const yawTo = getYaw(toGame)
	if (!yawFrom || !yawTo) return null
	return parseFloat(((sens * yawFrom) / yawTo).toFixed(6))
}
