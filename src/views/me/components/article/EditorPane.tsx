import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'
import type { EditorTab } from './editor-utils'

interface EditorPaneProps {
	value: string
	onChange: (v: string) => void
	onScroll: () => void
	textareaRef: React.RefObject<HTMLTextAreaElement | null>
	mobileTab: EditorTab
}

export function EditorPane({
	value,
	onChange,
	onScroll,
	textareaRef,
	mobileTab,
}: EditorPaneProps) {
	const t = useTranslations()
	return (
		<div
			className={cn(
				'my-2 ml-2 min-h-0 flex-1 rounded-lg border-2 border-primary/20 bg-card',
				mobileTab !== 'write' && 'hidden md:flex md:flex-col'
			)}
		>
			<textarea
				className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed outline-none placeholder:text-text-accent/40"
				onChange={(e) => onChange(e.target.value)}
				onScroll={onScroll}
				placeholder={t('me.articleEditor.placeholder')}
				ref={textareaRef}
				spellCheck={false}
				value={value}
			/>
		</div>
	)
}
