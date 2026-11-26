'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
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
			<h1
				className={`${mtsExtended.className} text-[22px] leading-none font-medium`}
			>
				{t('download.title')}
			</h1>

			<Card.Root className="gap-5">
				<p className="text-foreground font-medium">
					{t('download.description')}
				</p>

				<div className="flex flex-col gap-1">
					<span className="text-sm font-semibold">
						{t('download.include')}
					</span>
					{entriesList.length === 0 ? (
						<p className="text-foreground text-sm font-semibold">
							{t('download.empty')}
						</p>
					) : (
						<ul className="flex flex-wrap gap-2">
							{entriesList.map(([key, value]) => (
								<li
									className="bg-accent/50 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
									key={key}
								>
									<Icon
										className="text-primary"
										icon="lucide:database-zap"
									/>
									<span>{key}</span>
									<span
										className={`text-foreground font-mono`}
									>
										{formatBytes(value.length)}
									</span>
								</li>
							))}
						</ul>
					)}
					<p
						className={`text-foreground font-mono text-xs font-semibold`}
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
								className={`border-muted bg-card/50 w-full rounded-lg border-2 px-3 py-2 font-mono text-xs font-semibold`}
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
								<span className="text-destructive flex items-center gap-1.5 text-sm font-semibold">
									<Icon icon="lucide:triangle-alert" />
									{t('download.oversize')}
								</span>
							)}
						</div>
						<p className="text-foreground text-xs font-semibold">
							{t('download.hint')}
						</p>
					</div>
				)}
			</Card.Root>
		</section>
	)
}
