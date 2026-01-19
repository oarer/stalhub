'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import type React from 'react'
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import useClickOutside from '@/hooks/useClickOutside'
import { cn } from '@/lib/cn'
import type {
	DropdownMenuItemProps,
	DropdownProps,
	SubmenuWithStateProps,
} from '@/types/ui/dropdown.type'

const baseClasses =
	'absolute z-999 min-w-[250px] bg-background/95 ring-2 backdrop-blur-xl ring-border/50 rounded-lg shadow-lg p-2'

const toggleSubmenuKey = (
	setOpenSubmenus: React.Dispatch<React.SetStateAction<Set<string>>>,
	key: string
) => {
	setOpenSubmenus((prev) => {
		if (!key) return prev

		const newSet = new Set(prev)
		const level = key.split('.').length

		if (!newSet.has(key)) {
			for (const k of newSet) {
				if (
					k.split('.').length === level &&
					!k.startsWith(key) &&
					!key.startsWith(k)
				) {
					newSet.delete(k)
				}
			}
			newSet.add(key)
		} else {
			for (const k of newSet) {
				if (k === key || k.startsWith(key + '.')) {
					newSet.delete(k)
				}
			}
		}
		return newSet
	})
}

function DropdownMenuItem({
	item,
	onClose,
	openSubmenus = new Set(),
	setOpenSubmenus,
	depth = 0,
}: DropdownMenuItemProps) {
	const itemRef = useRef<HTMLButtonElement | null>(null)
	const { t } = useTranslation()

	const showSubmenu = useMemo(
		() => openSubmenus.has(item.key),
		[openSubmenus, item.key]
	)
	const hasSubmenu = useMemo(
		() => Boolean(item.submenu?.length),
		[item.submenu]
	)

	const handleClick = useCallback(() => {
		if (item.disabled) return

		if (hasSubmenu && setOpenSubmenus) {
			toggleSubmenuKey(setOpenSubmenus, item.key)
		} else {
			item.onClick?.()
			onClose()
		}
	}, [item, onClose, setOpenSubmenus, hasSubmenu])

	if (item.divider) {
		return <div className="bg-background my-1 h-px" />
	}

	return (
		<div className="relative">
			{item.category && (
				<p className="text-[13px] font-semibold dark:text-neutral-300">
					{t(item.category)}
				</p>
			)}
			<motion.button
				aria-expanded={hasSubmenu ? showSubmenu : undefined}
				aria-haspopup={hasSubmenu ? 'menu' : undefined}
				className={cn(
					'flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-sm transition-colors',
					item.disabled
						? 'cursor-not-allowed text-neutral-400 dark:text-neutral-500'
						: 'cursor-pointer text-neutral-700 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-700/40',
					hasSubmenu && 'pr-2'
				)}
				disabled={item.disabled}
				onClick={handleClick}
				ref={itemRef}
				role="menuitem"
				type="button"
			>
				<div className="flex flex-1 items-center gap-2">
					{item.icon && (
						<Icon
							aria-hidden="true"
							className="text-xl text-neutral-500 dark:text-white"
							icon={item.icon}
						/>
					)}
					<div className="flex flex-col">
						<span className="text-[13.5px] leading-tight font-semibold">
							{t(item.label)}
						</span>
						{item.description && (
							<span className="mt-0.5 text-xs leading-tight font-semibold text-neutral-500 dark:text-neutral-400">
								{t(item.description)}
							</span>
						)}
					</div>
				</div>
				{hasSubmenu && (
					<motion.div
						animate={{ rotate: showSubmenu ? 90 : 0 }}
						transition={{ duration: 0.2, ease: 'easeInOut' }}
					>
						<Icon
							aria-hidden="true"
							className="text-[16px] text-neutral-500 dark:text-white"
							icon="lucide:chevron-right"
						/>
					</motion.div>
				)}
			</motion.button>

			<AnimatePresence>
				{showSubmenu && item.submenu && (
					<SubmenuWithState
						depth={depth + 1}
						items={item.submenu}
						onClose={onClose}
						openSubmenus={openSubmenus}
						parentKey={item.key}
						parentRef={itemRef}
						setOpenSubmenus={setOpenSubmenus}
					/>
				)}
			</AnimatePresence>
		</div>
	)
}

