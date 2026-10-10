import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { itemService } from '@/services/item/item.service'
import type { BarterResponse } from '@/types/barter.type'
import type { Message } from '@/types/item.type'

export type BarterTreeNode = {
	item_id: string
	name: string
	lines?: Message
	category: string
	color?: string
	amount: number
	money: number
	level: string
	craftable: boolean
	children: BarterTreeNode[]
}

export type BarterRootMeta = {
	lines?: Message
	category?: string
	color?: string
}

/** Аномальная сыворотка и её цена в боевых жетонах (рецепт: w3zn3 ×1000). */
export const SERUM_ITEM_ID = '9dk7l'
export const TOKEN_ITEM_ID = 'w3zn3'

function fallbackName(lines: Message | undefined, itemId: string): string {
	if (!lines) return itemId
	if (lines.type === 'text') return lines.text || itemId
	if (lines.type === 'translation') {
		return (
			lines.lines?.ru ??
			lines.lines?.en ??
			Object.values(lines.lines ?? {})[0] ??
			lines.key ??
			itemId
		)
	}
	return itemId
}

async function buildNode(
	itemId: string,
	amount: number,
	depth: number,
	rootMeta?: BarterRootMeta,
	expandSerum = true
): Promise<BarterTreeNode | null> {
	if (depth > 4) return null
	const res: BarterResponse | null = await itemService.getBarter(itemId)
	if (!res) {
		const metaLines = depth === 0 ? rootMeta?.lines : undefined
		return {
			item_id: itemId,
			name: fallbackName(metaLines, itemId),
			lines: metaLines,
			category: depth === 0 ? (rootMeta?.category ?? '') : '',
			color: depth === 0 ? rootMeta?.color : undefined,
			amount,
			money: 0,
			level: '',
			craftable: false,
			children: [],
		}
	}
	const recipe = res.recipes[0]
	// Без учёта жетонов сыворотка не раскрывается — считается покупным листом.
	if (!expandSerum && itemId === SERUM_ITEM_ID) {
		return {
			item_id: itemId,
			name:
				depth === 0 && rootMeta?.lines
					? fallbackName(rootMeta.lines, itemId)
					: itemId,
			lines: depth === 0 ? rootMeta?.lines : undefined,
			category: depth === 0 ? (rootMeta?.category ?? '') : '',
			color: depth === 0 ? rootMeta?.color : undefined,
			amount,
			money: 0,
			level: res.settlement_required_level,
			craftable: true,
			children: [],
		}
	}
	const children: BarterTreeNode[] = []
	if (recipe && depth < 4) {
		for (const ing of recipe.items) {
			const child = await buildNode(
				ing.item_id,
				ing.amount,
				depth + 1,
				undefined,
				expandSerum
			)
			if (child) {
				child.name = fallbackName(ing.lines, ing.item_id)
				child.lines = ing.lines
				child.category = ing.category
				child.color = ing.color
				children.push(child)
			}
		}
	}
	const rootLines = depth === 0 ? rootMeta?.lines : undefined
	return {
		item_id: itemId,
		name: rootLines ? fallbackName(rootLines, itemId) : itemId,
		lines: rootLines,
		category: depth === 0 ? (rootMeta?.category ?? '') : '',
		color: depth === 0 ? rootMeta?.color : undefined,
		amount,
		money: Number(recipe?.money ?? 0),
		level: res.settlement_required_level,
		craftable: true,
		children,
	}
}

class BarterCalcQueries {
	tree(rootId: string, rootMeta?: BarterRootMeta, expandSerum = true) {
		return queryOptions<BarterTreeNode | null>({
			queryKey: ['barter-tree', rootId, expandSerum],
			queryFn: () =>
				rootId ? buildNode(rootId, 1, 0, rootMeta, expandSerum) : null,
			placeholderData: keepPreviousData,
			staleTime: 1000 * 60 * 10,
		})
	}

	/** Все money-офферы рецепта (для подбора лучшего варианта). */
	offers(itemId: string) {
		return queryOptions({
			queryKey: ['barter-offers', itemId],
			queryFn: () => itemService.getBarter(itemId),
			staleTime: 1000 * 60 * 10,
		})
	}

	list() {
		return queryOptions({
			queryKey: ['barter-list'],
			queryFn: () => itemService.listBarter(),
			staleTime: 1000 * 60 * 60,
		})
	}
}

export const barterCalcQueries = new BarterCalcQueries()
