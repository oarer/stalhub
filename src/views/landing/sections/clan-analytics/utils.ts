import { LEAD } from './config'

export function formatTime(locale: string) {
	return new Date().toLocaleTimeString(locale, { hour12: false })
}

export function rowOpacity(index: number) {
	if (index === 0) {
		return 1
	}
	if (index === 1) {
		return 0.7
	}
	if (index === 2) {
		return 0.5
	}
	if (index === 3) {
		return 0.34
	}
	return 0.2
}

export function loop01(v: number) {
	return ((v % 1) + 1) % 1
}

export function nodeFraction(stageCount: number, index: number) {
	return LEAD + (index / (stageCount - 1)) * (1 - 2 * LEAD)
}
