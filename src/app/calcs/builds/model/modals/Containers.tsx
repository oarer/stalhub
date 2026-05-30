'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { getLocale } from '@/lib/getLocale'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { useBuildStore } from '@/stores/useBuild.store'
import type { ModalProps } from '@/types/build.type'
import {
	type AddStatBlock,
	type ElementListBlock,
	InfoColor,
	infoColorMap,
} from '@/types/item.type'
import { findContSizeInBlocks, messageToString } from '@/utils/itemUtils'
import { ItemsList } from '@/views/builds/model/components/artifacts'
import { ListBlock } from '@/views/items/components/blocks'

type Slot = string | null

export default function ContModal({ onClose }: ModalProps) {
	const locale = getLocale()
	const { data: items } = useSuspenseQuery(
		itemsQueries.get({ type: 'containers' })
	)
	const t = useTranslations()

	const [filter, setFilter] = useState('')

	const container = useBuildStore((s) => s.build.container)
	const setContainer = useBuildStore((s) => s.setContainer)

	const [previewId, setPreviewId] = useState<string | null>(
		container?.id ?? null
	)
	const [showConfirm, setShowConfirm] = useState(false)
	const [pending, setPending] = useState<{
		previewId: string
		newCount: number
		lostItems: Slot[]
	} | null>(null)

	const selectedItem = items.find((i) => i.id === previewId)

	const handleSet = () => {
		if (!previewId) return

		const newCount = findContSizeInBlocks(selectedItem?.infoBlocks) ?? 0
		const prevSlots = (container?.slots ?? []) as Slot[]
		const prevCount = prevSlots.length

		if (newCount < prevCount) {
			const lostItems = prevSlots.slice(newCount)
			setPending({ previewId, newCount, lostItems })
			setShowConfirm(true)
			return
		}

		setContainer(previewId, newCount)
		toast.success(t('modals.builds.container.toaster_success'))
	}

	const visibleItems = items.filter((it) =>
		messageToString(it.name, locale)
			.toLowerCase()
			.includes(filter.toLowerCase())
	)

	return (
		<>
			<div className="flex gap-4 text-nowrap">
				<Card.Root className="min-w-75">
					<Card.Header>
						<Input
							className="px-2 text-[14px]"
							label="ui.input_label"
							onChange={(e) => setFilter(e.target.value)}
							value={filter}
						/>
					</Card.Header>

					<ItemsList
						className="max-h-90"
						favoriteType="container"
						items={visibleItems}
						locale={locale}
						onSelectItem={(id) => setPreviewId(id)}
					/>
				</Card.Root>

				<Card.Root className="min-w-80">
					<Card.Header>
						<Card.Title
							style={{
								color:
									infoColorMap[
										selectedItem?.color as InfoColor
									] || InfoColor.DEFAULT,
							}}
						>
							{selectedItem
								? `| ${messageToString(selectedItem.name, locale)}`
								: `| ${t('modals.builds.container.header')}`}
						</Card.Title>
						<Button
							aria-label="Close modal"
							className="absolute top-2.5 right-4 flex cursor-pointer items-center justify-center rounded-full p-2.5"
							onClick={onClose}
							variant={'ghost'}
						>
							<Icon className="text-lg" icon="lucide:x" />
						</Button>
					</Card.Header>

					<Card.Content className="flex h-full flex-col justify-between">
						<div className="flex flex-col gap-3">
							{selectedItem?.infoBlocks
								.filter(
									(b): b is AddStatBlock | ElementListBlock =>
										(b.type === 'list' ||
											b.type === 'addStat') &&
										Array.isArray(b.elements) &&
										b.elements.length > 0
								)
								.map((block, idx) => (
									<ListBlock
										block={block}
										key={idx}
										locale={locale}
										numericVariants={0}
										withCard={false}
									/>
								))}
						</div>

						<Button
							className="justify-center"
							disabled={!previewId}
							onClick={handleSet}
							variant="secondary"
						>
							{t('modals.builds.pick')}
						</Button>
					</Card.Content>
				</Card.Root>
			</div>
			<Modal.Root
				onOpenChange={(v) => setShowConfirm(v)}
				open={showConfirm}
			>
				<Modal.Content>
					<Modal.Header>
						<Modal.Title className="text-2xl text-red-700 dark:text-red-400">
							{t('modals.builds.container.warn_modal.warn')}
						</Modal.Title>
						<Modal.Description className="font-semibold">
							{t('modals.builds.container.warn_modal.new_small')}
						</Modal.Description>
					</Modal.Header>

					<Modal.Body>
						<p className="font-semibold">
							{t('modals.builds.container.warn_modal.del_count')}{' '}
							{pending ? pending.lostItems.length : 0}{' '}
							{pending && pending.lostItems.length === 1
								? t(
										'modals.builds.container.warn_modal.slots.slot'
									)
								: t(
										'modals.builds.container.warn_modal.slots.slots'
									)}
							.
						</p>
					</Modal.Body>

					<Modal.Footer className="flex justify-end gap-2">
						<Modal.Action
							onClick={() => {
								setPending(null)
								setShowConfirm(false)
							}}
							variant={'ghost'}
						>
							{t('modals.builds.container.warn_modal.cancel')}
						</Modal.Action>
						<Modal.Action
							onClick={() => {
								if (!pending) return
								setContainer(
									pending.previewId,
									pending.newCount
								)
								toast.success(
									`${t('modals.builds.container.warn_modal.success_toast')} ${pending.lostItems.filter(Boolean).length} ${t('modals.builds.container.warn_modal.slots.slots')}`
								)
								setPending(null)
								setShowConfirm(false)
							}}
							variant={'danger'}
						>
							{t('modals.builds.container.warn_modal.confirm')}
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</>
	)
}
