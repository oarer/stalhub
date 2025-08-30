import type React from 'react'

export interface AccordionItem {
    key: string
    title: string
    content: React.ReactNode
    disabled?: boolean
    icon?: string
    color?:
        | 'primary'
        | 'secondary'
        | 'accent'
        | 'success'
        | 'warning'
        | 'danger'
}

export interface AccordionProps {
    items: AccordionItem[]
    variant?:
        | 'default'
        | 'bordered'
        | 'splitted'
        | 'shadow'
        | 'gradient'
        | 'minimal'
        | 'colorful'
    selectionMode?: 'single' | 'multiple'
    defaultExpandedKeys?: string[]
    className?: string
    size?: 'sm' | 'md' | 'lg'
    onSelectionChange?: (keys: string[]) => void
}
