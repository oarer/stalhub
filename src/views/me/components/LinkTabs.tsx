'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'
import { cn } from '@/lib/cn'

export interface LinkTab {
	title: string
	href: string
	children?: LinkTab[]
	badge?: number
}

interface SliderRowProps {
	items: LinkTab[]
	activeHref: string | null
	onSelect: (href: string) => void
}

function SliderRow({ items, activeHref, onSelect }: SliderRowProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const indicatorRef = useRef<HTMLSpanElement>(null)
	const buttonRefs = useRef(new Map<string, HTMLButtonElement>())
	const [hoveredHref, setHoveredHref] = useState<string | null>(null)

	const targetHref = hoveredHref ?? activeHref

	const positionIndicator = useCallback(() => {
		const button = targetHref
			? buttonRefs.current.get(targetHref)
			: undefined
		const indicator = indicatorRef.current
		if (!button || !indicator) return
		indicator.style.left = `${button.offsetLeft}px`
		indicator.style.width = `${button.offsetWidth}px`
		indicator.style.opacity = '1'
	}, [targetHref])

	useLayoutEffect(() => {
		positionIndicator()
	}, [positionIndicator])

	useEffect(() => {
		const container = containerRef.current
		if (!container) return
		const observer = new ResizeObserver(positionIndicator)
		observer.observe(container)
		return () => observer.disconnect()
	}, [positionIndicator])

	useEffect(() => {
		if (!activeHref) return
		buttonRefs.current.get(activeHref)?.scrollIntoView({
			behavior: 'smooth',
			inline: 'center',
			block: 'nearest',
		})
	}, [activeHref])

	return (
		<div
			className="relative flex items-center gap-2 overflow-x-auto"
			ref={containerRef}
			role="tablist"
		>
			{items.map((tab) => {
				const isActive = tab.href === activeHref
				return (
					<button
						aria-selected={isActive}
						className={cn(
							'mb-2 inline-flex shrink-0 cursor-pointer items-center gap-2 text-nowrap rounded-lg px-3 py-2 font-semibold text-sm transition-colors duration-500',
							isActive
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:text-primary/80'
						)}
						key={tab.href}
						onClick={() => onSelect(tab.href)}
						onMouseEnter={() => setHoveredHref(tab.href)}
						onMouseLeave={() => setHoveredHref(null)}
						ref={(el) => {
							if (el) buttonRefs.current.set(tab.href, el)
							else buttonRefs.current.delete(tab.href)
						}}
						role="tab"
						type="button"
					>
						{tab.title}
						{tab.badge != null && tab.badge > 0 && (
							<span className="rounded-full bg-border px-1.5 py-0.5 font-semibold text-white text-xs leading-none">
								{tab.badge > 99 ? '99+' : tab.badge}
							</span>
						)}
					</button>
				)
			})}
			<span
				aria-hidden="true"
				className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-primary opacity-0 transition-all duration-200 ease-in-out"
				ref={indicatorRef}
			/>
		</div>
	)
}

interface LinkTabsProps {
	tabs: LinkTab[]
	className?: string
}

export default function LinkTabs({ tabs, className }: LinkTabsProps) {
	const router = useRouter()
	const pathname = usePathname()

	const isMatch = (href: string, path: string) =>
		path === href || path.startsWith(`${href}/`)

	const deepestHref = tabs
		.flatMap((tab) => [
			tab.href,
			...(tab.children ?? []).map((child) => child.href),
		])
		.filter((href) => isMatch(href, pathname))
		.sort((a, b) => b.length - a.length)[0]

	const activeTab = tabs.find(
		(tab) =>
			tab.href === deepestHref ||
			tab.children?.some((child) => child.href === deepestHref)
	)

	const activeChild = activeTab?.children?.reduce<LinkTab | null>(
		(acc, tab) =>
			isMatch(tab.href, pathname) &&
			(!acc || tab.href.length > acc.href.length)
				? tab
				: acc,
		null
	)

	useEffect(() => {
		for (const tab of tabs) {
			router.prefetch(tab.href)
			for (const child of tab.children ?? []) router.prefetch(child.href)
		}
	}, [router, tabs])

	const handleSelect = useCallback(
		(href: string) => router.push(href),
		[router]
	)

	return (
		<div className={cn('flex flex-col gap-1', className)}>
			<SliderRow
				activeHref={activeTab?.href ?? null}
				items={tabs}
				onSelect={handleSelect}
			/>
			{activeTab?.children && (
				<SliderRow
					activeHref={activeChild?.href ?? null}
					items={activeTab.children}
					onSelect={handleSelect}
				/>
			)}
		</div>
	)
}
