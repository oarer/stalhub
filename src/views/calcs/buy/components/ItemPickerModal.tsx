'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { GITHUB_RAW_BASE } from '@/constants/github.const'
import { useDebounce } from '@/hooks/useDebounce'
import { useFuseSearch } from '@/hooks/useFuseSearch'
import { useSearchItem } from '@/hooks/useSearchItem'
import { getLocale } from '@/lib/getLocale'
import { buyItemKey } from '@/stores/useBuy.store'
import type { ItemListing } from '@/types/api.type'
import { infoColorMap } from '@/types/item.type'

const PAGE_STEP = 20

type ItemPickerModalProps = {
	addedKeys: Set<string>
	onAdd: (item: ItemListing) => void
	onOpenChange: (open: boolean) => void
	open: boolean
}

export default function ItemPickerModal({
	addedKeys,
	onAdd,
	onOpenChange,
	open,
}: ItemPickerModalProps) {
	const t = useTranslations()
	const locale = getLocale()

	const [query, setQuery] = useState('')
	const [visibleCount, setVisibleCount] = useState(PAGE_STEP)

	const debouncedQuery = useDebounce(query, 150)

	const { items, loading } = useSearchItem()

	const { filteredEntries: filteredItems } = useFuseSearch<ItemListing>(
		items ?? [],
		debouncedQuery,
		{
			getKey: (i) => buyItemKey(i),
			getName: (i) => i.name?.[locale] ?? '',
			locale,
			minLength: 2,
			threshold: 0.4,
		}
	)

	const displayed = useMemo(
		() => filteredItems.slice(0, visibleCount),
		[filteredItems, visibleCount]
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
				filteredItems.length > visibleCount
			) {
				setVisibleCount((v) => v + PAGE_STEP)
			}
		},
		[filteredItems.length, visibleCount]
	)

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content align="top" className="max-w-3xl">
				<Modal.Header>
					<Modal.Title>
						{t('buy.searchTitle')} ({filteredItems.length})
					</Modal.Title>
				</Modal.Header>

				<Modal.Body className="flex flex-col gap-4">
					<Input
						autoFocus
						className="p-2"
						label="buy.searchLabel"
						onChange={(e) => {
							setQuery(e.target.value)
							setVisibleCount(PAGE_STEP)
						}}
						placeholder=""
						type="text"
						value={query}
					/>

					{loading ? (
						<div className="flex h-24 items-center justify-center gap-2 font-semibold text-text-accent">
							<Skeleton className="size-5" />
							<p>{t('buy.loading')}</p>
						</div>
					) : displayed.length === 0 && debouncedQuery.trim() ? (
						<AnimatePresence>
							<motion.p
								animate={{ opacity: 1, y: 0 }}
								className="py-6 text-center font-semibold text-text-accent"
								exit={{ opacity: 0 }}
								initial={{ opacity: 0, y: 8 }}
								transition={{ duration: 0.18 }}
							>
								{t('buy.notFound')}
							</motion.p>
						</AnimatePresence>
					) : displayed.length === 0 ? (
						<p className="py-6 text-center font-semibold text-text-accent">
							{t('buy.searchHint')}
						</p>
					) : (
						<ul
							className="mask-y-from-95% mask-y-to-100% flex max-h-110 flex-col gap-2 overflow-y-auto p-0.5"
							onScroll={onScroll}
						>
							{displayed.map((item) => {
								const key = buyItemKey(item)
								const isAdded = addedKeys.has(key)
								const name =
									item.name?.[locale] ?? item.data ?? '—'

								return (
									<motion.li
										animate={{ opacity: 1, y: 0 }}
										initial={{ opacity: 0, y: 8 }}
										key={key}
										transition={{ duration: 0.15 }}
									>
										<button
											className="flex w-full cursor-pointer items-center gap-4 rounded-lg border-2 border-muted bg-card px-3 py-2 text-left transition-all duration-200 hover:border-primary/50 hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
											disabled={isAdded}
											onClick={() => onAdd(item)}
											type="button"
										>
											<Image
												alt={name}
												className="size-8 object-contain"
												height={32}
												loading="lazy"
												src={`${GITHUB_RAW_BASE}${item.icon}`}
												width={32}
											/>
											<p
												className="truncate font-semibold text-sm"
												style={{
													color: infoColorMap[
														item.color
													],
												}}
											>
												{name}
											</p>
											{isAdded && (
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
