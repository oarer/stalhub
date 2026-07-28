import { Icon } from '@iconify/react'
import { Modal } from '@/components/ui/Modal'
import {
	MDX_COMPONENT_SNIPPET,
	MDX_COMPONENTS,
} from '@/constants/article-editor.const'
import { cn } from '@/lib/cn'
import { applyEdit } from './editor-utils'

interface ComponentsModalProps {
	open: boolean
	onOpenChange: (v: boolean) => void
	textareaRef: React.RefObject<HTMLTextAreaElement | null>
	setContent: (v: string) => void
}

export function ComponentsModal({
	open,
	onOpenChange,
	textareaRef,
	setContent,
}: ComponentsModalProps) {
	const handleInsert = (type: string) => {
		const ta = textareaRef.current
		if (!ta) return
		const snippet = MDX_COMPONENT_SNIPPET(type)
		const start = ta.selectionStart
		const next = ta.value.slice(0, start) + snippet + ta.value.slice(start)
		applyEdit(ta, setContent, {
			next,
			newStart: start + type.length + 4,
			newEnd: start + type.length + 13,
		})
		onOpenChange(false)
	}

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content className="max-w-lg" fullScreen={false}>
				<Modal.Header>
					<Modal.Title>Компоненты</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="grid grid-cols-2 gap-2">
						{MDX_COMPONENTS.map((item) => (
							<button
								className={cn(
									'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors',
									item.color
								)}
								key={item.type}
								onClick={() => handleInsert(item.type)}
								type="button"
							>
								<Icon
									className="size-5 shrink-0"
									icon={item.icon}
								/>
								<p className="font-semibold text-sm capitalize">
									{item.type}
								</p>
							</button>
						))}
					</div>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}
