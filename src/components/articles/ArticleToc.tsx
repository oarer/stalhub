'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { type RefObject, useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { extractTocHeadings, type TocItem } from '@/lib/toc'

const MIN_HEADINGS = 2

export { MIN_HEADINGS }

const INDICATOR_LAYOUT_ID = 'article-toc-active-heading'

export function useArticleToc(
	contentRef: RefObject<HTMLElement | null>,
	rescanKey: string | null
) {
	const [headings, setHeadings] = useState<TocItem[]>([])
	const [activeId, setActiveId] = useState<string | null>(null)

	useEffect(() => {
		const root = contentRef.current
		if (!root || !rescanKey) {
			setHeadings([])
			return
		}

		const scan = () => {
			setHeadings((prev) => {
				const next = extractTocHeadings(root)
				if (
					prev.length === next.length &&
					prev.every(
						(h, i) =>
							h.id === next[i].id && h.text === next[i].text
					)
				) {
					return prev
				}
				return next
			})
		}

		// MDX renders async after compiledSource is set — scan now and
		// observe further DOM mutations.
		const frame = requestAnimationFrame(scan)
		const observer = new MutationObserver(scan)
		observer.observe(root, { childList: true, subtree: true })

		return () => {
			cancelAnimationFrame(frame)
			observer.disconnect()
		}
	}, [contentRef, rescanKey])

	useEffect(() => {
		if (headings.length === 0) {
			setActiveId(null)
			return
		}

		const spy = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id)
					}
				}
			},
			{ rootMargin: '-96px 0px -70% 0px', threshold: 0 }
		)

		for (const h of headings) {
			const el = document.getElementById(h.id)
			if (el) spy.observe(el)
		}

		return () => spy.disconnect()
	}, [headings])

	return { activeId, headings }
}

function scrollToHeading(id: string) {
	const el = document.getElementById(id)
	if (!el) return
	history.replaceState(null, '', `#${id}`)
	el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function TocList({
	headings,
	activeId,
	onNavigate,
}: {
	headings: TocItem[]
	activeId: string | null
	onNavigate?: () => void
}) {
	return (
		<ul className="flex flex-col gap-0.5">
			{headings.map((h) => {
				const isActive = h.id === activeId
				return (
					<li className="relative" key={h.id}>
						{isActive && (
							<motion.span
								className="absolute top-1 bottom-1 left-0 w-0.5 rounded-full bg-primary"
								layoutId={INDICATOR_LAYOUT_ID}
								transition={{
									damping: 35,
									stiffness: 500,
									type: 'spring',
								}}
							/>
						)}
						<a
							className={cn(
								'block py-1.5 text-sm leading-5 transition-colors',
								h.level === 2 && 'pl-3',
								h.level === 3 && 'pl-6',
								h.level === 4 && 'pl-9',
								isActive
									? 'font-semibold text-primary'
									: 'font-medium text-foreground/60 hover:text-foreground'
							)}
							href={`#${h.id}`}
							onClick={(e) => {
								e.preventDefault()
								scrollToHeading(h.id)
								onNavigate?.()
							}}
						>
							<span className="line-clamp-2">{h.text}</span>
						</a>
					</li>
				)
			})}
		</ul>
	)
}

export function ArticleTocMobile({
	headings,
	activeId,
}: {
	headings: TocItem[]
	activeId: string | null
}) {
	const t = useTranslations()
	const [open, setOpen] = useState(true)

	if (headings.length < MIN_HEADINGS) return null

	return (
		<div className="rounded-xl border-2 border-primary/20 bg-card xl:hidden">
			<button
				aria-expanded={open}
				className="flex w-full cursor-pointer items-center justify-between p-4"
				onClick={() => setOpen((v) => !v)}
				type="button"
			>
				<span className="flex items-center gap-2 font-semibold text-sm">
					<Icon className="size-4 text-primary" icon="lucide:list" />
					{t('articles.toc.title')}
				</span>
				<Icon
					className={cn(
						'size-4 text-foreground transition-transform',
						open && 'rotate-180'
					)}
					icon="lucide:chevron-down"
				/>
			</button>
			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						animate={{ height: 'auto', opacity: 1 }}
						className="overflow-hidden"
						exit={{ height: 0, opacity: 0 }}
						initial={{ height: 0, opacity: 0 }}
						key="toc-list"
						transition={{ duration: 0.25, ease: 'easeInOut' }}
					>
						<div className="px-4 pb-4">
							<TocList
								activeId={activeId}
								headings={headings}
								onNavigate={() => setOpen(false)}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export function ArticleTocAbsolute({
	headings,
	activeId,
	open,
	onToggle,
}: {
	headings: TocItem[]
	activeId: string | null
	open: boolean
	onToggle: () => void
}) {
	const t = useTranslations()

	if (headings.length < MIN_HEADINGS) return null

	return (
		<div className="absolute top-0 right-0 hidden w-72 xl:block">
			<AnimatePresence initial={false} mode="wait">
				{open ? (
					<motion.nav
						animate={{ opacity: 1, x: 0 }}
						aria-label={t('articles.toc.title')}
						className="max-h-[calc(100dvh-9rem)] overflow-y-auto rounded-xl border-2 border-primary/20 bg-card p-4 shadow-lg"
						exit={{ opacity: 0, x: 48 }}
						initial={{ opacity: 0, x: 48 }}
						key="toc-panel"
						transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
					>
						<div className="mb-3 flex items-center justify-between">
							<p className="flex items-center gap-2 font-semibold text-sm">
								<Icon
									className="size-4 text-primary"
									icon="lucide:list"
								/>
								{t('articles.toc.title')}
							</p>
							<button
								aria-label={t('articles.toc.collapse')}
								className="cursor-pointer rounded-md p-1 text-foreground transition-colors hover:text-primary"
								onClick={onToggle}
								type="button"
							>
								<Icon
									className="size-4"
									icon="lucide:chevron-right"
								/>
							</button>
						</div>
						<TocList activeId={activeId} headings={headings} />
					</motion.nav>
				) : (
					<motion.button
						animate={{ opacity: 1, scale: 1 }}
						aria-label={t('articles.toc.title')}
						className="ml-auto flex cursor-pointer rounded-full border-2 border-primary/20 bg-card p-3 text-primary shadow-lg transition-colors hover:border-primary/50"
						exit={{ opacity: 0, scale: 0.8 }}
						initial={{ opacity: 0, scale: 0.8 }}
						key="toc-toggle"
						onClick={onToggle}
						title={t('articles.toc.title')}
						transition={{ duration: 0.2 }}
						type="button"
					>
						<Icon className="size-5" icon="lucide:list" />
					</motion.button>
				)}
			</AnimatePresence>
		</div>
	)
}
