'use client'

import { Icon } from '@iconify/react'
import { useState } from 'react'
import { cn } from '@/lib/cn'

export function Stepper({
	value,
	onChange,
	min = 0,
	max = 9999,
	step = 1,
}: {
	value: number
	onChange: (v: number) => void
	min?: number
	max?: number
	step?: number
}) {
	return (
		<div className="flex items-center gap-1 rounded-lg bg-white/[0.06] px-1 py-1 ring-1 ring-white/10">
			<input
				className="w-full min-w-0 flex-1 bg-transparent px-2 font-mono text-[15px] outline-none"
				max={max}
				min={min}
				onChange={(e) =>
					onChange(
						Math.min(
							max,
							Math.max(min, Number(e.target.value) || 0)
						)
					)
				}
				type="number"
				value={value}
			/>
			<button
				className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
				onClick={() => onChange(Math.max(min, value - step))}
				type="button"
			>
				<Icon className="size-4" icon="lucide:minus" />
			</button>
			<button
				className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
				onClick={() => onChange(Math.min(max, value + step))}
				type="button"
			>
				<Icon className="size-4" icon="lucide:plus" />
			</button>
		</div>
	)
}

export function Segmented<T extends string | number>({
	options,
	value,
	onChange,
	columns,
}: {
	options: { value: T; label: string; sub?: string }[]
	value: T
	onChange: (v: T) => void
	columns?: number
}) {
	return (
		<div
			className="grid gap-2"
			style={columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined}
		>
			{options.map((o) => (
				<button
					className={cn(
						'rounded-lg px-2 py-2 text-center ring-1 transition-colors',
						value === o.value
							? 'bg-white/[0.12] ring-white/25'
							: 'bg-white/[0.04] ring-white/10 hover:bg-white/[0.08]'
					)}
					key={String(o.value)}
					onClick={() => onChange(o.value)}
					type="button"
				>
					<div className="font-semibold text-[13px]">{o.label}</div>
					{o.sub && (
						<div className="text-neutral-400 text-xs">{o.sub}</div>
					)}
				</button>
			))}
		</div>
	)
}

export function WeekdayPicker({
	value,
	onChange,
	labels,
}: {
	value: boolean[]
	onChange: (v: boolean[]) => void
	labels: string[]
}) {
	return (
		<div className="grid grid-cols-7 gap-1.5">
			{labels.map((label, i) => (
				<button
					className={cn(
						'rounded-lg py-2 font-semibold text-[13px] ring-1 transition-colors',
						value[i]
							? 'bg-white/[0.12] ring-white/25'
							: 'bg-white/[0.04] text-neutral-500 ring-white/10 hover:bg-white/[0.08]'
					)}
					key={label}
					onClick={() => {
						const next = [...value]
						next[i] = !next[i]
						onChange(next)
					}}
					type="button"
				>
					{label}
				</button>
			))}
		</div>
	)
}

export function DateField({
	value,
	onChange,
	min,
}: {
	value: string
	onChange: (v: string) => void
	min?: string
}) {
	return (
		<div className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2.5 ring-1 ring-white/10">
			<Icon className="size-4 shrink-0 text-neutral-400" icon="lucide:calendar" />
			<input
				className="w-full min-w-0 bg-transparent font-medium text-sm outline-none [color-scheme:dark]"
				min={min}
				onChange={(e) => e.target.value && onChange(e.target.value)}
				type="date"
				value={value}
			/>
		</div>
	)
}

export function Collapsible({
	title,
	sub,
	children,
	defaultOpen = true,
}: {
	title: string
	sub?: string
	children: React.ReactNode
	defaultOpen?: boolean
}) {
	const [open, setOpen] = useState(defaultOpen)
	return (
		<div className="flex flex-col gap-3">
			<button
				className="flex flex-col items-start gap-0.5 text-left"
				onClick={() => setOpen((v) => !v)}
				type="button"
			>
				<span className="flex items-center gap-1.5 font-semibold text-[15px]">
					<Icon
						className={cn('size-4 transition-transform', !open && '-rotate-90')}
						icon="lucide:chevron-down"
					/>
					{title}
				</span>
				{sub && (
					<span className="pl-6 text-neutral-400 text-[13px]">{sub}</span>
				)}
			</button>
			{open && <div className="flex flex-col gap-4">{children}</div>}
		</div>
	)
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="font-medium text-neutral-400 text-[13px]">{children}</div>
	)
}
