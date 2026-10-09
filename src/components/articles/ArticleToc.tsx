'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { type RefObject, useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { extractTocHeadings, type TocItem } from '@/lib/toc'

const MIN_HEADINGS = 2

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
		<ul className="flex flex-col">
			{headings.map((h) => {
				const isActive = h.id === activeId
				return (
					<li key={h.id}>
						<a
							className={cn(
								'block border-l-2 py-1.5 text-sm leading-5 transition-colors',
								h.level === 2 && 'pl-3',
								h.level === 3 && 'pl-6',
								h.level === 4 && 'pl-9',
								isActive
									? 'border-primary font-semibold text-primary'
									: 'border-primary/15 font-medium text-foreground/70 hover:border-primary/50 hover:text-primary'
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

export function ArticleTocAside({
	headings,
	activeId,
}: {
	headings: TocItem[]
	activeId: string | null
}) {
	const t = useTranslations()

	if (headings.length < MIN_HEADINGS) return null

	return (
		<nav
			aria-label={t('articles.toc.title')}
			className="rounded-xl border-2 border-primary/20 bg-card p-4"
		>
			<p className="mb-3 flex items-center gap-2 font-semibold text-sm">
				<Icon className="size-4 text-primary" icon="lucide:list" />
				{t('articles.toc.title')}
			</p>
			<TocList activeId={activeId} headings={headings} />
		</nav>
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
			{open && (
				<div className="px-4 pb-4">
					<TocList
						activeId={activeId}
						headings={headings}
						onNavigate={() => setOpen(false)}
					/>
				</div>
			)}
		</div>
	)
}
