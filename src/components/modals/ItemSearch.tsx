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
import type { ItemListing } from '@/types/api.type'
import type { Article } from '@/types/article.type'
import { infoColorMap } from '@/types/item.type'
import { Divider } from '../ui/Divider'
import { Skeleton } from '../ui/Skeleton'

const PAGE_STEP = 15

const cardVariants = {
	initial: { opacity: 0, y: 8 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0 },
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
	const iconPath = `https://cdn.stalhub.dev/db${item.icon}`

	return (
		<Card.Link
			className="py-2"
			href={item.data.replace(/\.json$/, '')}
			onClick={close}
		>
			<Card.Header className="flex flex-row items-center gap-4 transition-all hover:brightness-75">
				<Card.Title>
					<Image
						alt={name}
						className="size-12 object-contain"
						height={44}
						loading="lazy"
						quality={80}
						src={iconPath}
						width={44}
					/>
				</Card.Title>
				<p
					className="font-semibold text-lg"
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
					className="shrink-0 text-text-accent text-xl"
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
					className="shrink-0 text-text-accent text-xl"
					icon="lucide:file-text"
				/>
				<div className="flex min-w-0 flex-col gap-1">
					<p className="truncate font-semibold text-lg">
						{article.title}
					</p>
					<p className="line-clamp-1 text-sm text-text-accent">
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

	if (loading) return <Skeleton className="size-8" />

	return (
		<Modal.Root onOpenChange={setOpen} open={open}>
			{trigger ? (
				<Modal.Trigger asChild variant={'ghost'}>
					{trigger}
				</Modal.Trigger>
			) : (
				<Modal.Trigger className="rounded-full p-2" variant={'ghost'}>
					<Icon className="text-lg" icon="lucide:search" />
				</Modal.Trigger>
			)}

			<Modal.Content align="top" className="max-w-3xl">
				<Modal.Header>
					<Modal.Title>{t('modals.search.title')}</Modal.Title>
				</Modal.Header>

				<Modal.Body className="grid gap-4">
					<Input
						className="p-2"
						label="modals.search.label"
						onChange={onChange}
						type="text"
						value={query}
					/>

					<AnimatePresence>
						{isEmpty && (
							<motion.p
								animate="animate"
								className="text-center font-semibold text-text-accent"
								exit="exit"
								initial="initial"
								transition={{ duration: 0.18, ease: 'easeOut' }}
								variants={sectionVariants}
							>
								{t('modals.search.not_found')}
							</motion.p>
						)}
					</AnimatePresence>

					<AnimatePresence>
						{displayedPages.length > 0 && (
							<motion.div
								animate="animate"
								className="flex flex-col gap-4"
								exit="exit"
								initial="initial"
								transition={{ duration: 0.18, ease: 'easeOut' }}
								variants={sectionVariants}
							>
								<section className="flex flex-col gap-2">
									<h3
										className={`${unbounded.className} font-semibold text-sm text-text-accent uppercase tracking-widest`}
									>
										{t('modals.search.pages')}
									</h3>
									<ul className="mask-y-from-95% mask-y-to-100% flex max-h-66 flex-col gap-3 overflow-y-auto p-0.5">
										{displayedPages.map((page) => (
											<motion.li
												animate="animate"
												initial="initial"
												key={page.key}
												layout
												transition={{
													duration: 0.2,
													ease: 'easeOut',
												}}
												variants={cardVariants}
											>
												<PageCard
													close={handleClose}
													page={page}
												/>
											</motion.li>
										))}
									</ul>
								</section>
								<Divider />
							</motion.div>
						)}
					</AnimatePresence>

					{displayed.length > 0 && (
						<ul
							className="mask-y-from-95% mask-y-to-100% flex max-h-66 flex-col gap-3 overflow-y-auto p-0.5"
							onScroll={onScroll}
							ref={scrollRef}
						>
							{displayed.map((item) => (
								<motion.li
									animate="animate"
									initial="initial"
									key={item.key}
									layout
									transition={{
										duration: 0.2,
										ease: 'easeOut',
									}}
									variants={cardVariants}
								>
									<ItemCard close={handleClose} item={item} />
								</motion.li>
							))}
						</ul>
					)}

					<AnimatePresence>
						{displayedArticles.length > 0 && (
							<motion.section
								animate="animate"
								className="flex flex-col gap-2"
								exit="exit"
								initial="initial"
								transition={{
									duration: 0.18,
									ease: 'easeOut',
								}}
								variants={sectionVariants}
							>
								<h3 className="font-semibold text-sm text-text-accent uppercase">
									{t('modals.search.articles')}
								</h3>
								<ul className="flex flex-col gap-3">
									{displayedArticles.map((article) => (
										<motion.li
											animate="animate"
											initial="initial"
											key={article.key}
											layout
											transition={{
												duration: 0.2,
												ease: 'easeOut',
											}}
											variants={cardVariants}
										>
											<ArticleCard
												article={article}
												close={handleClose}
											/>
										</motion.li>
									))}
								</ul>
							</motion.section>
						)}
					</AnimatePresence>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}
