import type { UnoClanSummary } from '@/types/uno/uno.type'

export const getSortValue = (clan: UnoClanSummary, sort: string): number => {
	if (sort === 'position') return clan.position ?? Number.MAX_SAFE_INTEGER
	return -(clan.rating ?? -1)
}
