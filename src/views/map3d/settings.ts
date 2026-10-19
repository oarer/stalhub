export type TexturePreset = 'low' | 'medium' | 'high'
export type EditorSettings = {
	version: 1
	blocks: TexturePreset
	objects: TexturePreset
	graphics: 'low' | 'balanced' | 'high'
	distance: 2 | 3 | 5 | 8
	cacheMB: 128 | 512 | 1024 | 2048 | 4096 | 8192
}
export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
	version: 1,
	blocks: 'medium',
	objects: 'medium',
	graphics: 'balanced',
	distance: 3,
	cacheMB: 1024,
}
export const TEXTURE_SIZE = { low: 64, medium: 128, high: 256 } as const
export const TEXTURE_LABELS = {
	low: 'Низкое',
	medium: 'Среднее',
	high: 'Высокое',
} as const
export function readEditorSettings(raw: string | null): EditorSettings | null {
	try {
		const s = JSON.parse(raw ?? 'null')
		if (
			s?.version !== 1 ||
			!['low', 'medium', 'high'].includes(s.blocks) ||
			!['low', 'medium', 'high'].includes(s.objects) ||
			!['low', 'balanced', 'high'].includes(s.graphics) ||
			![2, 3, 5, 8].includes(s.distance) ||
			![128, 512, 1024, 2048, 4096, 8192].includes(s.cacheMB)
		)
			return null
		return {
			version: 1,
			blocks: s.blocks,
			objects: s.objects,
			graphics: s.graphics,
			distance: s.distance,
			cacheMB: s.cacheMB,
		}
	} catch {
		return null
	}
}
export function editorLocation(x: number, z: number, y?: number): string {
	if (
		![x, z].every(Number.isFinite) ||
		Math.abs(x) > 30000000 ||
		Math.abs(z) > 30000000 ||
		(y !== undefined && !Number.isFinite(y))
	)
		throw Error('Некорректная точка на карте')
	const p = new URLSearchParams({ x: String(x), z: String(z) })
	if (y !== undefined) p.set('y', String(y))
	return `/map/3d?${p}`
}
