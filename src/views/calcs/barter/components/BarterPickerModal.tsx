'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useFuseSearch } from '@/hooks/useFuseSearch'
import { getLocale } from '@/lib/getLocale'
import type { Message } from '@/types/item.type'
import { infoColorMap } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

export type BarterListEntry = {
	item_id: string
	settlement_required_level: number
	lines: Message
	category: string
	color: string
}

type BarterPickerModalProps = {
	items: BarterListEntry[] | undefined
	loading: boolean
	onOpenChange: (open: boolean) => void
	onSelect: (item: BarterListEntry) => void
	open: boolean
	selectedId?: string
}

const PAGE_STEP = 20

function barterIcon(category: string) {
	return category ? `https://cdn.stalhub.dev/db/icons${category}.png` : null
}

export default function BarterPickerModal({
	items,
	loading,
	onOpenChange,
	onSelect,
	open,
	selectedId,
}: BarterPickerModalProps) {
	const t = useTranslations()
	const locale = getLocale()

	const [query, setQuery] = useState('')
	const [visibleCount, setVisibleCount] = useState(PAGE_STEP)

	const debouncedQuery = useDebounce(query, 150)

	const { filteredEntries: searched } = useFuseSearch<BarterListEntry>(
		items ?? [],
		debouncedQuery,
		{
			getKey: (i) => i.item_id,
			getName: (i) => messageToString(i.lines as never, locale),
			locale,
			minLength: 2,
			threshold: 0.4,
		}
	)

	const hasQuery = debouncedQuery.trim().length >= 2
	const baseList = useMemo(() => {
		if (hasQuery) return searched
		return (items ?? []).slice(0, 100)
	}, [hasQuery, searched, items])

	const displayed = useMemo(
		() => baseList.slice(0, visibleCount),
		[baseList, visibleCount]
	)

	useEffect(() => {
		if (!open) {
			setQuery('')
			setVisibleCount(PAGE_STEP)
		}
	}, [open])

	const onScroll = useCallback(
		(e: React.UIEvent<HTMLUListElement>) => {
			const el = e.currentTarget
			if (
				el.scrollTop + el.clientHeight >= el.scrollHeight - 80 &&
				baseList.length > visibleCount
			) {
				setVisibleCount((v) => v + PAGE_STEP)
			}
		},
		[baseList.length, visibleCount]
	)

	const totalCount = hasQuery ? searched.length : (items?.length ?? 0)

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content align="top" className="max-w-3xl">
				<Modal.Header>
					<Modal.Title>
						{t('barterCalc.searchTitle')} ({totalCount})
					</Modal.Title>
				</Modal.Header>

				<Modal.Body className="flex flex-col gap-4">
					<Input
						autoFocus
						className="p-2"
						label="barterCalc.search"
						onChange={(e) => {
							setQuery(e.target.value)
							setVisibleCount(PAGE_STEP)
						}}
						placeholder=""
						type="text"
						value={query}
					/>

					{loading && !items ? (
						<div className="flex h-24 items-center justify-center gap-2 font-semibold text-foreground">
							<Skeleton className="size-5" />
							<p>{t('buy.loading')}</p>
						</div>
					) : displayed.length === 0 && hasQuery ? (
						<AnimatePresence>
							<motion.p
								animate={{ opacity: 1, y: 0 }}
								className="py-6 text-center font-semibold text-foreground"
								exit={{ opacity: 0 }}
								initial={{ opacity: 0, y: 8 }}
								transition={{ duration: 0.18 }}
							>
								{t('buy.notFound')}
							</motion.p>
						</AnimatePresence>
					) : displayed.length === 0 ? (
						<p className="py-6 text-center font-semibold text-foreground">
							{t('buy.searchHint')}
						</p>
					) : (
						<ul
							className="mask-y-from-95% mask-y-to-100% flex max-h-110 flex-col gap-2 overflow-y-auto p-0.5"
							onScroll={onScroll}
						>
							{displayed.map((item) => {
								const name =
									messageToString(
										item.lines as never,
										locale
									) || item.item_id
								const isSelected = selectedId === item.item_id
								const icon = barterIcon(item.category)

								return (
									<motion.li
										animate={{ opacity: 1, y: 0 }}
										initial={{ opacity: 0, y: 8 }}
										key={item.item_id}
										transition={{ duration: 0.15 }}
									>
										<button
											className="flex w-full cursor-pointer items-center gap-4 rounded-lg border-2 border-muted bg-card px-3 py-2 text-left transition-all duration-200 hover:border-primary/50 hover:brightness-125"
											onClick={() => onSelect(item)}
											type="button"
										>
											{icon && (
												<Image
													alt={name}
													className="size-8 object-contain"
													height={32}
													loading="lazy"
													src={icon}
													width={32}
												/>
											)}
											<p
												className="truncate font-semibold text-sm"
												style={{
													color:
														infoColorMap[
															item.color as keyof typeof infoColorMap
														] ?? undefined,
												}}
											>
												{name}
											</p>
											{isSelected && (
												<Icon
													className="ml-auto shrink-0 text-lg text-primary"
													icon="lucide:check"
												/>
											)}
										</button>
									</motion.li>
								)
							})}
						</ul>
					)}
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}
