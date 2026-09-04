'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
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

const ArtifactSlotRow = memo(function ArtifactSlotRow({
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
	const t = useTranslations()

	const qualityClass = art?.quality_class
	const colorHex =
		qualityClass !== undefined
			? infoColorMap[qualityClass]
			: InfoColor.DEFAULT

	const isCopied = copyMode && isSelected

	const borderColor = isCopied
		? 'color-mix(in oklch, var(--primary) 50%, transparent)'
		: isSelected
			? colorHex !== InfoColor.DEFAULT
				? `${colorHex}80`
				: 'color-mix(in oklch, var(--primary) 50%, transparent)'
			: !instanceId
				? 'var(--muted)'
				: copyMode
					? 'var(--muted)'
					: colorHex
						? `${colorHex}4D`
						: 'var(--muted)'

	return (
		<div
			className={cn(
				'flex w-full cursor-pointer items-center rounded-lg border-2 bg-card/25 px-2 py-1.5 backdrop-blur-sm transition-all duration-500 hover:bg-card'
			)}
			onClick={() => {
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
				if (!instanceId) onOpenModal()
			}}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					e.currentTarget.click()
				}
			}}
			role="button"
			style={{
				backgroundColor: instanceId ? `${colorHex}22` : undefined,
				borderColor: borderColor,
			}}
			tabIndex={0}
		>
			{item ? (
				<div className="flex w-full items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<Image
							alt={messageToString(item.name, locale)}
							height={32}
							src={`https://cdn.stalhub.dev/db/icons/${item.category}/${item.id}.png`}
							width={32}
						/>
						<p
							className="max-w-18 truncate text-center font-semibold text-sm transition-colors sm:max-w-sm"
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
							className="rounded-lg p-1.5"
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
								toast.info(t('build.toast_copy'), {
									id: 'copy-mode',
									duration: Infinity,
									showClose: false,
								})
							}}
							title={t('build.labels.copy')}
							type="button"
							variant="ghost"
						>
							<Icon className="size-4" icon="lucide:copy" />
						</Button>

						<Button
							className="rounded-lg p-1.5"
							onClick={(e) => {
								e.stopPropagation()
								onSelectSlot(index)
								onOpenModal()
							}}
							title={t('build.labels.swap')}
							type="button"
							variant="ghost"
						>
							<Icon className="size-4" icon="lucide:repeat" />
						</Button>

						<Button
							className="rounded-lg p-1.5 ring-transparent"
							onClick={(e) => {
								e.stopPropagation()
								onRemove?.(instanceId!)
							}}
							title={t('build.labels.delete')}
							type="button"
							variant="danger"
						>
							<Icon className="size-4" icon="lucide:trash-2" />
						</Button>
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center py-1.5">
					<h2 className="font-bold text-sm text-text-accent/70">
						{t('build.empty_slot')}
					</h2>
				</div>
			)}
		</div>
	)
})

export { ArtifactSlotRow }
