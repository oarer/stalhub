'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import type { TOCItem, WikiAuthor } from '@/types/wiki.type'
import { Authors } from './authors'

interface TOCProps {
	items: TOCItem[]
	authors?: WikiAuthor[]
	slug: string
}

export function TOC({ items, authors, slug }: TOCProps) {
	const [activeId, setActiveId] = useState<string>('')
	const [indicator, setIndicator] = useState({
		top: 0,
		height: 0,
		visible: false,
	})
	const t = useTranslations()

	const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) setActiveId(entry.target.id)
				})
			},
			{ rootMargin: '-80px 0px -80% 0px' }
		)

		items.forEach((item) => {
			const element = document.getElementById(item.id)
			if (element) observer.observe(element)
		})

		return () => observer.disconnect()
	}, [items])

	useLayoutEffect(() => {
		const updateIndicator = () => {
			const activeItem = itemRefs.current[activeId]

			if (!activeItem) {
				setIndicator((prev) => ({ ...prev, visible: false }))
				return
			}

			setIndicator({
				top: activeItem.offsetTop,
				height: activeItem.offsetHeight,
				visible: true,
			})
		}

		updateIndicator()
		window.addEventListener('resize', updateIndicator)

		return () => window.removeEventListener('resize', updateIndicator)
	}, [activeId])

	if (items.length === 0) return null

	return (
		<nav className="fixed flex h-full max-h-160 flex-col gap-2 p-1">
			{authors && <Authors authors={authors} />}

			<div className="mask-y-from-95% mask-y-to-100% relative flex-1 overflow-y-auto border-border-secondary/70 border-l pr-2 pl-4">
				<div
					className="absolute -left-px w-0.5 bg-border transition-all duration-300 ease-out will-change-[top,height,opacity]"
					style={{
						top: indicator.top,
						height: indicator.height,
						opacity: indicator.visible ? 1 : 0,
					}}
				/>

				<ul>
					{items.map((item) => (
						<li key={item.id}>
							<Link
								className={cn(
									'block py-1 font-semibold text-sm transition-colors hover:text-text-accent',
									item.level === 3 && 'pl-4',
									item.level === 4 && 'pl-8',
									activeId === item.id &&
										'font-bold text-border'
								)}
								href={`#${item.id}`}
								ref={(el) => {
									itemRefs.current[item.id] = el
								}}
							>
								{item.title}
							</Link>
						</li>
					))}
				</ul>
			</div>

			<Link
				className="flex items-center gap-2 transition-colors hover:text-text-accent"
				href={`https://github.com/oarer/stalhub/wiki/${slug}.mdx`}
			>
				<Icon icon="meteor-icons:github" />
				<p className="font-semibold">{t('wiki.edit')}</p>
			</Link>
		</nav>
	)
}
