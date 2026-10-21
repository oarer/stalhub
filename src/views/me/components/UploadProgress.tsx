'use client'

import { useTranslations } from 'next-intl'

export function UploadProgress({ progress }: { progress: number }) {
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-1">
			<div className="flex justify-between text-muted-foreground text-xs">
				<span>{t('me.newArt.uploading')}</span>
				<span>{progress}%</span>
			</div>
			<div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
				<div
					className="h-full rounded-full bg-linear-to-r from-muted/50 to-primary transition-all duration-200"
					style={{ width: `${progress}%` }}
				/>
			</div>
		</div>
	)
}
