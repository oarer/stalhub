'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Section } from '../Section'

export const SOCIAL_NETWORKS = [
	'telegram',
	'youtube',
	'twitch',
	'boosty',
	'x'
]

export const SOCIAL_ICONS: Record<string, string> = {
	telegram: 'lucide:send',
	discord: 'lucide:message-circle',
	youtube: 'lucide:youtube',
	twitch: 'lucide:twitch',
	x: 'lucide:twitter',
}

export function SocialLinksSection({
	links,
	isPending,
	onSave,
}: {
	links: Record<string, string> | null | undefined
	isPending: boolean
	onSave: (links: Record<string, string>) => void
}) {
	const t = useTranslations()
	const [drafts, setDrafts] = useState<Record<string, string>>({})

	useEffect(() => {
		setDrafts(
			Object.fromEntries(
				SOCIAL_NETWORKS.map((n) => [n, links?.[n] ?? ''])
			)
		)
	}, [links])

	const saved = Object.fromEntries(
		SOCIAL_NETWORKS.map((n) => [n, links?.[n] ?? ''])
	)
	const dirty = JSON.stringify(drafts) !== JSON.stringify(saved)

	const handleSave = () => {
		const pruned: Record<string, string> = {}
		for (const [network, url] of Object.entries(drafts)) {
			const trimmed = url.trim()
			if (trimmed) pruned[network] = trimmed
		}
		onSave(pruned)
	}

	return (
		<Section icon="lucide:share-2" title={t('me.settings.socialLinks')}>
			<div className="flex flex-col gap-2">
				<p className="font-semibold text-text-accent text-xs">
					{t('me.settings.socialLinksDesc')}
				</p>
				<div className="flex flex-col gap-2">
					{SOCIAL_NETWORKS.map((network) => (
						<div
							className="flex items-center gap-2 rounded-lg bg-accent/50 p-2.5"
							key={network}
						>
							<Icon
								className="shrink-0 text-text-accent"
								icon={SOCIAL_ICONS[network] ?? 'lucide:link'}
							/>
							<span className="w-20 shrink-0 font-semibold text-sm capitalize">
								{network}
							</span>
							<Input
								className="flex-1 text-sm"
								onChange={(e) =>
									setDrafts((prev) => ({
										...prev,
										[network]: e.target.value,
									}))
								}
								placeholder={t(
									'me.settings.socialLinksUrlPlaceholder'
								)}
								value={drafts[network] ?? ''}
							/>
						</div>
					))}
				</div>
				<Button
					className="self-end"
					disabled={!dirty}
					loading={isPending}
					onClick={handleSave}
					size="md"
					variant="secondary"
				>
					<Icon className="text-lg" icon="lucide:check" />
					<span>{t('me.settings.socialLinksSave')}</span>
				</Button>
			</div>
		</Section>
	)
}
