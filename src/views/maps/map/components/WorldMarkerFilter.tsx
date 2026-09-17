'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { CheckBox } from '@/components/ui/CheckBox'
import Input from '@/components/ui/Input'
import { useMarkerText } from '@/hooks/useMarkerText'
import type { AtlasWaypoint } from '@/types/map.type'
import type { AccordionItem } from '@/types/ui/accordion.type'
import {
	filteredMarkerLabel,
	filteredNameKey,
	filteredTypeKey,
} from '../lib/filteredMarkers'
import type { SourceMarker } from './FilteredWorldMarkers'

export type FilteredTypeGroup = {
	group: string
	types: [string, number][]
	count: number
}

type Props = {
	spots: AtlasWaypoint[]
	filteredMarkers: SourceMarker[]
	hiddenIcons: Set<string>
	filteredTypeGroups: FilteredTypeGroup[]
	hiddenFilteredTypes: Set<string>
	hiddenFilteredNames: Set<string>
	onHiddenFilteredTypesChange: (value: Set<string>) => void
	onHiddenFilteredNamesChange: (value: Set<string>) => void
	onHiddenIconsChange: (value: Set<string>) => void
	search: string
	onSearchChange: (value: string) => void
}

export default function WorldMarkerFilter({
	spots,
	filteredMarkers,
	hiddenIcons,
	filteredTypeGroups,
	hiddenFilteredTypes,
	hiddenFilteredNames,
	onHiddenFilteredTypesChange,
	onHiddenFilteredNamesChange,
	onHiddenIconsChange,
	search,
	onSearchChange,
}: Props) {
	const t = useTranslations('map.filter')
	const text = useMarkerText()
	const [nameSearch, setNameSearch] = useState('')

	const icons = useMemo(() => {
		const counts = new Map<string, number>()
		for (const spot of spots) {
			counts.set(spot.title_key, (counts.get(spot.title_key) ?? 0) + 1)
		}
		return [...counts.entries()].sort((a, b) => b[1] - a[1])
	}, [spots])

	const nameGroups = useMemo(() => {
		const map = new Map<
			string,
			{
				key: string
				marker: SourceMarker
				count: number
				types: Set<string>
			}
		>()
		for (const marker of filteredMarkers) {
			const key = filteredNameKey(marker)
			const entry = map.get(key)
			if (entry) {
				entry.count += 1
				entry.types.add(filteredTypeKey(marker))
			} else {
				map.set(key, {
					key,
					marker,
					count: 1,
					types: new Set([filteredTypeKey(marker)]),
				})
			}
		}
		return [...map.values()].sort((a, b) => b.count - a.count)
	}, [filteredMarkers])

	const query = nameSearch.trim().toLowerCase()
	const nameMatches = useMemo(() => {
		if (!query) return []
		return nameGroups.filter(
			({ key, marker }) =>
				filteredMarkerLabel(marker, text)
					.toLowerCase()
					.includes(query) || key.toLowerCase().includes(query)
		)
	}, [nameGroups, query, text])

	const toggleIcon = (icon: string) => {
		const next = new Set(hiddenIcons)
		if (next.has(icon)) next.delete(icon)
		else next.add(icon)
		onHiddenIconsChange(next)
	}

	const toggleName = (key: string, types: Set<string>) => {
		const visible =
			!hiddenFilteredNames.has(key) &&
			[...types].some((type) => !hiddenFilteredTypes.has(type))
		if (visible) {
			const nextNames = new Set(hiddenFilteredNames)
			nextNames.add(key)
			onHiddenFilteredNamesChange(nextNames)
			return
		}
		const nextNames = new Set(hiddenFilteredNames)
		nextNames.delete(key)
		onHiddenFilteredNamesChange(nextNames)
		const nextTypes = new Set(hiddenFilteredTypes)
		for (const type of types) nextTypes.delete(type)
		onHiddenFilteredTypesChange(nextTypes)
	}

	const setAll = (hidden: boolean) => {
		onHiddenIconsChange(
			hidden ? new Set(icons.map(([icon]) => icon)) : new Set()
		)
		onHiddenFilteredTypesChange(
			hidden
				? new Set(
						filteredTypeGroups.flatMap(({ types }) =>
							types.map(([type]) => type)
						)
					)
				: new Set()
		)
		onHiddenFilteredNamesChange(
			hidden ? new Set(nameGroups.map(({ key }) => key)) : new Set()
		)
	}

	const accordionItems: AccordionItem[] = [
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
								onCheckedChange={() => toggleIcon(icon)}
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
		{
			key: 'names',
			title: t('namesInfo', {
				total: nameGroups.length,
				shown: nameGroups.length - hiddenFilteredNames.size,
			}),
			content: (
				<div className="flex max-h-72 flex-col gap-1 overflow-y-auto pr-1">
					{(query ? nameMatches : nameGroups).map(
						({ key, marker, count, types }) => (
							<div
								className="flex items-center justify-between gap-2"
								key={key}
							>
								<CheckBox
									checked={
										!hiddenFilteredNames.has(key) &&
										[...types].some(
											(type) =>
												!hiddenFilteredTypes.has(type)
										)
									}
									label={filteredMarkerLabel(marker, text)}
									onCheckedChange={() =>
										toggleName(key, types)
									}
									size="xs"
								/>
								<span
									className={`${montserrat.className} shrink-0 font-semibold text-[10px] text-muted-foreground`}
								>
									{count}
								</span>
							</div>
						)
					)}
				</div>
			),
		},

	]

	return (
		<div className="flex flex-col gap-2">
			<Input
				onChange={(event) => onSearchChange(event.target.value)}
				placeholder={t('search')}
				value={search}
			/>
			<Input
				onChange={(event) => setNameSearch(event.target.value)}
				placeholder={t('filteredSearch')}
				value={nameSearch}
			/>
			<div className="flex gap-1">
				<Button
					className="flex-1 font-semibold"
					onClick={() => setAll(false)}
					size="sm"
					type="button"
					variant="secondary"
				>
					{t('all')}
				</Button>
				<Button
					className="flex-1 font-semibold"
					onClick={() => setAll(true)}
					size="sm"
					type="button"
					variant="secondary"
				>
					{t('none')}
				</Button>
			</div>
			<Accordion
				className="gap-2"
				disableEntranceAnimation
				items={accordionItems}
				selectionMode="multiple"
				size="sm"
			/>
		</div>
	)
}
