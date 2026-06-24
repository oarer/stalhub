import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import type { InputHTMLAttributes } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import { montserrat } from '@/app/fonts'
import { cn } from '@/lib/cn'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
	label?: string
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
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
	const [draftValue, setDraftValue] = useState(String(value ?? ''))
	const inputRef = useRef<HTMLInputElement | null>(null)

	const lastValidValue = useRef(String(value ?? ''))

	const reactId = useId()
	const id = propId ?? `floating_${reactId}`
	const t = useTranslations()

	useEffect(() => {
		const v = String(value ?? '')
		setDraftValue(v)
		lastValidValue.current = v
	}, [value])

	const togglePassword = () => setShowPassword((s) => !s)

	const isValidNumber = (raw: string) => {
		if (raw === '') return true

		if (!/^-?\d*(\.\d*)?$/.test(raw)) return false

		const num = Number(raw)
		if (Number.isNaN(num)) return false

		if (min !== undefined && num < Number(min)) return false
		if (max !== undefined && num > Number(max)) return false

		return true
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value

		setDraftValue(raw)

		if (type === 'number') {
			if (!isValidNumber(raw)) return
			lastValidValue.current = raw
		} else {
			lastValidValue.current = raw
		}

		onChange?.(e)
	}

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		if (type === 'number') {
			const raw = e.target.value

			if (raw !== '') {
				let normalized = String(Number(raw))

				if (min !== undefined) {
					normalized = String(Math.max(Number(normalized), Number(min)))
				}

				if (max !== undefined) {
					normalized = String(Math.min(Number(normalized), Number(max)))
				}

				setDraftValue(normalized)
				lastValidValue.current = normalized

				onChange?.({
					...e,
					target: { ...e.target, value: normalized },
				} as React.ChangeEvent<HTMLInputElement>)
			}
		}

		onBlur?.(e)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			inputRef.current?.blur()
			return
		}

		if (e.key === 'Escape') {
			e.preventDefault()

			setDraftValue(lastValidValue.current)

			if (inputRef.current) {
				inputRef.current.value = lastValidValue.current
			}

			inputRef.current?.blur()
		}
	}

	const handleStep = (direction: 'up' | 'down') => {
		if (!inputRef.current) return

		if (direction === 'up') inputRef.current.stepUp()
		else inputRef.current.stepDown()

		const nextValue = inputRef.current.value

		setDraftValue(nextValue)
		lastValidValue.current = nextValue

		onChange?.({
			target: inputRef.current,
		} as React.ChangeEvent<HTMLInputElement>)
	}

	const computedPlaceholder = propPlaceholder ?? (label ? ' ' : undefined)

	return (
		<div className="relative">
			<input
				{...rest}
				ref={inputRef}
				id={id}
				type={type === 'password' && showPassword ? 'text' : type}
				value={draftValue}
				step={step}
				min={min}
				max={max}
				placeholder={computedPlaceholder}
				onChange={handleChange}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				className={cn(
					`peer w-full rounded-lg border-2 border-border-secondary bg-background px-2.5 py-1 font-semibold text-neutral-900 outline-none transition-all duration-500 ease-in-out placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-100 dark:placeholder:text-neutral-400`,
					label && 'pt-3',
					type === 'number' && `${montserrat.className} text-sm`,
					className
				)}
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
						type="button"
						aria-label="increase"
						onClick={() => handleStep('up')}
						className="flex cursor-pointer items-center justify-center text-neutral-500 duration-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
					>
						<Icon icon="lucide:chevron-up" />
					</button>

					<button
						type="button"
						aria-label="decrease"
						onClick={() => handleStep('down')}
						className="flex cursor-pointer items-center justify-center text-neutral-500 duration-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
					>
						<Icon icon="lucide:chevron-down" />
					</button>
				</div>
			)}

			{type === 'password' && (
				<button
					type="button"
					onClick={togglePassword}
					className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-neutral-500 hover:text-black dark:text-neutral-300 dark:hover:text-white"
				>
					<div className="relative h-5 w-5">
						<Icon
							icon="lucide:eye"
							className={`absolute inset-0 transition-opacity duration-300 ${showPassword ? 'opacity-0' : 'opacity-100'
								}`}
						/>
						<Icon
							icon="lucide:eye-off"
							className={`absolute inset-0 transition-opacity duration-300 ${showPassword ? 'opacity-100' : 'opacity-0'
								}`}
						/>
					</div>
				</button>
			)}
		</div>
	)
}