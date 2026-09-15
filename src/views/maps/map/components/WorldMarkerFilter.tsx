'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { montserrat } from '@/app/fonts'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { CheckBox } from '@/components/ui/CheckBox'
import Input from '@/components/ui/Input'
import { useMarkerText } from '@/hooks/useMarkerText'
import type { AtlasWaypoint } from '@/types/map.type'

type Props = {
	spots: AtlasWaypoint[]
	hiddenIcons: Set<string>
	onHiddenIconsChange: (value: Set<string>) => void
	search: string
	onSearchChange: (value: string) => void
}

export default function WorldMarkerFilter({
	spots,
	hiddenIcons,
	onHiddenIconsChange,
	search,
	onSearchChange,
}: Props) {
	const t = useTranslations('map.filter')
	const text = useMarkerText()

	const icons = useMemo(() => {
		const counts = new Map<string, number>()
		for (const spot of spots) {
			counts.set(spot.title_key, (counts.get(spot.title_key) ?? 0) + 1)
		}
		return [...counts.entries()].sort((a, b) => b[1] - a[1])
	}, [spots])

	const toggleIcon = (icon: string) => {
		const next = new Set(hiddenIcons)
		if (next.has(icon)) next.delete(icon)
		else next.add(icon)
		onHiddenIconsChange(next)
	}

	const setAll = (hidden: boolean) => {
		onHiddenIconsChange(
			hidden ? new Set(icons.map(([icon]) => icon)) : new Set()
		)
	}

	return (
		<div className="flex flex-col gap-2">
			<Input
				onChange={(event) => onSearchChange(event.target.value)}
				placeholder={t('search')}
				value={search}
			/>
			<div className="flex gap-1">
				<Button
					className="flex-1"
					onClick={() => setAll(false)}
					size="sm"
					type="button"
					variant="secondary"
				>
					{t('all')}
				</Button>
				<Button
					className="flex-1"
					onClick={() => setAll(true)}
					size="sm"
					type="button"
					variant="secondary"
				>
					{t('none')}
				</Button>
			</div>
			<Accordion
				disableEntranceAnimation
				items={[
					{
						key: 'icons',
						title: t('iconsInfo', {
							total: icons.length,
							shown: icons.length - hiddenIcons.size,
						}),
						content: (
							<div className="flex max-h-64 flex-col gap-1 overflow-y-auto pr-1">
								{icons.map(([icon, count]) => (
									<div
										className="flex items-center justify-between gap-2"
										key={icon}
									>
										<CheckBox
											checked={!hiddenIcons.has(icon)}
											label={text(icon)}
											onCheckedChange={() =>
												toggleIcon(icon)
											}
											size="xs"
										/>
										<span
											className={`${montserrat.className} shrink-0 font-semibold text-[10px] text-muted-foreground`}
										>
											{count}
										</span>
									</div>
								))}
							</div>
						),
					},
				]}
				size="sm"
			/>
		</div>
	)
}
