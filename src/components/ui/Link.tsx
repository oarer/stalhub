import type { AnchorHTMLAttributes } from 'react'

import type { VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'
import Link from 'next/link'
import { Icon } from '@iconify/react'

import { linkVariants } from '@/constants/ui/link.const'

interface CLinkProps
	extends AnchorHTMLAttributes<HTMLAnchorElement>,
		VariantProps<typeof linkVariants> {
	variant?: 'primary' | 'secondary' | 'outline'
	disabled?: boolean
	href: string
}

export default function CLink({
	children,
	className,
	variant,
	size,
	disabled = false,
	href,
	...rest
}: CLinkProps) {
	const isExternal = /^https?:\/\//.test(href)

	return (
		<Link
			href={href}
			{...rest}
			aria-disabled={disabled}
			className={twMerge(linkVariants({ variant, size }), className)}
			rel={isExternal ? 'noopener noreferrer' : undefined}
			tabIndex={disabled ? -1 : undefined}
			target={isExternal ? '_blank' : undefined}
		>
			{children}
			{isExternal && (
				<Icon
					className="h-4 w-4 shrink-0"
					icon="lucide:external-link"
				/>
			)}
		</Link>
	)
}