function SubmenuWithState({
	items,
	parentRef,
	onClose,
	parentKey,
	openSubmenus,
	setOpenSubmenus,
	depth = 1,
}: SubmenuWithStateProps) {
	const submenuRef = useRef<HTMLDivElement | null>(null)
	const [position, setPosition] = useState({ top: 0, left: 0 })

	const itemsWithKeys = useMemo(
		() =>
			items.map((item) => ({
				...item,
				key: `${parentKey}.${item.key}`,
			})),
		[items, parentKey]
	)

	const updatePosition = useCallback(() => {
		if (!parentRef.current || !submenuRef.current) return

		const parentRect = parentRef.current.getBoundingClientRect()
		const submenuRect = submenuRef.current.getBoundingClientRect()

		const offsetParent = submenuRef.current.offsetParent as Element | null
		const offsetParentRect = offsetParent
			? offsetParent.getBoundingClientRect()
			: {
					left: 0,
					top: 0,
					width: window.innerWidth,
					height: window.innerHeight,
				}

		let left = parentRect.right - offsetParentRect.left + 18
		let top = parentRect.top - offsetParentRect.top

		if (
			left + submenuRect.width >
			offsetParentRect.left + offsetParentRect.width
		) {
			left = Math.max(
				8,
				parentRect.left - offsetParentRect.left - submenuRect.width - 4
			)
		}

		if (
			top + submenuRect.height >
			offsetParentRect.top + offsetParentRect.height
		) {
			top = Math.max(8, offsetParentRect.height - submenuRect.height - 8)
		}

		setPosition({ top, left })
	}, [parentRef])

	useLayoutEffect(() => {
		if (!parentRef.current || !submenuRef.current) return

		updatePosition()

		const handleResize = () => updatePosition()
		const handleScroll = () => updatePosition()

		window.addEventListener('resize', handleResize)
		window.addEventListener('scroll', handleScroll, true)

		let ro: ResizeObserver | null = null
		try {
			ro = new ResizeObserver(updatePosition)
			ro.observe(submenuRef.current)
			if (parentRef.current instanceof Element) {
				ro.observe(parentRef.current)
			}
		} catch (error) {
			console.warn('ResizeObserver not supported:', error)
		}

		return () => {
			window.removeEventListener('resize', handleResize)
			window.removeEventListener('scroll', handleScroll, true)
			ro?.disconnect()
		}
	}, [updatePosition, parentRef])

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className={baseClasses}
			data-submenu
			exit={{ opacity: 0 }}
			initial={{ opacity: 0 }}
			ref={submenuRef}
			role="menu"
			style={{
				top: `${position.top}px`,
				left: `${position.left}px`,
				zIndex: Math.min(50 + depth, 9999),
			}}
			transition={{ duration: 0.15, ease: 'easeOut' }}
		>
			{itemsWithKeys.map((item) => (
				<DropdownMenuItem
					depth={depth}
					isSubmenuItem
					item={item}
					key={item.key}
					onClose={onClose}
					openSubmenus={openSubmenus}
					setOpenSubmenus={setOpenSubmenus}
				/>
			))}
		</motion.div>
	)
}

export default function DropdownMenu({
	title,
	items,
	icon,
	placement = 'bottom-start',
	className,
}: DropdownProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set())
	const dropdownRef = useRef<HTMLDivElement | null>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const { t } = useTranslation()

	const toggleDropdown = useCallback(() => {
		setIsOpen((prev) => {
			const next = !prev
			if (!next) setOpenSubmenus(new Set())
			return next
		})
	}, [])

	const closeDropdown = useCallback(() => {
		setIsOpen(false)
		setOpenSubmenus(new Set())
	}, [])

	useClickOutside(dropdownRef, closeDropdown)

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closeDropdown()
			}
		}

		if (isOpen) {
			document.addEventListener('keydown', handleEscape)
			return () => document.removeEventListener('keydown', handleEscape)
		}
	}, [isOpen, closeDropdown])

	const dropdownPositionClass = useMemo(() => {
		const positionMap = {
			'bottom-start': `${baseClasses} top-full left-0 mt-3`,
			'bottom-end': `${baseClasses} top-full right-0 mt-3`,
			'top-start': `${baseClasses} bottom-full left-0 mb-3`,
			'top-end': `${baseClasses} bottom-full right-0 mb-3`,
		}

		return positionMap[placement] || positionMap['bottom-start']
	}, [placement])

	return (
		<div className={cn('relative', className)} ref={dropdownRef}>
			<Button
				aria-expanded={isOpen}
				aria-haspopup="menu"
				className={`flex cursor-pointer items-center outline-none ${
					isOpen ? 'bg-background' : ''
				}`}
				onClick={toggleDropdown}
				ref={triggerRef}
				role="button"
				tabIndex={0}
				variant="outline"
			>
				{icon && <Icon className="text-xl" icon={icon} />}
				<p className="text-md font-semibold">{t(title)}</p>
				<motion.div
					animate={{ rotate: isOpen ? 90 : 0 }}
					transition={{ duration: 0.2, ease: 'easeInOut' }}
				>
					<Icon
						aria-hidden="true"
						className="text-lg text-neutral-500 dark:text-white"
						icon="lucide:chevron-right"
					/>
				</motion.div>
			</Button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						animate={{ opacity: 1 }}
						className={dropdownPositionClass}
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						role="menu"
						transition={{ duration: 0.15, ease: 'easeOut' }}
					>
						{items.map((item) => (
							<DropdownMenuItem
								depth={1}
								item={item}
								key={item.key}
								onClose={closeDropdown}
								openSubmenus={openSubmenus}
								setOpenSubmenus={setOpenSubmenus}
							/>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
