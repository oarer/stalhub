'use client'

import Image from 'next/image'
import { memo, useMemo, useState } from 'react'
import { Accordion } from '@/components/ui/Accordion'
import Input from '@/components/ui/Input'
import Sidebar from '@/components/ui/sideBar/SideBar'
import { cn } from '@/lib/cn'
import type { ItemListing } from '@/types/api.type'
import type { Hideout } from '@/types/hideout.type'
import type { Locale } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import { normalizeItemId } from '../utils/hideoutUtils'

interface RecipeSidebarProps {
	hideoutData: Hideout | undefined
	items: ItemListing[] | null
	locale: string
	selectedItem: string
	onItemChange: (val: string) => void
}

export const RecipeSidebar = memo(function RecipeSidebar({
	hideoutData,
	items,
	locale,
	selectedItem,
	onItemChange,
}: RecipeSidebarProps) {
	const [searchQuery, setSearchQuery] = useState('')

	const categorizedRecipes = useMemo(() => {
		if (!hideoutData) return []

		const localeTyped = locale as Locale
		const itemMap = new Map<string, ItemListing>()
		if (items) {
			for (const item of items) {
				itemMap.set(normalizeItemId(item.data), item)
			}
		}

		const getName = (id: string) => {
			const entry = itemMap.get(id)
			if (!entry) return id
			return (
				entry.name[localeTyped] ??
				Object.values(entry.name ?? {})[0] ??
				id
			)
		}
		const getIcon = (id: string) => {
			const entry = itemMap.get(id)
			if (!entry?.icon) return ''
			return `https://raw.githubusercontent.com/oarer/sc-db/main/merged${entry.icon}`
		}

		const seen = new Set<string>()
		const catMap = new Map<
			string,
			{
				name: string
				recipes: { id: string; name: string; icon: string }[]
			}
		>()

		for (const recipe of hideoutData.recipes) {
			const itemId = normalizeItemId(recipe.result[0].item)
			if (seen.has(itemId)) continue
			seen.add(itemId)

			const catKey = recipe.category.key

			if (!catMap.has(catKey)) {
				catMap.set(catKey, {
					name: messageToString(recipe.category.lines, localeTyped),
					recipes: [],
				})
			}

			catMap.get(catKey)!.recipes.push({
				id: itemId,
				name: getName(itemId),
				icon: getIcon(itemId),
			})
		}

		return Array.from(catMap.entries()).map(([key, { name, recipes }]) => ({
			key,
			name,
			recipes,
		}))
	}, [hideoutData, items, locale])

	const filteredCategories = useMemo(() => {
		if (!searchQuery) return categorizedRecipes

		const q = searchQuery.toLowerCase()
		return categorizedRecipes
			.map((cat) => ({
				...cat,
				recipes: cat.recipes.filter((r) =>
					r.name.toLowerCase().includes(q)
				),
			}))
			.filter((cat) => cat.recipes.length > 0)
	}, [categorizedRecipes, searchQuery])

	const accordionItems = useMemo(
		() =>
			filteredCategories.map((cat) => ({
				key: cat.key,
				title: cat.name,
				content: (
					<div className="flex flex-col gap-0.5">
						{cat.recipes.map((recipe) => (
							<button
								className={cn(
									'flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-background',
									selectedItem === recipe.id &&
										'font-bold text-border'
								)}
								key={recipe.id}
								onClick={() => onItemChange(recipe.id)}
							>
								{recipe.icon && (
									<Image
										alt={recipe.name}
										className="size-8 shrink-0 object-contain"
										height={32}
										src={recipe.icon}
										width={32}
									/>
								)}
								<span className="truncate font-semibold text-sm">
									{recipe.name}
								</span>
							</button>
						))}
					</div>
				),
			})),
		[filteredCategories, selectedItem, onItemChange]
	)

	return (
		<Sidebar>
			<div className="flex flex-col gap-3">
				<Input
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Поиск..."
					value={searchQuery}
				/>

				<Accordion
					className="flex flex-col gap-1"
					items={accordionItems}
					selectionMode="multiple"
					size="sm"
					titleClass="px-0 py-0"
				/>
			</div>
		</Sidebar>
	)
})
