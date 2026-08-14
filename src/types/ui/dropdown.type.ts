import type React from 'react'
import type { ButtonVariant } from '@/constants/ui/button.const'

export interface DropdownItem {
	key: string
	content: string | React.ReactNode
	disabled?: boolean
	divider?: boolean
	submenu?: DropdownItem[]
	category?: string | React.ReactNode
}

export interface DropdownProps {
	title: string
	icon?: string
	items: DropdownItem[]
	placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
	className?: string
	variant?: ButtonVariant
	blur?: boolean
	compact?: boolean
	onlyIcon?: boolean
}

export interface DropdownMenuItemProps {
	item: DropdownItem
	onClose: () => void
	isSubmenuItem?: boolean
	openSubmenus?: Set<string>
	setOpenSubmenus?: React.Dispatch<React.SetStateAction<Set<string>>>
	depth?: number
}

export interface SubmenuWithStateProps {
	items: DropdownItem[]
	parentRef: React.RefObject<HTMLElement | null>
	onClose: () => void
	parentKey: string
	openSubmenus: Set<string>
	setOpenSubmenus?: React.Dispatch<React.SetStateAction<Set<string>>>
	depth?: number
}

export interface DropdownMenuGroup {
	key: string
	title: string
	icon?: string
	items: DropdownItem[]
}
