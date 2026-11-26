import { useTranslations } from 'next-intl'
import { Textarea } from '@/components/ui/Textarea'
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
				'border-primary/20 bg-card my-2 ml-2 min-h-0 flex-1 rounded-lg border-2',
				mobileTab !== 'write' && 'hidden md:flex md:flex-col'
			)}
		>
			<Textarea
				className="placeholder:text-foreground/40 h-full w-full resize-none border-0 bg-transparent p-4 font-mono leading-relaxed font-normal"
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
