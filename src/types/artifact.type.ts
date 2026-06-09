export type ParsedItem = {
	statRanges: Record<
		string,
		{ v0: number; v100: number; color: string; isPercent?: boolean }
	>
	baseStats: Record<string, number>
	addStats: Record<
		string,
		{ v0: number; v100: number; color: string; isPercent?: boolean }
	>
	displayNames: Record<string, string>
	localizedToKey: Record<string, string>
}

export type StatBreakdown = {
	key: string
	V: number
	P: number
	R: number
	X_before_potential: number
	potentialK: number
	X_after_potential: number
	addFromSelected: number
	final: number
	color?: string
	addColor?: string
	isPercent?: boolean
}
