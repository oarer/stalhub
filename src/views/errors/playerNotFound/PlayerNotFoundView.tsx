'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import ErrorContent from '@/views/errors/shared/ErrorContent'

export default function PlayerNotFoundView() {
	const t = useTranslations()
	const router = useRouter()

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 pt-12">
			<div className="grid items-center gap-16 md:flex">
				<ErrorContent
					buttonIcon="lucide:home"
					buttonLabel={t('errors.playerNotFound.buttonLabel')}
					description={t('errors.playerNotFound.description')}
					onButtonClick={() => router.push('/player')}
				/>
				<Image
					alt="player not found"
					className="rounded-lg bg-neutral-200 p-3 dark:bg-transparent"
					height={424}
					src="/images/errors/404.png"
					width={424}
				/>
			</div>
		</div>
	)
}
