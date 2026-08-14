'use client'

import type { VariantProps } from 'class-variance-authority'
import { motion } from 'motion/react'
import { forwardRef, useState } from 'react'
import {
	switchThumbVariants,
	switchTrackVariants,
} from '@/constants/ui/switch.const'
import { cn } from '@/lib/cn'

interface ISwitchProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
		VariantProps<typeof switchTrackVariants> {
	checked?: boolean
	defaultChecked?: boolean
	onCheckedChange?: (checked: boolean) => void
	label?: string
	required?: boolean
}

const thumbOffsets: Record<string, number> = {
	sm: 16,
	md: 20,
	lg: 28,
}

const Switch = forwardRef<HTMLButtonElement, ISwitchProps>(
	(
		{
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
			size = 'md',
			variant,
			...props
		},
	) => {
		const [internalChecked, setInternalChecked] = useState(defaultChecked)
		const isControlled = controlledChecked !== undefined
		const checked = isControlled ? controlledChecked : internalChecked

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

		const thumbOffset = thumbOffsets[size || 'md']

		const switchElement = (
			<button
				aria-checked={checked}
				aria-label={label}
				className={cn(
					switchTrackVariants({ size, variant }),
					disabled && 'cursor-not-allowed opacity-50',
					!disabled && 'cursor-pointer',
					className
				)}
				data-checked={checked}
				disabled={disabled}
				id={id}
				name={name}
				onClick={handleToggle}
				onKeyDown={handleKeyDown}
				role="switch"
				tabIndex={0}
				type="button"
				value={value}
				{...props}
			>
				<motion.div
					animate={{ x: checked ? thumbOffset : 0 }}
					className={switchThumbVariants({ size })}
				transition={{ duration: 0.2, ease: 'easeInOut' }}
				/>

				{name && (
					<input
						checked={checked}
						className="absolute h-0 w-0 opacity-0"
						name={name}
						readOnly
						required={required}
						tabIndex={-1}
						type="checkbox"
					/>
				)}
			</button>
		)

		if (label) {
			return (
				<div className="flex items-center gap-3">
					{switchElement}
					<label
						className={cn(
							'cursor-pointer select-none font-medium text-sm leading-none',
							disabled && 'cursor-not-allowed opacity-50'
						)}
						htmlFor={id}
						onClick={!disabled ? handleToggle : undefined}
					>
						{label}
					</label>
				</div>
			)
		}

		return switchElement
	}
)

export { Switch }
