'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckBox } from '@/components/ui/CheckBox'
import type { ArcadeMapData } from '@/data/arcadeMaps'
import { cn } from '@/lib/cn'

interface SessionMapsProps {
	maps: ArcadeMapData[]
	selected: Set<string>
	onToggle: (id: string) => void
	onSelect: (ids: string[]) => void
}

export function SessionMaps({
	maps,
	selected,
	onToggle,
	onSelect,
}: SessionMapsProps) {
	const t = useTranslations()

	const activeMaps = maps.filter((map) => map.arcadeActive)

	return (
		<Card.Root className="flex flex-col gap-4">
			<Card.Header>
				<Card.Title>
					<Icon
						className="text-neutral-700 text-xl dark:text-neutral-300"
						icon="lucide:map"
					/>
					<h2>{t('sessions.maps')}</h2>
				</Card.Title>
				<Card.Description className="font-semibold">
					{t('sessions.maps_hint', {
						count: selected.size,
					})}
				</Card.Description>
			</Card.Header>

			<Card.Content className="flex flex-col gap-4">
				<div className="flex flex-wrap gap-2">
					<Button
						onClick={() =>
							onSelect(activeMaps.map((map) => map.id))
						}
						size="sm"
						type="button"
						variant="outline"
					>
						{t('sessions.select_active')}
					</Button>
					<Button
						onClick={() => onSelect(maps.map((map) => map.id))}
						size="sm"
						type="button"
						variant="outline"
					>
						{t('sessions.select_all')}
					</Button>
					<Button
						onClick={() => onSelect([])}
						size="sm"
						type="button"
						variant="danger"
					>
						{t('sessions.clear')}
					</Button>
				</div>

				<div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
					{maps.map((map) => {
						const checked = selected.has(map.id)

						return (
							<div
								className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-1 py-1 duration-500 hover:bg-muted data-[checked=true]:bg-primary/10"
								data-checked={checked}
								key={map.id}
								onClick={() => onToggle(map.id)}
							>
								<div className="flex items-center gap-3">
									<CheckBox
										checked={checked}
										onCheckedChange={() => onToggle(map.id)}
										size="sm"
									/>
									<span className="font-semibold text-sm">
										{map.label}
									</span>
								</div>
								<Badge
									className={cn(
										'max-w-24 justify-center',
										!checked && 'opacity-50'
									)}
									variant="secondary"
								>
									{t(`sessions.mode.${map.mode}`)}
								</Badge>
							</div>
						)
					})}
				</div>
			</Card.Content>
		</Card.Root>
	)
}
