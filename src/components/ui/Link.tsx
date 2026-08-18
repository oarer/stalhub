'use client'

import { Icon } from '@iconify/react'
import type { VariantProps } from 'class-variance-authority'
import Link from 'next/link'
import { forwardRef } from 'react'
import { linkVariants } from '@/constants/ui/link.const'
import { cn } from '@/lib/cn'

interface CLinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
		VariantProps<typeof linkVariants> {
	disabled?: boolean
	href: string
	external?: boolean
	externalIcon?: boolean
	loading?: boolean
}

const CLink = forwardRef<HTMLAnchorElement, CLinkProps>(
	(
		{
			children,
			className,
			variant,
			size,
			disabled = false,
			href,
			external,
			externalIcon = true,
			loading = false,
			...props
		},
		ref
	) => {
		const isExternal = external ?? /^https?:\/\//.test(href)

		return (
			<Link
				href={href}
				{...props}
				aria-disabled={disabled || loading}
				className={cn(
					linkVariants({ variant, size }),
					className,
					(disabled || loading) && 'pointer-events-none opacity-50',
					loading && 'cursor-not-allowed'
				)}
				ref={ref}
				rel={isExternal ? 'noopener noreferrer' : undefined}
				target={isExternal ? '_blank' : undefined}
			>
				{loading && (
					<Icon
						className="mr-2 h-4 w-4 animate-spin"
						icon="lucide:loader-circle"
					/>
				)}
				{children}
				{isExternal && externalIcon && !loading && (
					<Icon
						className="ml-2 h-4 w-4 shrink-0"
						icon="lucide:external-link"
					/>
				)}
			</Link>
		)
	}
)

CLink.displayName = 'UI.CLink'

export { CLink }
