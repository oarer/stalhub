import { useTranslations } from 'next-intl'
import { Modal } from '@/components/ui/Modal'
import { TABLE_HEADER_PLACEHOLDER } from '@/constants/article-editor.const'
import { applyEdit } from './editor-utils'
import { TableGrid } from './TableGrid'

interface TableModalProps {
	open: boolean
	onOpenChange: (v: boolean) => void
	textareaRef: React.RefObject<HTMLTextAreaElement | null>
	setContent: (v: string) => void
}

export function TableModal({
	open,
	onOpenChange,
	textareaRef,
	setContent,
}: TableModalProps) {
	const t = useTranslations()

	const handleInsert = (rows: number, cols: number) => {
		const ta = textareaRef.current
		if (!ta) return
		const header = `| ${Array.from(
			{ length: cols },
			(_, i) => `${t(TABLE_HEADER_PLACEHOLDER)} ${i + 1}`
		).join(' | ')} |`
		const separator = `| ${Array.from({ length: cols }, () => '---').join(
			' | '
		)} |`
		const body = Array.from(
			{ length: rows },
			() => `| ${Array.from({ length: cols }, () => ' ').join(' | ')} |`
		).join('\n')
		const table = `\n${header}\n${separator}\n${body}\n`
		const start = ta.selectionStart
		const next = ta.value.slice(0, start) + table + ta.value.slice(start)
		applyEdit(ta, setContent, {
			next,
			newStart: start + 3,
			newEnd: start + 15,
		})
		onOpenChange(false)
	}

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content className="w-fit" fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{t('me.articleEditor.table')}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<TableGrid onInsert={handleInsert} />
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}
