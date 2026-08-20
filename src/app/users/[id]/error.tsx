'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import ErrorContent from '@/views/errors/shared/ErrorContent'

function is404(error: unknown): boolean {
	if (
		error &&
		typeof error === 'object' &&
		'response' in error &&
		error.response &&
		typeof error.response === 'object' &&
		'status' in error.response
	) {
		return error.response.status === 404
	}
	return false
}

export default function UserError({
	error,
	retry,
}: {
	error: Error & { digest?: string }
	retry: () => void
}) {
	const t = useTranslations()
	const notFound = is404(error)

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
			<div className="grid items-center gap-16 md:flex">
				<ErrorContent
					buttonIcon={notFound ? 'lucide:home' : 'lucide:rotate-ccw'}
					buttonLabel={
						notFound
							? t('errors.notFound.buttonLabel')
							: t('errors.globalError.buttonLabel')
					}
					description={
						notFound
							? t('errors.notFound.userNotFound')
							: t('errors.routeError.description')
					}
					onButtonClick={notFound ? undefined : retry}
				/>
				<Image
					alt={notFound ? 'not found' : 'error'}
					className="rounded-lg bg-neutral-200 p-3 dark:bg-transparent"
					height={400}
					src={
						notFound
							? '/images/errors/404.png'
							: '/images/errors/client.png'
					}
					width={400}
				/>
			</div>
		</div>
	)
}
