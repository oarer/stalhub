export function kdValue(kills: number, deaths: number): number {
	return deaths === 0 ? kills : kills / deaths
}

export function kdaValue(
	kills: number,
	deaths: number,
	assists: number
): number {
	return deaths === 0 ? kills + assists : (kills + assists) / deaths
}

export function formatKd(kills: number, deaths: number): string {
	return kdValue(kills, deaths).toFixed(2)
}

export function formatKda(
	kills: number,
	deaths: number,
	assists: number
): string {
	return kdaValue(kills, deaths, assists).toFixed(2)
}

export function kdClass(kills: number, deaths: number): string {
	const v = deaths === 0 ? kills : kills / deaths
	if (v >= 2) return 'text-green-600 dark:text-green-400'
	if (v >= 1) return 'text-sky-600 dark:text-sky-400'
	return 'text-red-600 dark:text-red-400'
}
