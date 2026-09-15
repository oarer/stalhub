'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export type MapMode = 'view' | 'convert' | 'edit'

export const MAP_MODES: { value: MapMode; label: string; icon: string }[] = [
	{ value: 'view', label: 'Просмотр', icon: 'lucide:map' },
	{ value: 'convert', label: 'Конвертация', icon: 'lucide:move' },
	{ value: 'edit', label: 'Редактор меток', icon: 'lucide:edit' },
]

type MapModeTabsProps = {
	mode: MapMode
	onModeChange: (mode: MapMode) => void
	className?: string
	modes?: MapMode[]
}

export default function MapModeTabs({
	mode,
	onModeChange,
	className,
	modes = MAP_MODES.map((item) => item.value),
}: MapModeTabsProps) {
	const visible = MAP_MODES.filter((item) => modes.includes(item.value))
	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className={cn(
				'flex flex-col gap-1 border-primary/30 border-b-2 pb-3',
				className
			)}
			initial={{ opacity: 0, y: -10 }}
		>
			{visible.map((item) => (
				<Button
					className="flex w-full items-center justify-between gap-3"
					key={item.value}
					onClick={() => onModeChange(item.value)}
					size="sm"
					type="button"
					variant={mode === item.value ? 'primary' : 'secondary'}
				>
					<span className='font-bold'>{item.label}</span>
					<Icon className="text-lg" icon={item.icon} />
				</Button>
			))}
		</motion.div>
	)
}
