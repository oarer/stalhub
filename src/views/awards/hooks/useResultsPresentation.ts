'use client'

import { useEffect, useMemo, useState } from 'react'
import type { AwardResults } from '@/types/awards.type'
import { buildResultSlides } from '../utils/results-presentation'

export function useResultsPresentation({
	open,
	results,
	initialSlug,
	mode,
	onOpenChange,
}: {
	open: boolean
	results: AwardResults
	initialSlug?: string
	mode: 'modal' | 'page'
	onOpenChange: (open: boolean) => void
}) {
	const [started, setStarted] = useState(false)
	const [startSlug, setStartSlug] = useState<string | undefined>(initialSlug)
	const [slideIndex, setSlideIndex] = useState(0)

	useEffect(() => {
		if (!open) return
		setStarted(Boolean(initialSlug))
		setStartSlug(initialSlug)
		setSlideIndex(0)
	}, [open, initialSlug])

	const slides = useMemo(
		() => buildResultSlides(results.categories, startSlug),
		[results.categories, startSlug]
	)
	const slide = slides[slideIndex]
	const isLast = slideIndex === slides.length - 1

	const startCategory = (slug: string) => {
		setStartSlug(slug)
		setStarted(true)
		setSlideIndex(0)
	}

	const startOverall = () => {
		setStartSlug(undefined)
		setStarted(true)
		setSlideIndex(buildResultSlides(results.categories).length - 1)
	}

	const next = () => {
		if (isLast) {
			onOpenChange(false)
			return
		}
		setSlideIndex((index) => Math.min(index + 1, slides.length - 1))
	}

	const previous = () => {
		if (slideIndex === 0) {
			setStarted(false)
			return
		}
		setSlideIndex((index) => Math.max(index - 1, 0))
	}

	useEffect(() => {
		if (mode !== 'page' || !open) return

		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onOpenChange(false)
				return
			}
			if (!started) return
			if (event.key === 'ArrowRight' || event.key === ' ') {
				event.preventDefault()
				setSlideIndex((index) => {
					if (index >= slides.length - 1) {
						onOpenChange(false)
						return index
					}
					return index + 1
				})
			}
			if (event.key === 'ArrowLeft') {
				event.preventDefault()
				setSlideIndex((index) => {
					if (index === 0) {
						setStarted(false)
						return 0
					}
					return index - 1
				})
			}
		}

		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [mode, open, onOpenChange, slides.length, started])

	return {
		isLast,
		next,
		previous,
		slide,
		slideIndex,
		slides,
		startCategory,
		startOverall,
		started,
	}
}
