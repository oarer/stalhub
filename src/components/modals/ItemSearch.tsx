'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useDebounce } from '@/hooks/useDebounce'
import { usePreparedSearch } from '@/hooks/usePreparedSearch'
import type { SitePage } from '@/hooks/useSearchSitePages'
import { formatDate } from '@/lib/date'
import { getLocale } from '@/lib/getLocale'
import { getItemIcon } from '@/lib/itemIcon'
import type { ItemListing } from '@/types/api.type'
import type { Article } from '@/types/article.type'
import { infoColorMap } from '@/types/item.type'
import { Divider } from '../ui/Divider'
import { Skeleton } from '../ui/Skeleton'

const PAGE_STEP = 15

const EASE_OUT = [0.22, 0.61, 0.36, 1] as const

const cardSpring = {
	type: 'spring',
	stiffness: 420,
	damping: 34,
} as const

const sectionTransition = {
	duration: 0.22,
	ease: EASE_OUT,
} as const

const cardVariants = {
	initial: { opacity: 0, y: 6 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -4 },
}

const sectionVariants = {
	initial: { opacity: 0, y: 10 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -10 },
}

const ItemCard = React.memo(function ItemCard({
	item,
	close,
}: {
	item: ItemListing
	close: () => void
}) {
	const locale = getLocale()
	const name = item.name?.[locale] ?? item.data ?? '—'
	const icon = getItemIcon(item)
	const iconPath = icon ? `https://cdn.stalhub.dev/db${icon}` : ''

	return (
		<Card.Link
			className="py-2"
			href={item.data.replace(/\.json$/, '')}
			onClick={close}
		>
			<Card.Header className="flex flex-row items-center gap-3 transition-all hover:brightness-75">
				{iconPath && (
					<Card.Title>
						<Image
							alt={name}
							className="size-12 shrink-0 object-contain"
							height={44}
							loading="lazy"
							quality={80}
							src={iconPath}
							width={44}
						/>
					</Card.Title>
				)}
				<p
					className="min-w-0 flex-1 truncate font-semibold text-base"
					style={{ color: infoColorMap[item.color] }}
				>
					{name}
				</p>
			</Card.Header>
		</Card.Link>
	)
})

const PageCard = React.memo(function PageCard({
	page,
	close,
}: {
	page: SitePage
	close: () => void
}) {
	return (
		<Card.Link
			className="py-2 transition-all hover:brightness-75 md:dark:bg-accent/70"
			href={page.href}
			onClick={close}
		>
			<Card.Header className="flex flex-row items-center gap-4">
				<Icon
					className="shrink-0 text-foreground text-xl"
					icon={page.icon}
				/>
				<div className="flex min-w-0 flex-col gap-1">
					<p className="truncate font-semibold text-lg">
						{page.title}
					</p>
					{(page.groupTitle || page.description) && (
						<p className="line-clamp-1 font-semibold text-sm">
							{[page.groupTitle, page.description]
								.filter(Boolean)
								.join(' · ')}
						</p>
					)}
				</div>
			</Card.Header>
		</Card.Link>
	)
})

const ArticleCard = React.memo(function ArticleCard({
	article,
	close,
}: {
	article: Article
	close: () => void
}) {
	return (
		<Card.Link
			className="py-2"
			href={`/articles/${article.id}`}
			onClick={close}
		>
			<Card.Header className="flex flex-row items-center gap-4">
				<Icon
					className="shrink-0 text-foreground text-xl"
					icon="lucide:file-text"
				/>
				<div className="flex min-w-0 flex-col gap-1">
					<p className="truncate font-semibold text-lg">
						{article.title}
					</p>
					<p className="line-clamp-1 text-foreground text-sm">
						{article.author?.username}
						{article.created_at && (
							<>
								{' · '}
								{formatDate(article.created_at, 'date')}
							</>
						)}
					</p>
				</div>
			</Card.Header>
		</Card.Link>
	)
})

