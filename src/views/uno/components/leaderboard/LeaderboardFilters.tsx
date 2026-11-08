'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { UnoFaction } from '../UnoFaction'

export function LeaderboardFilters({
	search,
	faction,
	factions,
	onSearchChange,
	onFactionChange,
}: {
	search: string
	faction: string
	sort: string
	factions: string[]
	onSearchChange: (value: string) => void
	onFactionChange: (value: string) => void
	onSortChange: (value: string) => void
}) {
	const t = useTranslations('uno')

	return (
		<Card.Root className="gap-4">
			<Input
				aria-label={t('search')}
				label="uno.search"
				onChange={(event) => onSearchChange(event.target.value)}
				value={search}
			/>
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-muted-foreground text-xs">
					{t('filters.faction')}
				</span>
				<Button
					onClick={() => onFactionChange('all')}
					size="sm"
					variant={faction === 'all' ? 'primary' : 'outline'}
				>
					{t('filters.allFactions')}
				</Button>
				{factions.map((item) => (
					<Button
						key={item}
						onClick={() => onFactionChange(item)}
						size="sm"
						variant={faction === item ? 'primary' : 'outline'}
					>
						<UnoFaction faction={item} size={16} />
					</Button>
				))}
			</div>
		</Card.Root>
	)
}
