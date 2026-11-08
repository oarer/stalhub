'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import type { UnoGridGroup, UnoGridSummary } from '@/types/uno/uno.type'

export function useUnoGridNavigation({
	gridId,
	gridMode,
	gridItems,
	groups,
	selectedNumber,
	onSelectGroup,
}: {
	gridId: string
	gridMode: string | null | undefined
	gridItems: UnoGridSummary[]
	groups: UnoGridGroup[]
	selectedNumber: number | null
	onSelectGroup: (number: number) => void
}) {
	const router = useRouter()

	const sameMode = useMemo(() => {
		if (!gridMode) return gridItems
		return gridItems.filter((item) => item.mode === gridMode)
	}, [gridMode, gridItems])

	const currentGridIndex = sameMode.findIndex((item) => item.id === gridId)
	const prevGrid =
		currentGridIndex > 0 ? sameMode[currentGridIndex - 1] : null
	const nextGrid =
		currentGridIndex >= 0 ? (sameMode[currentGridIndex + 1] ?? null) : null

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.defaultPrevented ||
				event.altKey ||
				event.ctrlKey ||
				event.metaKey
			)
				return

			const target = event.target
			if (
				target instanceof HTMLElement &&
				(target.isContentEditable ||
					['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(
						target.tagName
					))
			)
				return

			const key = event.key.toLowerCase()
			const offset = ['q', 'й'].includes(key)
				? -1
				: ['e', 'у'].includes(key)
					? 1
					: 0
			if (offset === 0) return

			if (event.shiftKey) {
				if (currentGridIndex < 0) return
				const next = sameMode[currentGridIndex + offset]
				if (!next) return

				event.preventDefault()
				router.push(`/uno/grids/${next.id}`)
				return
			}

			const selectedGroupIndex = groups.findIndex(
				(group) => group.number === selectedNumber
			)
			const currentGroupIndex =
				selectedGroupIndex < 0 ? 0 : selectedGroupIndex
			const nextGroup = groups[currentGroupIndex + offset]
			if (!nextGroup) return

			event.preventDefault()
			onSelectGroup(nextGroup.number)
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [
		currentGridIndex,
		groups,
		router,
		sameMode,
		selectedNumber,
		onSelectGroup,
	])

	return { prevGrid, nextGrid }
}
