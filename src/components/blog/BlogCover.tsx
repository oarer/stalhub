'use client'

import { useMemo } from 'react'
import {
	type BlogCoverPanel,
	type BlogCoverPanelMode,
	buildBlogCoverSvg,
	estimateReadingMinutes,
	extractExcerpt,
} from '@/lib/blog-cover'
import { cn } from '@/lib/cn'
import { useIconifyBody } from '@/lib/use-iconify-body'

interface BlogCoverProps {
	title: string
	content?: string | null
	subtitle?: string | null
	tags?: string[]
	panel?: BlogCoverPanel | null
	mode?: BlogCoverPanelMode | null
	icon?: string | null
	seed?: string | number | null
	className?: string
}

export default function BlogCover({
	title,
	content,
	subtitle,
	tags = [],
	panel,
	mode,
	icon,
	seed,
	className,
}: BlogCoverProps) {
	const { body: remoteIconBody } = useIconifyBody(icon)
	const svg = useMemo(() => {
		const resolvedSubtitle =
			subtitle ?? (content ? extractExcerpt(content) : '')
		const reading = content ? estimateReadingMinutes(content) : null
		return buildBlogCoverSvg({
			title,
			subtitle: resolvedSubtitle,
			tags,
			readingMinutes: reading,
			panel,
			mode,
			icon,
			iconBody: remoteIconBody,
			seed: seed ?? title,
		})
	}, [
		title,
		content,
		subtitle,
		tags,
		panel,
		mode,
		icon,
		remoteIconBody,
		seed,
	])

	return (
		<div
			aria-label={title}
			className={cn(
				'aspect-1200/630 w-full overflow-hidden rounded-lg bg-card [&>svg]:block [&>svg]:h-full [&>svg]:w-full',
				className
			)}
			dangerouslySetInnerHTML={{ __html: svg }}
			role="img"
		/>
	)
}
