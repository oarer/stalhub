'use client'

import { useEffect, useState } from 'react'
import {
	fetchIconifyBody,
	isBundledCoverIcon,
	parseIconifyName,
} from './iconify'

export function useIconifyBody(icon: string | null | undefined): {
	body: string | null
	notFound: boolean
} {
	const [state, setState] = useState<{
		body: string | null
		notFound: boolean
	}>({ body: null, notFound: false })

	useEffect(() => {
		const parsed = icon ? parseIconifyName(icon) : null
		if (!parsed || isBundledCoverIcon(icon ?? '')) {
			setState({ body: null, notFound: false })
			return
		}
		let cancelled = false
		const controller = new AbortController()
		fetchIconifyBody(parsed.prefix, parsed.name, controller.signal).then(
			(body) => {
				if (!cancelled) setState({ body, notFound: body === null })
			}
		)
		return () => {
			cancelled = true
			controller.abort()
		}
	}, [icon])

	return state
}
