'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import type { User } from '@/types/user.type'
import type { ProviderName } from '@/views/me/hooks/useSettingsMutations'
import { Section } from '../Section'
import { SettingRow } from './SettingRow'

const PROVIDERS: ProviderName[] = ['discord', 'telegram', 'exbo']

interface Props {
	providers: User['providers']
	onLink: (provider: ProviderName) => void
	onUnlink: (provider: ProviderName) => void
	isClanSyncPending: boolean
	onClanSync: () => void
	exbo?: string
}

export function LinkedAccountsSection({
	providers,
	onLink,
	onUnlink,
	isClanSyncPending,
	onClanSync,
	exbo,
}: Props) {
	const t = useTranslations()

	return (
		<Section icon="lucide:link" title={t('me.settings.linkAccounts')}>
			<div className="flex flex-col gap-2">
				{PROVIDERS.map((provider) => (
					<div
						className="flex items-center justify-between rounded-lg bg-accent/50 p-4"
						key={provider}
					>
						<div className="flex items-center gap-3">
							<Image
								alt={`${provider} link`}
								height={20}
								src={`/images/other/${provider}.png`}
								width={20}
							/>
							<span className="font-semibold text-sm capitalize">
								{provider}
							</span>
						</div>

						{providers[provider] !== null ? (
							<Button
								className="ring-0"
								onClick={() => onUnlink(provider)}
								variant="danger"
							>
								<Icon icon="lucide:unlink" />
							</Button>
						) : (
							<Button
								onClick={() => onLink(provider)}
								variant="ghost"
							>
								<Icon icon="lucide:link" />
							</Button>
						)}
					</div>
				))}
				{exbo && (
					<SettingRow
						description={t('me.settings.syncClansDesc')}
						title={t('me.settings.syncClansTitle')}
					>
						<Button
							className="gap-2 self-start"
							disabled={isClanSyncPending}
							loading={isClanSyncPending}
							onClick={onClanSync}
							variant="secondary"
						>
							<Icon
								className="text-base"
								icon="lucide:refresh-cw"
							/>
						</Button>
					</SettingRow>
				)}
			</div>
		</Section>
	)
}
