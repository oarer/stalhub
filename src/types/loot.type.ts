export type LocaleCode = 'ru' | 'en' | 'es' | 'fr' | 'ko'

export type ItemNames = Partial<Record<LocaleCode, string>>

export interface CatalogStack {
	id: string | number
	stackSize: number
	tag?: Record<string, unknown>
	stackSizeVariance?: number
	qlt?: number
}

export interface CatalogItem {
	stack?: CatalogStack
	weight: number
	pct: number
	names?: ItemNames
}

export type CatalogSlot = CatalogItem[]

export interface CatalogTablePayload {
	title?: ItemNames
	slots: CatalogSlot[]
}

export type CatalogResponse = Record<string, CatalogTablePayload>

export interface LootTableResponse {
	name: string
	title?: ItemNames
	slots: CatalogSlot[]
}
