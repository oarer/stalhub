'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import type { Art } from '@/types/build.type'
import type { Item, Locale } from '@/types/item.type'
import { InfoColor, infoColorMap } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

type ArtifactSlotRowProps = {
	index: number
	instanceId: string | null
	art: Art | null
	item: Item | null
	locale: Locale
	isSelected: boolean
	copyMode?: boolean
	onSelectSlot: (index: number) => void
	onOpenModal: () => void
	onRemove?: (instanceId: string) => void
	setCopyMode: React.Dispatch<React.SetStateAction<boolean>>
}

//! TODO на мобилках урезать макс ширину + truncate

export function ArtifactSlotRow({
	index,
	instanceId,
	art,
	item,
	locale,
	isSelected,
	copyMode,
	onSelectSlot,
	onOpenModal,
	onRemove,
	setCopyMode,
}: ArtifactSlotRowProps) {
	const qualityClass = art?.qualityClass
	const colorHex =
		qualityClass !== undefined
			? infoColorMap[qualityClass]
			: InfoColor.DEFAULT

	const isCopied = copyMode && isSelected

	const borderColor = isCopied
		? 'border-blue-500/80 bg-blue-500/10 ring-1 ring-blue-500/30'
		: isSelected
			? 'border-border/60'
			: !instanceId
				? 'border-border/40'
				: copyMode
					? 'hover:border-border/80'
					: 'border-border/40'

	return (
		<div className="relative">
			<button
				className={cn(
					'flex w-full cursor-pointer items-center rounded-lg border-2 border-border/40 bg-background/25 px-2 py-1.5 backdrop-blur-sm transition-all duration-500 hover:bg-background',
					borderColor
				)}
				onClick={() => {
					onSelectSlot(index)
					if (!item) onOpenModal()
				}}
				type="button"
			>
				{item ? (
					<div className="flex w-full items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<Image
								alt={messageToString(item.name, locale)}
								height={32}
								src={`https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${item.category}/${item.id}.png`}
								width={32}
							/>
							<p
								className="text-center font-semibold text-sm transition-colors"
								style={{ color: colorHex }}
							>
								{messageToString(item.name, locale)}
							</p>

							{art?.potential !== 0 && (
								<span
									className={`${montserrat.className} font-medium text-sm transition-colors`}
									style={{ color: colorHex }}
								>
									+{art?.potential}
								</span>
							)}

							<span
								className={`${montserrat.className} font-medium text-sm transition-colors`}
								style={{ color: colorHex }}
							>
								{art?.percent}%
							</span>
						</div>

						<div className="flex items-center gap-3">
							<Button
								className="rounded-lg p-1.5 text-white"
								onClick={(e) => {
									e.stopPropagation()

									if (copyMode) {
										if (isSelected) {
											setCopyMode(false)
											toast.dismiss('copy-mode')
										} else {
											onSelectSlot(index)
										}
										return
									}

									onSelectSlot(index)
									setCopyMode(true)
									toast.info('Режим копирования активен', {
										id: 'copy-mode',
										duration: Infinity,
										showClose: false,
									})
								}}
								title="Копировать"
								type="button"
								variant="ghost"
							>
								<Icon className="size-4" icon="lucide:copy" />
							</Button>

							<Button
								className="rounded-lg p-1.5 text-white"
								onClick={(e) => {
									e.stopPropagation()
									onSelectSlot(index)
									onOpenModal()
								}}
								title="Заменить"
								type="button"
								variant="ghost"
							>
								<Icon className="size-4" icon="lucide:repeat" />
							</Button>

							<Button
								className="rounded-lg p-1.5 text-white ring-transparent"
								onClick={(e) => {
									e.stopPropagation()
									onRemove?.(instanceId!)
								}}
								title="Удалить"
								type="button"
								variant="danger"
							>
								<Icon
									className="size-4"
									icon="lucide:trash-2"
								/>
							</Button>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center py-1.5">
						<h2 className="font-bold text-sm text-text-accent/70">
							Пустая ячейка
						</h2>
					</div>
				)}
			</button>
		</div>
	)
}
