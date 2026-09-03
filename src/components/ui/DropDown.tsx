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
	'absolute z-99999 min-w-[250px] flex flex-col gap-2 bg-card/95 ring-2 ring-primary/50 rounded-lg shadow-lg p-2'

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
				<p className="font-semibold text-[13px] text-muted-foreground">
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
					item.disabled && 'cursor-not-allowed text-muted-foreground',

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
							className="text-[16px] text-muted-foreground"
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
	compact = false,
	onlyIcon = false,
	mobileSheet = false,
}: DropdownProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set())
	const [dragY, setDragY] = useState(0)
	const dropdownRef = useRef<HTMLDivElement | null>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const sheetRef = useRef<HTMLDivElement>(null)
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
		setDragY(0)
	}, [])

	const handleSheetDrag = useCallback(
		(_: unknown, info: { offset: { y: number } }) => {
			setDragY(Math.max(0, info.offset.y))
		},
		[]
	)

	const handleSheetDragEnd = useCallback(
		(_: unknown, info: { offset: { y: number } }) => {
			const height = sheetRef.current?.offsetHeight ?? 400
			if (info.offset.y > Math.max(120, height * 0.25)) {
				closeDropdown()
			} else {
				setDragY(0)
			}
		},
		[closeDropdown]
	)

	useClickOutside(dropdownRef, closeDropdown)

	useEffect(() => {
		if (!mobileSheet || !isOpen) return
		const original = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = original
		}
	}, [mobileSheet, isOpen])

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
		<div className={cn('group relative')} ref={dropdownRef}>
			<Button
				aria-expanded={isOpen}
				aria-haspopup="menu"
				aria-label={onlyIcon ? t(title) : undefined}
				className={`group/btn flex items-center justify-center rounded-full outline-none transition-all duration-300 ${
					onlyIcon
						? 'h-10 px-2.5'
						: compact
							? 'gap-2 px-3.5 py-2 xl:gap-4 xl:px-6'
							: 'gap-4 px-6 py-2'
				} ${className} ${isOpen ? 'bg-card' : ''}`}
				onClick={toggleDropdown}
				ref={triggerRef}
				role="button"
				tabIndex={0}
				variant={variant}
			>
				{icon && <Icon className="text-xl" icon={icon} />}
				{onlyIcon ? (
					<span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/btn:ml-2 group-hover/btn:max-w-45 group-hover/btn:opacity-100">
						<span className="font-semibold text-md">
							{t(title)}
						</span>
					</span>
				) : (
					<>
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
					</>
				)}
			</Button>

			<AnimatePresence>
				{isOpen && (
					<>
						<motion.div
							animate={{ opacity: 1 }}
							className={cn(dropdownPositionClass, {
								'backdrop-blur-xl': blur,
								'hidden sm:block': mobileSheet,
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

						{mobileSheet && (
							<>
								<motion.div
									animate={{
										opacity: 1 - Math.min(1, dragY / 300),
									}}
									aria-hidden="true"
									className="fixed inset-0 z-[60] bg-black/60 sm:hidden"
									exit={{ opacity: 0 }}
									initial={{ opacity: 0 }}
									onClick={closeDropdown}
									transition={{
										duration: 0.2,
										ease: 'easeOut',
									}}
								/>
								<motion.div
									animate={{ opacity: 1, y: 0 }}
									className={cn(
										'fixed inset-x-0 bottom-0 z-[70] flex max-h-[80dvh] flex-col gap-1 rounded-t-2xl bg-card p-3 shadow-lg ring-2 ring-primary/40 sm:hidden',
										dragY > 0 && 'cursor-grabbing'
									)}
									drag="y"
									dragConstraints={{ top: 0, bottom: 0 }}
									dragElastic={{ top: 0, bottom: 0.5 }}
									exit={{ opacity: 0, y: 40 }}
									initial={{ opacity: 0, y: 40 }}
									onDrag={(event, info) =>
										handleSheetDrag(event, info)
									}
									onDragEnd={(event, info) =>
										handleSheetDragEnd(event, info)
									}
									role="menu"
									transition={{ duration: 0.2, ease: 'easeOut' }}
								>
									<div
										className="flex shrink-0 cursor-grab touch-none flex-col items-center gap-2 px-4 py-1.5"
										ref={sheetRef}
									>
										<div className="h-1.5 w-12 rounded-full bg-neutral-600" />
									</div>
									<div className="flex shrink-0 items-center justify-between gap-2 px-1 pb-1">
										<p className="font-semibold text-sm">
											{t(title)}
										</p>
										<button
											className="cursor-pointer p-1 text-neutral-400 transition-colors hover:text-neutral-200"
											onClick={closeDropdown}
											type="button"
										>
											<Icon icon="lucide:x" />
										</button>
									</div>
									<div className="min-h-0 flex-1 overflow-y-auto px-1">
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
									</div>
								</motion.div>
							</>
						)}
					</>
				)}
			</AnimatePresence>
		</div>
	)
}
