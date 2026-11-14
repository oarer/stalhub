'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from './Button'

interface ShareButtonProps {
	url: string
	title?: string
}

export function ShareButton({ url, title }: ShareButtonProps) {
	const t = useTranslations()
	const [copied, setCopied] = useState(false)

	const share = async () => {
		const resolvedUrl = new URL(url, window.location.origin).toString()
		if (navigator.share) {
			await navigator.share({ title, url: resolvedUrl })
			return
		}
		await navigator.clipboard.writeText(resolvedUrl)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<Button
			aria-label={copied ? t('feed.copied') : t('feed.share')}
			className="gap-2 p-2.5"
			onClick={() => void share()}
			variant="secondary"
		>
			<span className="relative flex size-5 items-center justify-center">
				<Icon
					className={`absolute size-5 transition-all duration-200 ${
						copied
							? 'rotate-45 scale-50 opacity-0'
							: 'rotate-0 scale-100 opacity-100'
					}`}
					icon="lucide:share-2"
				/>
				<Icon
					className={`absolute size-5 transition-all duration-200 ${
						copied
							? 'rotate-0 scale-100 text-primary opacity-100'
							: '-rotate-45 scale-50 opacity-0'
					}`}
					icon="lucide:check"
				/>
			</span>
		</Button>
	)
}
