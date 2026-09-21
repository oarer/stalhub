'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { montserrat, unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CopyButton } from '@/components/ui/CopyButton'
import { toast } from '@/components/ui/Toast'
import { buttonVariants } from '@/constants/ui/button.const'
import { cn } from '@/lib/cn'
import { formatBytes } from '@/lib/download'
import {
	buildImportUrl,
	collectLocalDataEntries,
	encodeLocalData,
	IMPORT_URL_WARN_LENGTH,
} from '@/lib/localData'

export default function Transfer() {
	const t = useTranslations()

	const [entries, setEntries] = useState<Record<string, string>>({})
	const [token, setToken] = useState<string | null>(null)
	const [generating, setGenerating] = useState(false)

	const entriesList = useMemo(
		() => Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)),
		[entries]
	)
	const totalBytes = useMemo(
		() => entriesList.reduce((sum, [, value]) => sum + value.length, 0),
		[entriesList]
	)

	useEffect(() => {
		setEntries(collectLocalDataEntries())
	}, [])

	const handleGenerate = async () => {
		if (generating) return
		setGenerating(true)
		try {
			const nextToken = await encodeLocalData(entries)
			setToken(nextToken)
			toast.success(t('download.generated'))
		} catch {
			toast.error(t('download.generateError'))
		} finally {
			setGenerating(false)
		}
	}

	const link = token ? buildImportUrl(token) : null
	const oversize = link ? link.length > IMPORT_URL_WARN_LENGTH : false

	return (
		<section className="flex flex-col gap-4">
			<h2
				className={`${unbounded.className} font-semibold text-2xl tracking-tight`}
			>
				{t('download.title')}
			</h2>

			<Card.Root className="gap-5">
				<p className="font-medium text-text-accent">
					{t('download.description')}
				</p>

				<div className="flex flex-col gap-1">
					<span className="font-semibold text-sm">
						{t('download.include')}
					</span>
					{entriesList.length === 0 ? (
						<p className="font-semibold text-sm text-text-accent">
							{t('download.empty')}
						</p>
					) : (
						<ul className="flex flex-wrap gap-2">
							{entriesList.map(([key, value]) => (
								<li
									className="flex items-center gap-1.5 rounded-lg bg-accent/50 px-2.5 py-1 font-semibold text-xs"
									key={key}
								>
									<Icon
										className="text-primary"
										icon="lucide:database-zap"
									/>
									<span>{key}</span>
									<span
										className={`${montserrat.className} text-text-accent`}
									>
										{formatBytes(value.length)}
									</span>
								</li>
							))}
						</ul>
					)}
					<p
						className={`${montserrat.className} font-semibold text-text-accent text-xs`}
					>
						{t('download.total', {
							count: entriesList.length,
							size: formatBytes(totalBytes),
						})}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Button
						className="gap-2"
						disabled={entriesList.length === 0}
						loading={generating}
						onClick={() => void handleGenerate()}
						variant="primary"
					>
						<Icon icon="lucide:share-2" />
						{t('download.generate')}
					</Button>
				</div>

				{link && (
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<input
								className={`${montserrat.className} w-full rounded-lg border-2 border-muted bg-card/50 px-3 py-2 font-semibold text-xs`}
								readOnly
								value={link}
							/>
							<CopyButton text={link} variant="secondary" />
						</div>
						<div className="flex flex-wrap gap-2">
							<a
								className={cn(
									buttonVariants({
										variant: 'primary',
										size: 'md',
									}),
									'gap-2'
								)}
								href={link}
							>
								<Icon icon="lucide:download" />
								{t('download.open')}
							</a>
							{oversize && (
								<span className="flex items-center gap-1.5 font-semibold text-destructive text-sm">
									<Icon icon="lucide:triangle-alert" />
									{t('download.oversize')}
								</span>
							)}
						</div>
						<p className="font-semibold text-text-accent text-xs">
							{t('download.hint')}
						</p>
					</div>
				)}
			</Card.Root>
		</section>
	)
}
