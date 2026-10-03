import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { itemService } from '@/services/item/item.service'
import type { BarterResponse } from '@/types/barter.type'

export type BarterTreeNode = {
	item_id: string
	name: string
	category: string
	amount: number
	money: number
	level: string
	craftable: boolean
	children: BarterTreeNode[]
}

async function buildNode(
	itemId: string,
	amount: number,
	depth: number
): Promise<BarterTreeNode | null> {
	if (depth > 4) return null
	const res: BarterResponse | null = await itemService.getBarter(itemId)
	if (!res) {
		return {
			item_id: itemId,
			name: itemId,
			category: '',
			amount,
			money: 0,
			level: '',
			craftable: false,
			children: [],
		}
	}
	const recipe = res.recipes[0]
	const children: BarterTreeNode[] = []
	if (recipe && depth < 4) {
		for (const ing of recipe.items) {
			const child = await buildNode(ing.item_id, ing.amount, depth + 1)
			if (child) {
				child.name =
					typeof ing.lines === 'string'
						? ing.lines
						: (ing.lines as { lines?: Record<string, string> })?.lines?.ru ??
							ing.item_id
				child.category = ing.category
				children.push(child)
			}
		}
	}
	return {
		item_id: itemId,
		name: itemId,
		category: '',
		amount,
		money: Number(recipe?.money ?? 0),
		level: res.settlement_required_level,
		craftable: true,
		children,
	}
}

class BarterCalcQueries {
	tree(rootId: string) {
		return queryOptions<BarterTreeNode | null>({
			queryKey: ['barter-tree', rootId],
			queryFn: () => (rootId ? buildNode(rootId, 1, 0) : null),
			placeholderData: keepPreviousData,
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
