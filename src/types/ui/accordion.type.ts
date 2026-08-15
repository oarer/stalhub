import type { VariantProps } from 'class-variance-authority'
import type { accordionVariants } from '@/constants/ui/accordion.const'

export interface AccordionItem {
	key: string
	title: string
	content: React.ReactNode
	disabled?: boolean
	icon?: string
}

export interface AccordionProps {
	items: AccordionItem[]
	variant?: VariantProps<typeof accordionVariants>['variant']
	selectionMode?: 'single' | 'multiple'
	defaultExpandedKeys?: string[]
	className?: string
	titleClass?: string
	accordionClass?: string
	size?: 'sm' | 'md' | 'lg'
	onSelectionChange?: (keys: string[]) => void
}
