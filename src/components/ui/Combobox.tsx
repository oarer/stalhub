'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

export interface ComboboxOption {
	value: string
	label: string
	disabled?: boolean
}

interface ComboboxBaseProps {
	options: ComboboxOption[]
	placeholder?: string
	searchPlaceholder?: string
	emptyText?: string
	className?: string
	disabled?: boolean
}

interface ComboboxSingleProps extends ComboboxBaseProps {
	multiple?: false
	value?: string
	onValueChange?: (value: string) => void
}

interface ComboboxMultipleProps extends ComboboxBaseProps {
	multiple: true
	values?: string[]
	onValuesChange?: (values: string[]) => void
	maxSelected?: number
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

const dropdownVariants = {
	hidden: { opacity: 0, scale: 0.98, y: -6 },
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			duration: 0.16,
			staggerChildren: 0.03,
		},
	},
}

const listVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { staggerChildren: 0.02 } },
}

const itemVariants = {
	hidden: { opacity: 0, y: -6 },
	visible: { opacity: 1, y: 0 },
}

export function Combobox(props: ComboboxProps) {
	const {
		options,
		placeholder = 'ui.combobox.default.placeholder',
		searchPlaceholder = 'ui.combobox.default.search.button',
		emptyText = 'ui.combobox.default.search.notFound',
		className,
		disabled = false,
	} = props

	const isMultiple = props.multiple === true
	const maxSelected = isMultiple ? props.maxSelected : undefined

	const selectedSet = useMemo(() => {
		if (props.multiple) {
			return new Set(props.values ?? [])
		}

		return props.value ? new Set([props.value]) : new Set()
	}, [props])

	const t = useTranslations()

	const [open, setOpen] = useState(false)
	const [search, setSearch] = useState('')
	const [highlightedIndex, setHighlightedIndex] = useState(0)

	const triggerRef = useRef<HTMLButtonElement>(null)
	const listboxRef = useRef<HTMLUListElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const wrapperRef = useRef<HTMLDivElement>(null)

	const filtered = useMemo(() => {
		if (!search) return options
		const lower = search.toLowerCase()
		return options.filter((o) => o.label.toLowerCase().includes(lower))
	}, [options, search])

	const selectedCount = isMultiple
		? (props.values?.length ?? 0)
		: selectedSet.size
	const maxReached =
		isMultiple &&
		typeof maxSelected === 'number' &&
		selectedCount >= maxSelected

	useEffect(() => {
		setHighlightedIndex(0)
	}, [])

	useEffect(() => {
		if (open) {
			requestAnimationFrame(() => {
				inputRef.current?.focus()
			})
		} else {
			setSearch('')
		}
	}, [open])

	useEffect(() => {
		if (!open) return
		function handleClick(e: MouseEvent) {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(e.target as Node)
			) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClick)
		return () => document.removeEventListener('mousedown', handleClick)
	}, [open])

	useEffect(() => {
		if (!open) return
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				setOpen(false)
				triggerRef.current?.focus()
			}
		}
		document.addEventListener('keydown', handleKey)
		return () => document.removeEventListener('keydown', handleKey)
	}, [open])

	const select = useCallback(
		(optionValue: string) => {
			if (props.multiple) {
				const current = new Set(props.values ?? [])
				const isAdding = !current.has(optionValue)

				if (isAdding && maxReached) {
					return
				}

				if (current.has(optionValue)) {
					current.delete(optionValue)
				} else {
					current.add(optionValue)
				}

				props.onValuesChange?.(Array.from(current))
				return
			}

			props.onValueChange?.(
				optionValue === props.value ? '' : optionValue
			)

			setOpen(false)
			triggerRef.current?.focus()
		},
		[props, maxReached]
	)

	const removeTag = useCallback(
		(val: string) => {
			if (!props.multiple) return

			props.onValuesChange?.(
				(props.values ?? []).filter((v) => v !== val)
			)
		},
		[props]
	)

	const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				if (!open) return

				switch (e.key) {
					case 'ArrowDown':
						e.preventDefault()
						setHighlightedIndex((prev) =>
							prev + 1 >= filtered.length ? 0 : prev + 1
						)
						break

					case 'ArrowUp':
						e.preventDefault()
						setHighlightedIndex((prev) =>
							prev - 1 < 0 ? filtered.length - 1 : prev - 1
						)
						break

					case 'Enter':
						e.preventDefault()
						const item = filtered[highlightedIndex]
						if (item && !item.disabled) {
							select(item.value)
						}
						break

					case 'Home':
						e.preventDefault()
						setHighlightedIndex(0)
						break

					case 'End':
						e.preventDefault()
						setHighlightedIndex(filtered.length - 1)
						break
				}
			},
			[open, filtered, highlightedIndex, select]
		)

	useEffect(() => {
		if (!open || !listboxRef.current) return
		const item = listboxRef.current.children[highlightedIndex] as
			| HTMLElement
			| undefined
		item?.scrollIntoView({ block: 'nearest' })
	}, [highlightedIndex, open])

	const selectedLabels = options.filter((o) => selectedSet.has(o.value))
	const hasSelection = selectedLabels.length > 0

	return (
		<div className={cn('relative w-full', className)} ref={wrapperRef}>
			<button
				className={cn(
					'flex w-full cursor-pointer items-center justify-between rounded-lg border-2 border-border/40 bg-background px-3 py-2 font-semibold text-sm',
					isMultiple ? 'min-h-10' : 'h-11.5'
				)}
				disabled={disabled}
				onClick={() => setOpen((prev) => !prev)}
				ref={triggerRef}
				type="button"
			>
				{isMultiple ? (
					<div className="flex flex-wrap gap-1">
						{hasSelection ? (
							selectedLabels.map((opt) => (
								<div
									className="flex max-w-20 items-center gap-1 rounded bg-neutral-600/40 px-1.5 py-0.5 text-xs"
									key={opt.value}
								>
									<p className="truncate">{opt.label}</p>
									<span
										className="cursor-pointer"
										onClick={(e) => {
											e.stopPropagation()
											removeTag(opt.value)
										}}
									>
										<Icon icon="lucide:x" />
									</span>
								</div>
							))
						) : (
							<span>{t(placeholder)}</span>
						)}
					</div>
				) : (
					<span className="truncate">
						{t(
							hasSelection ? selectedLabels[0].label : placeholder
						)}
					</span>
				)}

				<Icon
					className={cn('transition-transform', open && 'rotate-90')}
					icon="lucide:chevron-right"
				/>
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						animate="visible"
						className="absolute top-full left-1/2 z-99 mt-2 min-w-30 -translate-x-1/2 rounded-lg border-2 border-border/40 bg-background shadow-md"
						exit="hidden"
						initial="hidden"
						variants={dropdownVariants}
					>
						<div className="flex items-center gap-2 border-border/40 border-b-2 px-3 py-2">
							<Icon icon="lucide:search" />
							<input
								className="w-full bg-transparent font-bold outline-none"
								onChange={(e) => setSearch(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder={t(searchPlaceholder)}
								ref={inputRef}
								value={search}
							/>
						</div>

						{filtered.length === 0 ? (
							<div className="px-3 py-6 text-center text-sm">
								{t(emptyText)}
							</div>
						) : (
							<motion.ul
								animate="visible"
								className="max-h-60 overflow-y-auto p-1"
								exit="hidden"
								initial="hidden"
								ref={listboxRef}
								variants={listVariants}
							>
								{filtered.map((option) => {
									const isSelected = selectedSet.has(
										option.value
									)

									const optionDisabled =
										option.disabled ||
										(maxReached && !isSelected)

									return (
										<motion.li
											className={cn(
												'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 font-semibold text-sm transition-colors hover:bg-neutral-800/50',
												optionDisabled &&
													'cursor-not-allowed opacity-50 dark:text-neutral-500'
											)}
											key={option.value}
											onClick={() => {
												if (!optionDisabled)
													select(option.value)
											}}
											variants={itemVariants}
										>
											<Icon
												className={cn(
													'h-4 w-4',
													!isSelected && 'invisible'
												)}
												icon="lucide:check"
											/>

											<span className="truncate">
												{t(option.label)}
											</span>
										</motion.li>
									)
								})}
							</motion.ul>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
