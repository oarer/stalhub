'use client'

import { Icon } from '@iconify/react'
import type { VariantProps } from 'class-variance-authority'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { montserrat } from '@/app/fonts'
import { checkboxVariants } from '@/constants/ui/checkBox.const'
import { cn } from '@/lib/cn'

export interface ICheckboxProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
		VariantProps<typeof checkboxVariants> {
	checked?: boolean
	defaultChecked?: boolean
	onCheckedChange?: (checked: boolean) => void
	label?: string
	description?: string
	filled?: boolean
	required?: boolean
	showCheckmark?: boolean
}

function CheckBox({
	checked: controlledChecked,
	defaultChecked = false,
	onCheckedChange,
	disabled = false,
	id,
	name,
	value,
	required = false,
	className,
	label,
	description,
	size,
	variant,
	filled,
	showCheckmark = true,
	...props
}: ICheckboxProps) {
	const [internalChecked, setInternalChecked] = useState(defaultChecked)
	const isControlled = controlledChecked !== undefined
	const checked = isControlled ? controlledChecked : internalChecked

	const shouldFill = typeof filled === 'boolean' ? filled : size === 'xs'

	const handleToggle = () => {
		if (disabled) return

		const newChecked = !checked

		if (!isControlled) {
			setInternalChecked(newChecked)
		}

		onCheckedChange?.(newChecked)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault()
			handleToggle()
		}
	}

	const iconSizes = {
		xs: 'h-2 w-2',
		sm: 'h-2.5 w-2.5',
		md: 'text-base',
		lg: 'text-lg',
	}

	const checkboxElement = (
		<button
			className={cn(
				checkboxVariants({ size, variant }),
				checked &&
					shouldFill &&
					'border-black bg-black hover:bg-black/40 dark:border-white dark:bg-white dark:hover:bg-white/60',
				disabled && 'cursor-not-allowed opacity-50',
				!disabled && 'cursor-pointer',
				className
			)}
			data-checked={checked}
			disabled={disabled}
			id={id}
			onClick={handleToggle}
			onKeyDown={handleKeyDown}
			type="button"
			{...props}
		>
			{showCheckmark && (
				<AnimatePresence mode="wait">
					{checked && (
						<motion.div
							animate={{ scale: 1, opacity: 1 }}
							className="flex items-center justify-center leading-none"
							exit={{ scale: 0, opacity: 0 }}
							initial={{ scale: 0, opacity: 0 }}
							key="check"
							transition={{
								type: 'spring',
								stiffness: 500,
								damping: 30,
							}}
						>
							<Icon
								className={cn('block', iconSizes[size || 'md'])}
								icon="mdi:check"
							/>
						</motion.div>
					)}
				</AnimatePresence>
			)}

			{name && (
				<input
					checked={checked}
					className="absolute h-0 w-0 opacity-0"
					name={name}
					required={required}
					tabIndex={-1}
					type="checkbox"
					value={value}
				/>
			)}
		</button>
	)

	if (label || description) {
		return (
			<div className="flex items-center gap-3">
				{checkboxElement}
				<div
					className="flex flex-col gap-1"
					onClick={!disabled ? handleToggle : undefined}
				>
					{label && (
						<label
							className={cn(
								montserrat.className,
								'cursor-pointer select-none font-semibold text-sm',
								disabled && 'cursor-not-allowed opacity-50'
							)}
							htmlFor={id}
						>
							{label}
						</label>
					)}
					{description && (
						<p className={`${montserrat.className} text-xs`}>
							{description}
						</p>
					)}
				</div>
			</div>
		)
	}

	return checkboxElement
}

export { CheckBox }
