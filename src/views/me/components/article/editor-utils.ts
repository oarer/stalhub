export { type EditorTab, type ToolbarAction } from '@/constants/article-editor.const'

export const parseTags = (raw: string): string[] =>
	raw
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean)

export function wrapSelection(
	textarea: HTMLTextAreaElement,
	prefix: string,
	suffix: string,
	placeholder = ''
) {
	const start = textarea.selectionStart
	const end = textarea.selectionEnd
	const selected = textarea.value.slice(start, end)
	const replacement = selected
		? `${prefix}${selected}${suffix}`
		: `${prefix}${placeholder}${suffix}`
	const next =
		textarea.value.slice(0, start) + replacement + textarea.value.slice(end)
	const newStart = start + prefix.length
	const newEnd = newStart + (selected || placeholder).length
	return { next, newStart, newEnd }
}

export function insertAtLineStart(
	textarea: HTMLTextAreaElement,
	prefix: string,
	placeholder = ''
) {
	const start = textarea.selectionStart
	const value = textarea.value
	const lineStart = value.lastIndexOf('\n', start - 1) + 1
	const lineEnd = value.indexOf('\n', start)
	const line = value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd)
	const stripped = line.replace(/^[#>\-\d.*]+\s*/, '')
	const replacement = `${prefix}${stripped || placeholder}\n`
	const next =
		value.slice(0, lineStart) +
		replacement +
		value.slice(lineEnd === -1 ? value.length : lineEnd)
	const newStart = lineStart + prefix.length
	const newEnd = newStart + (stripped || placeholder).length
	return { next, newStart, newEnd }
}

export function applyEdit(
	textarea: HTMLTextAreaElement,
	setContent: (v: string) => void,
	result: { next: string; newStart: number; newEnd: number }
) {
	setContent(result.next)
	requestAnimationFrame(() => {
		textarea.focus()
		textarea.setSelectionRange(result.newStart, result.newEnd)
	})
}
