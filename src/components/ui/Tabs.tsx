'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

import { cn } from '@/lib/cn'

type TabsContextValue = {
	value: string
	onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
	defaultValue?: string
	value?: string
	onValueChange?: (value: string) => void
}

export function TabsRoot({
	defaultValue,
	value,
	onValueChange,
	className,
	children,
	...props
}: TabsProps) {
	const [internalValue, setInternalValue] = useState(defaultValue || '')

	const isControlled = value !== undefined
	const currentValue = isControlled ? (value as string) : internalValue

	const handleValueChange = useCallback(
		(newValue: string) => {
			if (!isControlled) {
				setInternalValue(newValue)
			}
			onValueChange?.(newValue)
		},
		[isControlled, onValueChange]
	)

	return (
		<TabsContext.Provider
			value={{ value: currentValue, onValueChange: handleValueChange }}
		>
			<div className={cn(className)} {...props}>
				{children}
			</div>
		</TabsContext.Provider>
	)
}

type TabsListProps = React.HTMLAttributes<HTMLDivElement>

export function TabsList({ className, children, ...props }: TabsListProps) {
	return (
		<div
			className={cn(
				'bg-background/50',
				'items-center justify-center rounded-lg p-2',
				'backdrop-blur-sm',
				'ring-border/30 ring-2',
				'gap-2',
				className
			)}
			role="tablist"
			{...props}
		>
			{children}
		</div>
	)
}

interface TabsTriggerProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	value: string
}

export function TabsTrigger({
	className,
	value,
	children,
	disabled,
	...props
}: TabsTriggerProps) {
	const context = useContext(TabsContext)
	if (!context) throw new Error('TabsTrigger must be used within Tabs')

	const isActive = context.value === value

	return (
		<button
			aria-selected={isActive}
			className={cn(
				'bg-background inline-flex items-center justify-center gap-3 rounded-md px-3 py-1.5 font-semibold transition-all',
				'cursor-pointer select-none',

				'text-neutral-600 dark:text-neutral-300',

				'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none',
				'focus-visible:ring-offset-neutral-100 dark:focus-visible:ring-offset-neutral-900',

				'hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50',

				'data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950',
				'data-[state=active]:text-neutral-950 dark:data-[state=active]:text-neutral-50',
				'data-[state=active]:shadow-sm',

				'disabled:pointer-events-none disabled:opacity-50',

				className
			)}
			data-state={isActive ? 'active' : 'inactive'}
			disabled={disabled}
			onClick={() => context.onValueChange(value)}
			role="tab"
			{...props}
		>
			{children}
		</button>
	)
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
	value: string
}

export function TabsContent({
	className,
	value,
	children,
	...props
}: TabsContentProps) {
	const context = useContext(TabsContext)
	if (!context) throw new Error('TabsContent must be used within Tabs')

	const isActive = context.value === value

	return (
		<div
			className={cn(
				isActive ? 'block' : 'hidden',
				'mt-4 rounded-lg',
				'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none',
				'focus-visible:ring-offset-background',

				className
			)}
			role="tabpanel"
			tabIndex={0}
			{...props}
		>
			{children}
		</div>
	)
}

export const Tabs = {
	Root: TabsRoot,
	List: TabsList,
	Trigger: TabsTrigger,
	Content: TabsContent,
}
