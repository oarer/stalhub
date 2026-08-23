import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { MDXRemote } from 'next-mdx-remote'
import { useMDXComponents } from '@/components/wiki/mdx-components'
import { cn } from '@/lib/cn'
import type { EditorTab } from './editor-utils'

const EMPTY_SCOPE = {}
const EMPTY_FRONTMATTER = {}

interface PreviewPaneProps {
	compiledSource: string
	compileError: boolean
	content: string
	onScroll: () => void
	previewRef: React.RefObject<HTMLDivElement | null>
	mobileTab: EditorTab
}

export function PreviewPane({
	compiledSource,
	compileError,
	content,
	onScroll,
	previewRef,
	mobileTab,
}: PreviewPaneProps) {
	const components = useMDXComponents()
	const t = useTranslations()

	return (
		<div
			className={cn(
				'relative my-2 mr-2 min-h-0 flex-1 overflow-y-auto rounded-lg border-2 border-primary/20 bg-card',
				mobileTab !== 'preview' && 'hidden md:flex'
			)}
			onScroll={onScroll}
			ref={previewRef}
		>
			<div className="w-full p-4">
				{compiledSource ? (
					<div className="prose prose-neutral dark:prose-invert max-w-none">
						<MDXRemote
							compiledSource={compiledSource}
							components={components}
							frontmatter={EMPTY_FRONTMATTER}
							scope={EMPTY_SCOPE}
						/>
					</div>
				) : content.trim() ? (
					<div className="flex items-center justify-center gap-2 py-16">
						<Icon
							className="size-4 animate-spin text-text-accent"
							icon="lucide:loader-circle"
						/>
						<p className="font-semibold text-md text-text-accent">
							{t('me.articleEditor.compiling')}
						</p>
					</div>
				) : (
					<div className="flex flex-col items-center gap-2 py-16">
						<Icon
							className="text-4xl text-text-accent"
							icon="lucide:file-text"
						/>
						<p className="font-semibold text-md text-text-accent">
							{t('me.articleEditor.previewHere')}
						</p>
					</div>
				)}
				{compileError && (
					<div className="flex items-center gap-2 border-destructive/20 border-t bg-destructive/5 px-4 py-2 text-destructive text-xs">
						<Icon className="size-4" icon="lucide:alert-triangle" />
						<p className="font-semibold">
							{t('me.articleEditor.mdxError')}
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
