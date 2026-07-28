import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'
import { PRESET_COLORS } from '../../types'

interface StyleControlsProps {
	color: string
	lineWidth: number
	onColorChange: (color: string) => void
	onLineWidthChange: (width: number) => void
}

export function StyleControls({
	color,
	lineWidth,
	onColorChange,
	onLineWidthChange,
}: StyleControlsProps) {
	const t = useTranslations()

	return (
		<>
			<div className="flex gap-1.5">
				{PRESET_COLORS.map((c) => (
					<button
						className={cn(
							'h-6 w-6 cursor-pointer rounded-full border-2 transition-transform hover:scale-110',
							color === c
								? 'scale-110 border-sky-400'
								: 'border-neutral-300 dark:border-neutral-600'
						)}
						key={c}
						onClick={() => onColorChange(c)}
						style={{ backgroundColor: c }}
					/>
				))}
				<label className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-neutral-400 border-dashed dark:border-neutral-600">
					<Icon
						className="text-neutral-500 text-xs"
						icon="lucide:plus"
					/>
					<input
						className="absolute inset-0 cursor-pointer opacity-0"
						onChange={(e) => onColorChange(e.target.value)}
						type="color"
						value={color}
					/>
				</label>
			</div>
			<p className="font-semibold text-neutral-500 text-xs dark:text-neutral-400">
				{t('cwMap.style.thickness')} {lineWidth}px
			</p>
			<input
				className="w-full cursor-pointer accent-sky-500"
				max={20}
				min={1}
				onChange={(e) =>
					onLineWidthChange(parseInt(e.target.value, 10))
				}
				type="range"
				value={lineWidth}
			/>
		</>
	)
}
