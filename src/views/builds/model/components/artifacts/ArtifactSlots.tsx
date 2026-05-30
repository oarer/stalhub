'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { inter } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { Art } from '@/types/build.type'
import type { Item, Locale } from '@/types/item.type'
import { InfoColor, infoColorMap } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

type ArtifactSlotsProps = {
	slots: (string | null)[]
	arts: Art[]
	items: Item[]
	locale: Locale
	selectedSlot: number
	onSelectSlot: (index: number) => void
	onCreateContainer: () => void
	onRemove?: (instanceId: string) => void
	setCopyMode: React.Dispatch<React.SetStateAction<boolean>>
	onCancelCopyMode?: () => void
	copyMode?: boolean
}

export function ArtifactSlots({
	slots,
	arts,
	items,
	locale,
	selectedSlot,
	onSelectSlot,
	onRemove,
	setCopyMode,
	copyMode,
}: ArtifactSlotsProps) {
	return (
		<div className="z-1 flex w-full justify-between">
			{slots.map((_, i) => {
				const instanceId = slots[i]
				const art = instanceId
					? (arts.find((a) => a.instanceId === instanceId) ?? null)
					: null
				const item = art
					? (items.find((it) => it.id === art.itemId) ?? null)
					: null

				const isSelected = selectedSlot === i
				const qualityClass = art?.qualityClass
				const colorHex =
					qualityClass !== undefined
						? infoColorMap[qualityClass]
						: InfoColor.DEFAULT

				const borderColor = isSelected
					? 'border-border/60'
					: !slots[i]
						? 'border-border/40'
						: copyMode
							? 'hover:border-border/80'
							: 'border-border/40'

				return (
					<div className="relative" key={i}>
						<button
							className={cn(
								'flex h-22 w-22 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-border/40 bg-background/25 p-1 backdrop-blur-sm transition-colors',
								borderColor
							)}
							onClick={() => onSelectSlot(i)}
						>
							{item ? (
								<div className="flex flex-col items-center">
									<Image
										alt={messageToString(item.name, locale)}
										height={44}
										src={`https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${item.category}/${item.id}.png`}
										width={44}
									/>
									<div className="flex flex-col items-center">
										<p
											className="max-w-16 truncate text-center font-semibold text-xs transition-colors"
											style={{ color: colorHex }}
										>
											{messageToString(item.name, locale)}
										</p>
										{art?.potential !== 0 && (
											<span
												className={`${inter.className} font-semibold text-xs transition-colors`}
												style={{ color: colorHex }}
											>
												+{art?.potential}
											</span>
										)}
									</div>
								</div>
							) : (
								<div className="flex flex-col items-center">
									<Icon
										className="text-2xl text-neutral-500"
										icon="lucide:circle-question-mark"
									/>
								</div>
							)}
						</button>

						{item && (
							<>
								<div className="absolute top-1 left-1">
									<Button
										className="rounded-full p-1 text-white"
										onClick={(e) => {
											e.stopPropagation()
											setCopyMode((prev) => !prev)
										}}
										title="Копировать"
										type="button"
										variant={'ghost'}
									>
										<Icon
											className="size-4"
											icon="lucide:copy"
										/>
									</Button>
								</div>
								<div className="absolute top-1 right-1">
									<Button
										className="rounded-full p-1 text-white ring-transparent"
										onClick={(e) => {
											e.stopPropagation()
											onRemove?.(instanceId!)
										}}
										title="Удалить"
										type="button"
										variant={'danger'}
									>
										<Icon
											className="size-4"
											icon="lucide:trash-2"
										/>
									</Button>
								</div>
							</>
						)}
					</div>
				)
			})}
		</div>
	)
}
