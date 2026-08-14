'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
	applyEdit,
	insertAtLineStart,
	wrapSelection,
} from '../components/article/editor-utils'

export function useArticleHotkeys({
	textareaRef,
	isDirty,
	onSave,
	setContent,
	openComponents,
	openTable,
}: {
	textareaRef: React.RefObject<HTMLTextAreaElement | null>
	isDirty: boolean
	onSave: () => void
	setContent: (v: string) => void
	openComponents: () => void
	openTable: () => void
}) {
	const t = useTranslations()

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const mod = e.ctrlKey || e.metaKey
			if (!mod) return

			const ta = textareaRef.current
			if (!ta) return

			const code = e.code

			if (code === 'KeyS') {
				e.preventDefault()
				if (isDirty) onSave()
				return
			}

			if (code === 'KeyB') {
				e.preventDefault()
				applyEdit(
					ta,
					setContent,
					wrapSelection(
						ta,
						'**',
						'**',
						t('me.articleEditor.hotkeys.text')
					)
				)
				return
			}
			if (code === 'KeyI' && !e.shiftKey) {
				e.preventDefault()
				applyEdit(
					ta,
					setContent,
					wrapSelection(
						ta,
						'*',
						'*',
						t('me.articleEditor.hotkeys.text')
					)
				)
				return
			}
			if (code === 'KeyE' && !e.shiftKey) {
				e.preventDefault()
				applyEdit(
					ta,
					setContent,
					wrapSelection(
						ta,
						'`',
						'`',
						t('me.articleEditor.hotkeys.code')
					)
				)
				return
			}
			if (code === 'KeyK' && !e.shiftKey) {
				e.preventDefault()
				applyEdit(
					ta,
					setContent,
					wrapSelection(
						ta,
						'[',
						'](url)',
						t('me.articleEditor.hotkeys.text')
					)
				)
				return
			}

			if (e.shiftKey) {
				if (code === 'KeyX') {
					e.preventDefault()
					applyEdit(
						ta,
						setContent,
						wrapSelection(
							ta,
							'~~',
							'~~',
							t('me.articleEditor.hotkeys.text')
						)
					)
					return
				}
				if (code === 'KeyH') {
					e.preventDefault()
					applyEdit(
						ta,
						setContent,
						insertAtLineStart(
							ta,
							'## ',
							t('me.articleEditor.hotkeys.heading')
						)
					)
					return
				}
				if (code === 'Period') {
					e.preventDefault()
					applyEdit(
						ta,
						setContent,
						insertAtLineStart(
							ta,
							'> ',
							t('me.articleEditor.hotkeys.quote')
						)
					)
					return
				}
				if (code === 'KeyE') {
					e.preventDefault()
					const start = ta.selectionStart
					const end = ta.selectionEnd
					const selected = ta.value.slice(start, end)
					const block = `\`\`\`\n${selected || t('me.articleEditor.hotkeys.code')}\n\`\`\``
					const next =
						ta.value.slice(0, start) + block + ta.value.slice(end)
					applyEdit(ta, setContent, {
						next,
						newStart: start + 4,
						newEnd:
							start +
							4 +
							(selected || t('me.articleEditor.hotkeys.code'))
								.length,
					})
					return
				}
				if (code === 'KeyI') {
					e.preventDefault()
					applyEdit(
						ta,
						setContent,
						wrapSelection(
							ta,
							'![',
							'](url)',
							t('me.articleEditor.hotkeys.alt')
						)
					)
					return
				}
				if (code === 'Digit8') {
					e.preventDefault()
					applyEdit(
						ta,
						setContent,
						insertAtLineStart(
							ta,
							'- ',
							t('me.articleEditor.hotkeys.item')
						)
					)
					return
				}
				if (code === 'Digit9') {
					e.preventDefault()
					applyEdit(
						ta,
						setContent,
						insertAtLineStart(
							ta,
							'1. ',
							t('me.articleEditor.hotkeys.item')
						)
					)
					return
				}
				if (code === 'Digit7') {
					e.preventDefault()
					const start = ta.selectionStart
					const next =
						ta.value.slice(0, start) +
						'\n---\n' +
						ta.value.slice(start)
					applyEdit(ta, setContent, {
						next,
						newStart: start + 5,
						newEnd: start + 5,
					})
					return
				}
				if (code === 'KeyM') {
					e.preventDefault()
					openComponents()
					return
				}
				if (code === 'KeyT') {
					e.preventDefault()
					openTable()
					return
				}
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isDirty, onSave, openComponents, openTable, setContent, t, textareaRef])
}
