'use client'

import { useTranslations } from 'next-intl'

export function UploadProgress({ progress }: { progress: number }) {
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-1">
			<div className="text-muted-foreground flex justify-between text-xs">
				<span>{t('me.newArt.uploading')}</span>
				<span>{progress}%</span>
			</div>
			<div className="bg-accent h-1.5 w-full overflow-hidden rounded-full">
				<div
					className="from-muted/50 to-primary h-full rounded-full bg-linear-to-r transition-all duration-200"
					style={{ width: `${progress}%` }}
				/>
			</div>
		</div>
	)
}