export default function ItemSearchModal({
	trigger,
}: {
	trigger?: React.ReactNode
}) {
	const t = useTranslations()

	const [query, setQuery] = useState('')
	const [open, setOpen] = useState(false)
	const [visibleCount, setVisibleCount] = useState(PAGE_STEP)
	const scrollRef = useRef<HTMLUListElement>(null)

	const debouncedQuery = useDebounce(query, 150)
	const locale = getLocale()
	const { filteredItems, filteredPages, filteredArticles, loading } =
		usePreparedSearch(debouncedQuery, { locale })

	const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value)
		setVisibleCount(PAGE_STEP)
	}, [])

	const handleOpenChange = useCallback((nextOpen: boolean) => {
		setOpen(nextOpen)
		if (!nextOpen) {
			setQuery('')
			setVisibleCount(PAGE_STEP)
		}
	}, [])

	const handleClose = useCallback(() => {
		setOpen(false)
	}, [])

	const onScroll = useCallback(() => {
		const el = scrollRef.current
		if (!el) return
		if (
			el.scrollTop + el.clientHeight >= el.scrollHeight - 80 &&
			filteredItems.length > visibleCount
		) {
			setVisibleCount((v) => v + PAGE_STEP)
		}
	}, [filteredItems.length, visibleCount])

	const displayed = useMemo(
		() => filteredItems.slice(0, visibleCount),
		[filteredItems, visibleCount]
	)
	const displayedPages = useMemo(
		() => filteredPages.slice(0, PAGE_STEP),
		[filteredPages]
	)
	const displayedArticles = useMemo(
		() => filteredArticles.slice(0, PAGE_STEP),
		[filteredArticles]
	)

	const isEmpty =
		displayed.length === 0 &&
		displayedPages.length === 0 &&
		displayedArticles.length === 0 &&
		query.trim().length > 0

	return (
		<Modal.Root onOpenChange={handleOpenChange} open={open}>
			{trigger ? (
				<Modal.Trigger aria-label="Поиск" asChild variant={'ghost'}>
					{trigger}
				</Modal.Trigger>
			) : (
				<Modal.Trigger
					aria-label="Поиск"
					className="rounded-full p-2"
					variant={'ghost'}
				>
					<Icon
						aria-label="Поиск"
						className="text-lg"
						icon="lucide:search"
					/>
				</Modal.Trigger>
			)}

			<Modal.Content align="top" className="max-w-3xl">
				<Modal.Header>
					<Modal.Title>{t('modals.search.title')}</Modal.Title>
				</Modal.Header>

				<Modal.Body className="grid gap-4">
					<Input
						autoFocus
						className="p-2"
						label="modals.search.label"
						onChange={onChange}
						type="text"
						value={query}
					/>

					<AnimatePresence initial={false} mode="popLayout">
						{loading && (
							<motion.div
								animate={{ opacity: 1 }}
								className="flex h-24 items-center justify-center gap-2 font-semibold text-foreground"
								exit={{ opacity: 0 }}
								initial={{ opacity: 0 }}
								transition={{ duration: 0.15, ease: 'easeOut' }}
							>
								<Skeleton className="size-5" />
								<p>{t('modals.search.loading')}</p>
							</motion.div>
						)}
					</AnimatePresence>

					<AnimatePresence initial={false} mode="popLayout">
						{isEmpty && (
							<motion.p
								animate="animate"
								className="text-center font-semibold text-foreground"
								exit="exit"
								initial="initial"
								transition={sectionTransition}
								variants={sectionVariants}
							>
								{t('modals.search.not_found')}
							</motion.p>
						)}
					</AnimatePresence>

					<AnimatePresence initial={false} mode="popLayout">
						{displayedPages.length > 0 && (
							<motion.div
								animate="animate"
								className="flex flex-col gap-4"
								exit="exit"
								initial="initial"
								layout
								transition={sectionTransition}
								variants={sectionVariants}
							>
								<section className="flex flex-col gap-2">
									<h3
										className={`${unbounded.className} font-semibold text-foreground text-sm uppercase tracking-widest`}
									>
										{t('modals.search.pages')}
									</h3>
									<ul className="mask-y-from-95% mask-y-to-100% flex max-h-66 flex-col gap-3 overflow-y-auto p-0.5">
										<AnimatePresence
											initial={false}
											mode="popLayout"
										>
											{displayedPages.map((page) => (
												<motion.li
													animate="animate"
													exit="exit"
													initial="initial"
													key={page.key}
													layout
													transition={cardSpring}
													variants={cardVariants}
												>
													<PageCard
														close={handleClose}
														page={page}
													/>
												</motion.li>
											))}
										</AnimatePresence>
									</ul>
								</section>
								<Divider />
							</motion.div>
						)}
					</AnimatePresence>

					<AnimatePresence initial={false} mode="popLayout">
						{displayed.length > 0 && (
							<motion.ul
								animate={{ opacity: 1 }}
								className="mask-y-from-95% mask-y-to-100% grid max-h-[55dvh] grid-cols-2 gap-3 overflow-y-auto p-0.5 sm:grid-cols-3"
								exit={{ opacity: 0 }}
								initial={{ opacity: 0 }}
								layout
								onScroll={onScroll}
								ref={scrollRef}
								transition={{ duration: 0.15, ease: 'easeOut' }}
							>
								<AnimatePresence
									initial={false}
									mode="popLayout"
								>
									{displayed.map((item) => (
										<motion.li
											animate="animate"
											exit="exit"
											initial="initial"
											key={item.key}
											layout
											transition={cardSpring}
											variants={cardVariants}
										>
											<ItemCard
												close={handleClose}
												item={item}
											/>
										</motion.li>
									))}
								</AnimatePresence>
							</motion.ul>
						)}
					</AnimatePresence>

					<AnimatePresence initial={false} mode="popLayout">
						{displayedArticles.length > 0 && (
							<motion.section
								animate="animate"
								className="flex flex-col gap-2"
								exit="exit"
								initial="initial"
								layout
								transition={sectionTransition}
								variants={sectionVariants}
							>
								<h3 className="font-semibold text-foreground text-sm uppercase">
									{t('modals.search.articles')}
								</h3>
								<ul className="flex flex-col gap-3">
									<AnimatePresence
										initial={false}
										mode="popLayout"
									>
										{displayedArticles.map((article) => (
											<motion.li
												animate="animate"
												exit="exit"
												initial="initial"
												key={article.key}
												layout
												transition={cardSpring}
												variants={cardVariants}
											>
												<ArticleCard
													article={article}
													close={handleClose}
												/>
											</motion.li>
										))}
									</AnimatePresence>
								</ul>
							</motion.section>
						)}
					</AnimatePresence>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}
