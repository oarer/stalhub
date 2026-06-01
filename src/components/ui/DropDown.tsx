'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import type React from 'react'
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { Button } from '@/components/ui/Button'
import useClickOutside from '@/hooks/useClickOutside'
import { cn } from '@/lib/cn'
import type {
	DropdownMenuItemProps,
	DropdownProps,
	SubmenuWithStateProps,
} from '@/types/ui/dropdown.type'
import { Divider } from './Divider'

const baseClasses =
	'absolute z-99999 min-w-[250px] flex flex-col gap-2 bg-background/95 ring-2 ring-border/50 rounded-lg shadow-lg p-2'

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

function renderMaybeTranslate(
	t: (key: string) => string,
	content?: string | React.ReactNode
) {
	if (content === undefined || content === null) return null
	return typeof content === 'string' ? t(content) : content
}

function DropdownMenuItem({
	item,
	onClose,
	openSubmenus = new Set(),
	setOpenSubmenus,
	depth = 0,
}: DropdownMenuItemProps) {
	const itemRef = useRef<HTMLDivElement | null>(null)
	const t = useTranslations()

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
			onClose()
		}
	}, [item, onClose, setOpenSubmenus, hasSubmenu])

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (item.disabled) return
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				handleClick()
			}
		},
		[item.disabled, handleClick]
	)

	if (item.divider) {
		return <Divider className="my-2" />
	}

	return (
		<div className="relative">
			{item.category && (
				<p className="font-semibold text-[13px] dark:text-neutral-300">
					{renderMaybeTranslate(t, item.category)}
				</p>
			)}
			<motion.div
				animate={{ opacity: 1 }}
				aria-disabled={item.disabled || undefined}
				aria-expanded={hasSubmenu ? showSubmenu : undefined}
				aria-haspopup={hasSubmenu ? 'menu' : undefined}
				className={cn(
					'flex w-full items-center justify-between rounded-xl text-left font-semibold text-sm transition-colors',
					item.disabled &&
						'cursor-not-allowed text-neutral-400 dark:text-neutral-500',

					hasSubmenu && 'pr-2'
				)}
				exit={{ opacity: 0 }}
				initial={{ opacity: 0 }}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				ref={itemRef}
				role="menuitem"
				tabIndex={item.disabled ? -1 : 0}
			>
				{item.content}

				{hasSubmenu && (
					<motion.div
						animate={{ rotate: showSubmenu ? 90 : 0 }}
						className="cursor-pointer"
						transition={{ duration: 0.2, ease: 'easeInOut' }}
					>
						<Icon
							aria-hidden="true"
							className="text-[16px] text-neutral-500 dark:text-white"
							icon="lucide:chevron-right"
						/>
					</motion.div>
				)}
			</motion.div>

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
	variant = 'ghost',
	blur = true,
}: DropdownProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set())
	const dropdownRef = useRef<HTMLDivElement | null>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const t = useTranslations()

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
		<div className={cn('relative')} ref={dropdownRef}>
			<Button
				aria-expanded={isOpen}
				aria-haspopup="menu"
				className={`flex items-center gap-4 rounded-full px-6 py-2 outline-none ${className} ${
					isOpen ? 'bg-background' : ''
				}`}
				onClick={toggleDropdown}
				ref={triggerRef}
				role="button"
				tabIndex={0}
				variant={variant}
			>
				{icon && <Icon className="text-xl" icon={icon} />}
				<p className="font-semibold text-md">{t(title)}</p>
				<motion.div
					animate={{ rotate: isOpen ? 90 : 0 }}
					transition={{ duration: 0.2, ease: 'easeInOut' }}
				>
					<Icon
						aria-hidden="true"
						className="text-lg"
						icon="lucide:chevron-right"
					/>
				</motion.div>
			</Button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						animate={{ opacity: 1 }}
						className={cn(dropdownPositionClass, {
							'backdrop-blur-xl': blur,
						})}
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
