'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import ErrorContent from '../shared/ErrorContent'
import SupportText from '../shared/SupportText'

type NotFoundProps = {
	path: string
}

export default function NotFoundView({ path }: NotFoundProps) {
	const t = useTranslations()

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
			<div className="grid items-center gap-16 md:flex">
				<ErrorContent
					buttonIcon="lucide:home"
					buttonLabel={t('errors.notFound.buttonLabel')}
					description={t('errors.notFound.description')}
				/>
				<Image
					alt="not found"
					className="rounded-lg bg-neutral-200 p-3 dark:bg-transparent"
					height={400}
					src="/images/errors/404.png"
					width={400}
				/>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SupportText
					identifierLabel={t('errors.notFound.ifUrlCorrect')}
					identifierPrefix="URL"
					identifierValue={path}
				/>
			</div>
		</div>
	)
}
