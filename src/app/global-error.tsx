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
	const [locale, setLocale] = useState<string>('ru')
	const [messages, setMessages] = useState<Record<string, unknown> | null>(
		null
	)

	useEffect(() => {
		let cancelled = false
		const match = document.cookie.match(/lang=(ru|en|es|fr|ko)/)
		const loc = match?.[1] ?? 'ru'
		setLocale(loc)
		import(`@/locales/${loc}.json`).then(
			(mod) => {
				if (!cancelled) setMessages(mod.default)
			},
			() => {
				if (!cancelled) {
					setMessages({
						errors: {
							oops: 'Oops',
							globalError: {
								buttonLabel: 'Retry',
								description: 'Something went wrong',
							},
						},
					})
				}
			}
		)

		return () => {
			cancelled = true
		}
	}, [])

	useEffect(() => {
		if (process.env.NODE_ENV !== 'production') return

		let cancelled = false
		const sendError = async () => {
			try {
				const parts = [
					`Page: ${path}`,
					`Message: ${error.message ?? 'No message'}`,
				]

				if (error.digest) parts.push(`Digest: ${error.digest}`)
				if (error.stack) {
					const trace = error.stack.split('\n').slice(0, 5).join('\n')
					parts.push(`Stack:\n${trace}`)
				}

				const content = parts.join('\n')
				const response = await axios.post('/api/error-report', {
					content,
				})
				if (cancelled) return

				setErrorId(response.data.errorId)
				console.info('Reported error, ID:', response.data.errorId)
			} catch (err) {
				console.error('Failed to report error', err)
			}
		}

		sendError()

		return () => {
			cancelled = true
		}
	}, [error, path])

	return (
		<html lang={locale}>
			<body>
				{messages ? (
					<NextIntlClientProvider
						getMessageFallback={({ namespace, key }) =>
							`${namespace ? `${namespace}.` : ''}${key}`
						}
						locale={locale}
						messages={messages}
						onError={(error) => {
							if (error.code === 'MISSING_MESSAGE') return
						}}
					>
						<GlobalErrorView errorId={errorId} reset={reset} />
					</NextIntlClientProvider>
				) : null}
			</body>
		</html>
	)
}
