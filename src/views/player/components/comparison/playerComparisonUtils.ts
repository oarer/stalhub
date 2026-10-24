import { Regions } from '@/types/api.type'

export type PlayerRef = {
	region: Regions
	character: string
}

export type PlayerComparisonState = {
	players: PlayerRef[]
}

export const MAX_COMPARISON_PLAYERS = 4

const REGIONS = new Set<string>(Object.values(Regions))
const MAX_CHARACTER_LENGTH = 64

const hasControlChars = (value: string): boolean => {
	for (let index = 0; index < value.length; index++) {
		const code = value.charCodeAt(index)
		if (code < 32 || code === 127) return true
	}
	return false
}

export const toPlayerParam = ({ region, character }: PlayerRef): string =>
	`${region}/${character}`

export const playerKey = ({ region, character }: PlayerRef): string =>
	`${region}:${character.toLocaleLowerCase()}`

export const parsePlayerRef = (
	value: string | null | undefined
): PlayerRef | null => {
	if (typeof value !== 'string') return null

	const separator = value.indexOf('/')
	if (separator <= 0) return null

	const region = value.slice(0, separator).trim().toUpperCase()
	const character = value.slice(separator + 1).trim()

	if (!REGIONS.has(region)) return null
	if (!character || character.length > MAX_CHARACTER_LENGTH) return null
	if (hasControlChars(character)) return null

	return { region: region as Regions, character }
}

const dedupePlayers = (players: PlayerRef[]): PlayerRef[] => {
	const seen = new Set<string>()
	const out: PlayerRef[] = []

	for (const player of players) {
		const key = playerKey(player)
		if (seen.has(key)) continue
		seen.add(key)
		out.push(player)
		if (out.length >= MAX_COMPARISON_PLAYERS) break
	}

	return out
}

export const parsePlayerComparisonState = (
	params: URLSearchParams
): PlayerComparisonState => {
	const players = params
		.getAll('players')
		.map((value) => parsePlayerRef(value))
		.filter((player): player is PlayerRef => !!player)

	return { players: dedupePlayers(players) }
}

export const serializePlayerComparisonState = (
	state: PlayerComparisonState
): string => {
	const params = new URLSearchParams()

	for (const player of state.players.slice(0, MAX_COMPARISON_PLAYERS)) {
		params.append('players', toPlayerParam(player))
	}

	return params.toString()
}

export const isSamePlayer = (a: PlayerRef, b: PlayerRef): boolean =>
	playerKey(a) === playerKey(b)
