'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { MDXRemote } from 'next-mdx-remote'
import { useMDXComponents } from '@/components/wiki/mdx-components'
import { useCompiledPreview } from '@/views/me/hooks/useCompiledPreview'

export function MarkdownContent({
	content,
	compact = false,
}: {
	content?: string | null
	compact?: boolean
}) {
	const t = useTranslations()
	const components = useMDXComponents()
	const source = content ?? ''
	const { compiledSource, compileError } = useCompiledPreview(source)
	if (!source.trim()) return null
	if (!compiledSource) {
		return compileError ? (
			<p className="whitespace-pre-wrap text-foreground text-sm">
				{source}
			</p>
		) : (
			<div className="flex items-center gap-2 text-foreground text-sm">
				<Icon
					className="size-4 animate-spin"
					icon="lucide:loader-circle"
				/>
				{t('post.rendering')}
			</div>
		)
	}
	return (
		<div
			className={`prose prose-neutral dark:prose-invert max-w-none ${compact ? 'line-clamp-3' : ''}`}
		>
			<MDXRemote
				compiledSource={compiledSource}
				components={components}
				frontmatter={{}}
				scope={{}}
			/>
		</div>
	)
}
