'use client'

import axios from 'axios'
import { usePathname } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { useEffect, useState } from 'react'
import GlobalErrorView from '@/views/errors/globalError/GlobalErrorView'

type GlobalErrorProps = {
	error: Error & { digest?: string }
	reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
	const path = usePathname()
	const [errorId, setErrorId] = useState<string | null>(null)
	const [messages, setMessages] = useState<Record<string, unknown> | null>(
		null
	)

	useEffect(() => {
		const locale =
			document.cookie.match(/lang=(ru|en|es|fr|ko)/)?.[1] ?? 'ru'
		import(`@/locales/${locale}.json`).then((mod) =>
			setMessages(mod.default)
		)
	}, [])

	useEffect(() => {
		if (process.env.NODE_ENV !== 'production') return

		const sendError = async () => {
			try {
		const parts = [`Page: ${path}`, `Message: ${error.message ?? 'No message'}`]

			if (error.digest) parts.push(`Digest: ${error.digest}`)
			if (error.stack) {
				const trace = error.stack
					.split('\n')
					.slice(0, 5)
					.join('\n')
				parts.push(`Stack:\n${trace}`)
			}

			const content = parts.join('\n')
			const response = await axios.post('/api/error-report', {
				content,
			})

				setErrorId(response.data.errorId)
				console.info('Reported error, ID:', response.data.errorId)
			} catch (err) {
				console.error('Failed to report error', err)
			}
		}

		sendError()
	}, [error, path])

	if (!messages) return null

	return (
		<NextIntlClientProvider messages={messages}>
			<GlobalErrorView errorId={errorId} reset={reset} />
		</NextIntlClientProvider>
	)
}
