'use client'

import { NextIntlClientProvider } from 'next-intl'
import type { ReactNode } from 'react'

interface Props {
	children: ReactNode
	messages: Record<string, unknown>
	locale: string
}

export default function LocaleProvider({ children, messages, locale }: Props) {
	return (
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
			{children}
		</NextIntlClientProvider>
	)
}
