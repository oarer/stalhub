import type React from 'react'

export interface AccordionItem {
	key: string
	title: string
	content: React.ReactNode
	disabled?: boolean
	icon?: string
}

export interface AccordionProps {
	items: AccordionItem[]
	variant?: 'default' | 'warning' | 'danger' | 'success'
	selectionMode?: 'single' | 'multiple'
	defaultExpandedKeys?: string[]
	className?: string
	size?: 'sm' | 'md' | 'lg'
	onSelectionChange?: (keys: string[]) => void
}
