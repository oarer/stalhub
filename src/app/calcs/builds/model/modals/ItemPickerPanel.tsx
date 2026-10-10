'use client'

import { Card } from '@/components/ui/Card'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { ItemsList } from '@/shared/components/ItemsList'
import type { FavoriteType } from '@/stores/useFavorites.store'
import type { Item, Locale } from '@/types/item.type'

interface ItemPickerPanelProps {
	cardClassName?: string
	listClassName?: string
	favoriteType: FavoriteType
	items: Item[]
	locale: Locale
	filter: string
	onFilterChange: (value: string) => void
	effectOptions?: ComboboxOption[]
	selectedEffects?: string[]
	onSelectedEffectsChange?: (values: string[]) => void
	preserveOrder?: boolean
	onSelectItem: (itemId: string) => void
	selectedItemId?: string | null
}

export function ItemPickerPanel({
	cardClassName,
	listClassName,
	favoriteType,
	items,
	locale,
	filter,
	onFilterChange,
	effectOptions,
	selectedEffects,
	onSelectedEffectsChange,
	preserveOrder,
	onSelectItem,
	selectedItemId,
}: ItemPickerPanelProps) {
	return (
		<Card.Root className={cardClassName}>
			<Card.Header>
				<Input
					className="px-2 text-[14px]"
					label="ui.input_label"
					onChange={(e) => onFilterChange(e.target.value)}
					value={filter}
				/>
				{effectOptions && onSelectedEffectsChange && (
					<Combobox
						className="mt-2"
						multiple
						onValuesChange={onSelectedEffectsChange}
						options={effectOptions}
						placeholder="build.labels.effects"
						translateOptions={false}
						values={selectedEffects ?? []}
						zIndex={999999}
					/>
				)}
			</Card.Header>

			<ItemsList
				className={listClassName}
				favoriteType={favoriteType}
				items={items}
				locale={locale}
				onSelectItem={onSelectItem}
				preserveOrder={preserveOrder}
				query={filter}
				selectedItemId={selectedItemId}
			/>
		</Card.Root>
	)
}
