'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { montserrat } from '@/app/fonts'
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
		<div className="flex w-full flex-col gap-2 sm:w-fit">
			<p className="truncate border-border-secondary border-b pb-2 text-center font-bold sm:max-w-13">
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
							className="flex w-full items-center gap-2 rounded-lg border-2 px-2 py-1.5 transition-colors sm:w-fit"
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
								<>
									<Image
										alt={messageToString(item.name, locale)}
										height={32}
										src={getIconUrl(item)}
										width={32}
									/>
									<div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:hidden">
										<p
											className="truncate font-semibold text-sm"
											style={{ color: colorHex }}
										>
											{messageToString(item.name, locale)}
										</p>
										<div className="flex shrink-0 items-center gap-2">
											{art?.potential !== 0 && (
												<span
													className={`${montserrat.className} font-medium text-sm`}
													style={{ color: colorHex }}
												>
													+{art?.potential}
												</span>
											)}
											<span
												className={`${montserrat.className} font-medium text-sm`}
												style={{ color: colorHex }}
											>
												{art?.percent}%
											</span>
										</div>
									</div>
								</>
							) : (
								<>
									<div className="flex flex-col items-center px-1.5 py-1.75">
										<Icon
											className="text-lg text-text-accent/70"
											icon="lucide:circle-question-mark"
										/>
									</div>
									<p className="truncate font-semibold text-sm text-text-accent/70 sm:hidden">
										{t('build.empty_slot')}
									</p>
								</>
							)}
						</div>
					)
				})
			)}
			{container && (
				<>
					<Divider />
					<div
						className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 sm:w-fit"
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
						<p className="truncate font-semibold text-sm sm:hidden">
							{messageToString(container.name, locale)}
						</p>
					</div>
				</>
			)}
		</div>
	)
}
