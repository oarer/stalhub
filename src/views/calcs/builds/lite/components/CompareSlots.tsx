'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Divider } from '@/components/ui/Divider'
import type { Build } from '@/types/build.type'
import {
	InfoColor,
	type Item,
	infoColorMap,
	type Locale,
} from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

type CompareSlotsProps = {
	build: Build
	name: string
	items: Item[]
	containers: Item[]
	locale: Locale
}

function getIconUrl(item: Item) {
	return `https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${item.category}/${item.id}.png`
}

export function CompareSlots({
	build,
	name,
	items,
	containers,
	locale,
}: CompareSlotsProps) {
	const t = useTranslations()

	const itemsMap = useMemo(
		() => new Map(items.map((i) => [i.id, i])),
		[items]
	)
	const containersMap = useMemo(
		() => new Map(containers.map((i) => [i.id, i])),
		[containers]
	)

	const slots = build.container?.slots ?? []
	const container = build.container
		? (containersMap.get(build.container.id) ?? null)
		: null
	const containerColorHex = container
		? (infoColorMap[container.color as InfoColor] ?? InfoColor.DEFAULT)
		: InfoColor.DEFAULT

	return (
		<div className="flex w-fit flex-col gap-2">
			<p className="max-w-13 truncate border-border-secondary border-b pb-2 text-center font-bold">
				{name}
			</p>
			{slots.length === 0 ? (
				<p className="py-4 text-center text-sm text-text-accent">
					{t('build.stats.no_container')}
				</p>
			) : (
				slots.map((instanceId, i) => {
					const art = instanceId
						? build.arts.find((a) => a.instanceId === instanceId)
						: null
					const item = art ? (itemsMap.get(art.itemId) ?? null) : null
					const colorHex = art?.qualityClass
						? (infoColorMap[art.qualityClass as InfoColor] ??
							InfoColor.DEFAULT)
						: InfoColor.DEFAULT

					return (
						<div
							className="flex w-fit items-center gap-2 rounded-lg border-2 px-2 py-1.5 transition-colors"
							key={i}
							style={{
								backgroundColor: art
									? `${colorHex}22`
									: undefined,
								borderColor: art
									? colorHex !== InfoColor.DEFAULT
										? `${colorHex}4D`
										: 'var(--border-secondary)'
									: 'var(--border-secondary)',
							}}
						>
							{item ? (
								<Image
									alt={messageToString(item.name, locale)}
									height={32}
									src={getIconUrl(item)}
									width={32}
								/>
							) : (
								<div className="flex flex-col items-center px-1.5 py-1.75">
									<Icon
										className="text-lg text-text-accent/70"
										icon="lucide:circle-question-mark"
									/>
								</div>
							)}
						</div>
					)
				})
			)}
			{container && (
				<>
					<Divider />
					<div
						className="flex w-fit items-center gap-2 rounded-lg px-2 py-1.5"
						style={{
							background: `${containerColorHex}33`,
							color: containerColorHex,
						}}
					>
						<Image
							alt={messageToString(container.name, locale)}
							height={34}
							src={getIconUrl(container)}
							width={34}
						/>
					</div>
				</>
			)}
		</div>
	)
}
