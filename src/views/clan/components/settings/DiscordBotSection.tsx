'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import type { BotGuild, BotLinkToken } from '@/types/clan/clan.type'

interface DiscordBotSectionProps {
	guilds: BotGuild[]
	linkToken: BotLinkToken | null
	isLinkPending: boolean
	unlinkPendingId: string | null
	onGenerate: () => void
	onUnlink: (guildId: string) => void
	onCloseToken: () => void
}

export function DiscordBotSection({
	guilds,
	linkToken,
	isLinkPending,
	unlinkPendingId,
	onGenerate,
	onUnlink,
	onCloseToken,
}: DiscordBotSectionProps) {
	const t = useTranslations()
	return (
		<div className="flex flex-col gap-3 rounded-xl bg-background px-5 py-4">
			<div className="flex items-center gap-2 font-semibold text-lg">
				<Icon className="text-xl" icon="lucide:bot" />
				{t('clan.settings.botTitle')}
			</div>

			<Alert.Root>
				<Alert.Description>
					{t('clan.settings.botDesc')}
				</Alert.Description>
			</Alert.Root>

			{linkToken ? (
				<div className="flex flex-col gap-2 rounded-lg bg-border-secondary/40 p-4">
					<div className="flex items-center justify-between gap-3">
						<div className="flex flex-col gap-1">
							<span className="font-semibold text-sm">
								{t('clan.settings.botCommandLabel')}
							</span>
							<code className="break-all font-mono text-sm">
								{linkToken.command}
							</code>
						</div>
						<div className="flex shrink-0 items-center gap-2">
							<CopyButton text={linkToken.command} />
							<Button
								aria-label={t('clan.common.close')}
								className="h-9 w-9 p-0"
								onClick={onCloseToken}
								variant="ghost"
							>
								<Icon
									className="text-base"
									icon="lucide:x"
								/>
							</Button>
						</div>
					</div>
					<span className="font-semibold text-sm text-text-accent">
						{t('clan.settings.botTokenExpires', {
							minutes: Math.ceil(linkToken.expires_in / 60),
						})}
					</span>
				</div>
			) : (
				<div className="flex items-center justify-between gap-3 rounded-lg bg-border-secondary/40 px-4 py-3">
					<div className="flex flex-col gap-1">
						<span className="font-semibold text-sm">
							{t('clan.settings.botLinkLabel')}
						</span>
						<span className="font-semibold text-sm text-text-accent">
							{t('clan.settings.botLinkHint')}
						</span>
					</div>
					<Button
						disabled={isLinkPending}
						loading={isLinkPending}
						onClick={onGenerate}
						variant="secondary"
					>
						<Icon
							className="text-base"
							icon="lucide:link"
						/>
						{t('clan.settings.botLinkButton')}
					</Button>
				</div>
			)}

			<div className="flex flex-col gap-2">
				<span className="font-semibold text-sm">
					{t('clan.settings.botGuildsTitle')}
				</span>
				{guilds.length === 0 ? (
					<span className="font-semibold text-sm text-text-accent">
						{t('clan.settings.botNoGuilds')}
					</span>
				) : (
					<div className="flex flex-col gap-2">
						{guilds.map((guild) => (
							<div
								className="flex items-center justify-between gap-3 rounded-lg bg-border-secondary/40 px-4 py-3"
								key={guild.guild_id}
							>
								<div className="flex min-w-0 items-center gap-2">
									<Icon
										className="shrink-0 text-base text-text-accent"
										icon="lucide:server"
									/>
									<span className="truncate font-mono text-sm">
										{guild.guild_id}
									</span>
								</div>
								<Button
									disabled={
										unlinkPendingId === guild.guild_id
									}
									loading={
										unlinkPendingId === guild.guild_id
									}
									onClick={() => onUnlink(guild.guild_id)}
									size="sm"
									variant="danger"
								>
									{t('clan.settings.botUnlink')}
								</Button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
