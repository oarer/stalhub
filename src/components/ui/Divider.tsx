'use client'

import { cn } from '@/lib/cn'

const ORIENTATIONS = ['horizontal', 'vertical'] as const
type Orientation = (typeof ORIENTATIONS)[number]

interface SeparatorProps {
	orientation?: Orientation
	decorative?: boolean
	className?: string
}

const Divider = ({
	className,
	orientation = 'horizontal',
	...props
}: SeparatorProps) => {
	return (
		<div
			className={cn(
				'bg-muted shrink-0',
				'data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full',
				'data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch',
				className
			)}
			data-orientation={orientation}
			data-slot="divider"
			{...props}
		/>
	)
}

export { Divider }
