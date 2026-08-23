import Link from 'next/link'
import type { ReactNode } from 'react'
import { forwardRef } from 'react'

import { cn } from '@/lib/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(
	({ className, ...props }, ref) => (
		<div
			className={cn(
				'flex flex-col gap-2 rounded-xl bg-card px-5 py-4 shadow-lg ring-2 ring-primary/50 backdrop-blur-none md:bg-card/50 md:backdrop-blur-md',
				className
			)}
			ref={ref}
			{...props}
		/>
	)
)
CardRoot.displayName = 'UI.CardRoot'

interface CardLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	children: ReactNode
	href: string
}

const CardLink = forwardRef<HTMLAnchorElement, CardLinkProps>(
	({ className, href, ...props }, ref) => (
		<Link
			className={cn(
				'flex flex-col gap-2 rounded-xl bg-card px-5 py-4 shadow-lg ring-2 ring-primary/50 backdrop-blur-none md:bg-card/50 md:backdrop-blur-md',
				className
			)}
			href={href}
			ref={ref}
			{...props}
		/>
	)
)
CardLink.displayName = 'UI.CardLink'

const CardHeader = forwardRef<HTMLDivElement, CardProps>(
	({ className, ...props }, ref) => (
		<div className={cn('flex flex-col', className)} ref={ref} {...props} />
	)
)
CardHeader.displayName = 'UI.CardHeader'

const CardTitle = forwardRef<HTMLDivElement, CardProps>(
	({ className, children, ...props }, ref) => (
		<div
			className={cn(
				'flex items-center gap-2 font-semibold text-lg',
				className
			)}
			ref={ref}
			{...props}
		>
			{children}
		</div>
	)
)
CardTitle.displayName = 'UI.CardTitle'

const CardDescription = forwardRef<HTMLDivElement, CardProps>(
	({ className, ...props }, ref) => (
		<div
			className={cn('text-muted-foreground text-sm', className)}
			ref={ref}
			{...props}
		/>
	)
)
CardDescription.displayName = 'UI.CardDescription'

const CardContent = forwardRef<HTMLDivElement, CardProps>(
	({ className, ...props }, ref) => (
		<div
			className={cn('font-semibold text-card-foreground', className)}
			ref={ref}
			{...props}
		/>
	)
)
CardContent.displayName = 'UI.CardContent'

const CardFooter = forwardRef<HTMLDivElement, CardProps>(
	({ className, ...props }, ref) => (
		<div
			className={cn(
				'flex items-center justify-between font-semibold',
				className
			)}
			ref={ref}
			{...props}
		/>
	)
)
CardFooter.displayName = 'UI.CardFooter'

export const Card = {
	Root: CardRoot,
	Link: CardLink,
	Header: CardHeader,
	Title: CardTitle,
	Description: CardDescription,
	Content: CardContent,
	Footer: CardFooter,
}
