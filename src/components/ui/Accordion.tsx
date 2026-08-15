'use client'

import { Icon } from '@iconify/react'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import {
	accordionIndicatorVariants,
	accordionVariants,
} from '@/constants/ui/accordion.const'
import { cn } from '@/lib/cn'
import type { AccordionProps } from '@/types/ui/accordion.type'
import { Divider } from './Divider'

export function Accordion({
	items,
	variant = 'default',
	size = 'md',
	selectionMode = 'single',
	defaultExpandedKeys = [],
	className,
	titleClass,
	accordionClass,
	onSelectionChange,
}: AccordionProps) {
	const [expandedKeys, setExpandedKeys] =
		useState<string[]>(defaultExpandedKeys)
	const [heights, setHeights] = useState<Record<string, number>>({})
	const contentRefs = useRef<Record<string, HTMLDivElement | null>>({})
	const resizeObservers = useRef<Record<string, ResizeObserver | null>>({})

	const measure = useCallback((key: string) => {
		const el = contentRefs.current[key]
		if (!el) return
		const h = el.scrollHeight + 12
		setHeights((prev) => (prev[key] === h ? prev : { ...prev, [key]: h }))
	}, [])

	useLayoutEffect(() => {
		items.forEach((item) => {
			const key = item.key
			const el = contentRefs.current[key]

			if (resizeObservers.current[key]) {
				resizeObservers.current[key]?.disconnect()
				resizeObservers.current[key] = null
			}

			if (el && typeof ResizeObserver !== 'undefined') {
				const ro = new ResizeObserver(() => measure(key))
				ro.observe(el)
				resizeObservers.current[key] = ro
			}

			measure(key)
		})

		return () => {
			Object.values(resizeObservers.current).forEach((ro) =>
				ro?.disconnect()
			)
			resizeObservers.current = {}
		}
	}, [items, measure])

	const handleToggle = useCallback(
		(key: string) => {
			setExpandedKeys((prev) => {
				let newExpandedKeys: string[]
				if (selectionMode === 'single') {
					newExpandedKeys = prev.includes(key) ? [] : [key]
				} else {
					newExpandedKeys = prev.includes(key)
						? prev.filter((k) => k !== key)
						: [...prev, key]
				}
				onSelectionChange?.(newExpandedKeys)
				return newExpandedKeys
			})
		},
		[selectionMode, onSelectionChange]
	)

	const isExpanded = useCallback(
		(key: string) => expandedKeys.includes(key),
		[expandedKeys]
	)

	return (
		<div className={cn('flex flex-col', className)}>
			{items.map((item, index) => {
				const triggerId = `accordion-trigger-${item.key}`
				const contentId = `accordion-content-${item.key}`
				const expanded = isExpanded(item.key)

				return (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className={cn(
							accordionVariants({ variant, size }),
							item.disabled && 'cursor-not-allowed opacity-50',
							accordionClass
						)}
						initial={{ opacity: 0, y: 10 }}
						key={item.key}
						transition={{ delay: index * 0.05 }}
					>
						<button
							aria-controls={contentId}
							aria-expanded={expanded}
							className="flex w-full cursor-pointer items-center justify-between"
							disabled={item.disabled}
							id={triggerId}
							onClick={() =>
								!item.disabled && handleToggle(item.key)
							}
							type="button"
						>
							<div
								className={cn(
									'flex items-center gap-3 p-2',
									titleClass
								)}
							>
								{item.icon && (
									<Icon
										className="text-lg dark:text-neutral-100"
										icon={item.icon}
									/>
								)}
								<span className="font-semibold dark:text-neutral-100">
									{item.title}
								</span>
							</div>
							<motion.div
								animate={{ rotate: expanded ? -180 : -90 }}
								transition={{
									duration: 0.3,
									ease: 'easeInOut',
								}}
							>
								<Icon
									className={accordionIndicatorVariants({
										variant,
										size,
										rotated: expanded,
									})}
									icon="lucide:chevron-down"
								/>
							</motion.div>
						</button>
						<AnimatePresence initial={false}>
							<motion.div
								animate={{
									height: expanded
										? (heights[item.key] ?? 0)
										: 0,
									opacity: expanded ? 1 : 0,
								}}
								exit={{ height: 0, opacity: 0 }}
								id={contentId}
								initial={{ height: 0, opacity: 0 }}
								role="region"
								transition={{
									height: {
										duration: 0.28,
										ease: [0.04, 0.62, 0.23, 0.98],
									},
									opacity: {
										duration: 0.2,
										ease: 'easeInOut',
									},
								}}
							>
								<Divider className="mb-2" />
								<div
									className="flex flex-col gap-2"
									ref={(el) => {
										contentRefs.current[item.key] = el
										if (el) measure(item.key)
									}}
								>
									{item.content}
								</div>
							</motion.div>
						</AnimatePresence>
					</motion.div>
				)
			})}
		</div>
	)
}
