import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import type { InputHTMLAttributes } from 'react'
import { useId, useRef, useState } from 'react'
import { montserrat } from '@/app/fonts'
import { cn } from '@/lib/cn'

type Props = InputHTMLAttributes<HTMLInputElement> & {
	label?: string
}

export default function Input({
	className,
	type = 'text',
	value,
	onChange,
	onBlur,
	step,
	min,
	max,
	id: propId,
	placeholder: propPlaceholder,
	label,
	...rest
}: Props) {
	const [showPassword, setShowPassword] = useState(false)
	const inputRef = useRef<HTMLInputElement | null>(null)
	const reactId = useId()
	const id = propId ?? `floating_${reactId}`
	const t = useTranslations()

	const togglePassword = () => setShowPassword((s) => !s)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (type !== 'number') {
			onChange?.(e)
			return
		}

		onChange?.(e)
	}

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		if (type === 'number') {
			const raw = e.target.value

			if (raw !== '') {
				let normalized = String(Number(raw))

				if (min !== undefined)
					normalized = String(
						Math.max(Number(normalized), Number(min))
					)
				if (max !== undefined)
					normalized = String(
						Math.min(Number(normalized), Number(max))
					)

				if (normalized !== raw && inputRef.current) {
					inputRef.current.value = normalized
				}
			}
		}

		onBlur?.(e)
	}

	const handleStep = (direction: 'up' | 'down') => {
		if (!inputRef.current) return
		if (direction === 'up') inputRef.current.stepUp()
		else inputRef.current.stepDown()

		onChange?.({
			target: inputRef.current,
		} as React.ChangeEvent<HTMLInputElement>)
	}

	const computedPlaceholder = propPlaceholder ?? (label ? ' ' : undefined)

	return (
		<div className="relative">
			<input
				{...rest}
				className={cn(
					`peer w-full rounded-lg border-2 border-border-secondary bg-background px-2.5 py-1.5 font-semibold text-neutral-900 outline-none transition-all duration-500 ease-in-out placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-100 dark:placeholder:text-neutral-400`,
					label && 'pt-3',
					type === 'number' && `${montserrat.className} text-sm`,
					className
				)}
				id={id}
				max={max}
				min={min}
				onBlur={handleBlur}
				onChange={handleChange}
				placeholder={computedPlaceholder}
				ref={inputRef}
				step={step}
				type={type === 'password' && showPassword ? 'text' : type}
				value={value}
			/>

			{label && (
				<label
					className="pointer-events-none absolute inset-s-1 top-2 z-10 origin-left -translate-y-2.5 scale-75 transform px-2 font-bold text-neutral-400 text-sm duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-neutral-400 peer-focus:top-2 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-neutral-400"
					htmlFor={id}
				>
					{t(label)}
				</label>
			)}

			{type === 'number' && (
				<div className="absolute top-1/2 right-2 flex -translate-y-1/2 flex-col">
					<button
						aria-label="increase"
						className="flex cursor-pointer items-center justify-center text-neutral-500 duration-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
						onClick={() => handleStep('up')}
						type="button"
					>
						<Icon className="text-md" icon="lucide:chevron-up" />
					</button>
					<button
						aria-label="decrease"
						className="flex cursor-pointer items-center justify-center text-neutral-500 duration-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
						onClick={() => handleStep('down')}
						type="button"
					>
						<Icon className="text-md" icon="lucide:chevron-down" />
					</button>
				</div>
			)}

			{type === 'password' && (
				<button
					className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-neutral-500 hover:text-black dark:text-neutral-300 dark:hover:text-white"
					onClick={togglePassword}
					type="button"
				>
					<div className="relative h-5 w-5">
						<Icon
							className={`absolute inset-0 text-xl transition-opacity duration-300 ease-in-out ${
								showPassword ? 'opacity-0' : 'opacity-100'
							}`}
							icon="lucide:eye"
						/>
						<Icon
							className={`absolute inset-0 text-xl transition-opacity duration-300 ease-in-out ${
								showPassword ? 'opacity-100' : 'opacity-0'
							}`}
							icon="lucide:eye-off"
						/>
					</div>
				</button>
			)}
		</div>
	)
}
