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
	if (v >= 2) return 'text-success'
	if (v >= 1) return 'text-primary'
	return 'text-destructive'
}
