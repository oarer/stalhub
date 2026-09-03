import type { PaintMaskMode } from '@/app/calcs/builds/model/paint'
import type { Locale } from '@/i18n/settings'

export type { PaintMaskMode }

export type AssetMap = {
	items: ModelItem[]
	paints?: PaintItem[]
}

export type ModelItem = {
	id: string
	names: Partial<Record<Locale, string>>
	models: { path: string; url?: string }[]
	textures: Record<
		'diffuse' | 'normal' | 'specular' | 'emission',
		{ reference: string; path: string; url?: string }[]
	>
}

export type PaintItem = {
	id: number
	unlocalized_name: string
	names: Partial<Record<Locale, string>>
	textures: Record<
		string,
		{ reference: string; path: string | null; url?: string }
	>
}

export const MAP_URL = '/assets-map.json'
export const CDN = 'https://cdn.stalhub.dev/sc'
