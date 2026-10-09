'use client'

import { Icon } from '@iconify/react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { CLink } from '@/components/ui/Link'
import ErrorContent from '@/views/errors/shared/ErrorContent'

function getResponseStatus(error: unknown): number | undefined {
	if (axios.isAxiosError(error)) {
		return error.response?.status
	}
	if (
		error &&
		typeof error === 'object' &&
		'response' in error &&
		error.response &&
		typeof error.response === 'object' &&
		'status' in error.response &&
		typeof error.response.status === 'number'
	) {
		return error.response.status
	}
	return undefined
}

function isUnauthorized(error: unknown): boolean {
	const status = getResponseStatus(error)
	return status === 401 || status === 422
}

export default function MeError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	const t = useTranslations()
	const router = useRouter()
	const unauthorized = isUnauthorized(error)

	useEffect(() => {
		if (unauthorized) {
			router.replace('/auth')
		}
	}, [unauthorized, router])

	if (unauthorized) {
		return (
			<section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-4 px-4 py-8 text-center">
				<Icon
					className="animate-spin text-4xl text-accent"
					icon="lucide:loader-circle"
				/>
				<p className="font-medium text-foreground text-sm">
					{t('auth.error')}
				</p>
				<CLink href="/auth" variant="outline">
					{t('auth.login')}
				</CLink>
			</section>
		)
	}

	return (
		<section className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-4 py-8">
			<ErrorContent
				buttonIcon="lucide:rotate-ccw"
				buttonLabel={t('errors.globalError.buttonLabel')}
				description={t('errors.routeError.description')}
				onButtonClick={reset}
			/>
		</section>
	)
}
