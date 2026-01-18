import type { ReactNode } from 'react'
import { forwardRef } from 'react'

import Link from 'next/link'

import { cn } from '@/lib/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode
}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div
            className={cn(
                'dark:bg-background/20 ring-border/50 flex flex-col gap-2 rounded-xl bg-white px-5 py-4 shadow-lg ring-2 backdrop-blur-md',
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
                'dark:bg-background/20 ring-border/50 flex flex-col gap-2 rounded-xl bg-white px-5 py-4 shadow-lg ring-2 backdrop-blur-md',
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
                'flex items-center gap-2 text-lg font-semibold',
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
            className={cn(
                'text-sm text-neutral-600 dark:text-neutral-300',
                className
            )}
            ref={ref}
            {...props}
        />
    )
)
CardDescription.displayName = 'UI.CardDescription'

const CardContent = forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div
            className={cn(
                'font-semibold text-neutral-800 dark:text-neutral-100',
                className
            )}
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
