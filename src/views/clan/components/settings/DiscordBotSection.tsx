'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import { CLink } from '@/components/ui/Link'
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
		<div className="bg-card flex flex-col gap-3 rounded-xl px-5 py-4">
			<div className="flex items-center gap-2 text-lg font-semibold">
				<Icon className="text-xl" icon="lucide:bot" />
				{t('clan.settings.botTitle')}
			</div>

			{linkToken ? (
				<div className="bg-border-secondary/40 flex flex-col gap-2 rounded-lg p-4">
					<div className="flex items-center justify-between gap-3">
						<div className="flex flex-col gap-1">
							<span className="text-sm font-semibold">
								{t('clan.settings.botCommandLabel')}
							</span>
							<code className="bg-card w-fit rounded-lg p-2 font-mono text-sm break-all">
								{linkToken.command}
							</code>
						</div>
						<div className="flex shrink-0 items-center gap-2">
							<CLink
								href="https://discord.com/oauth2/authorize?client_id=1520775494889377832&permissions=8533165861895233&integration_type=0&scope=bot"
								size={'sm'}
								variant={'primary'}
							>
								{t('clan.settings.botInviteLabel')}
							</CLink>
							<CopyButton
								className="p-4"
								text={linkToken.command}
							/>
							<Button
								aria-label={t('clan.common.close')}
								className="h-9 w-9 p-0"
								onClick={onCloseToken}
								variant="ghost"
							>
								<Icon className="text-base" icon="lucide:x" />
							</Button>
						</div>
					</div>
					<span className="text-foreground text-sm font-semibold">
						{t('clan.settings.botTokenExpires', {
							minutes: Math.ceil(linkToken.expires_in / 60),
						})}
					</span>
				</div>
			) : (
				<div className="bg-border-secondary/40 flex items-center justify-between gap-3 rounded-lg px-4 py-3">
					<div className="flex flex-col gap-1">
						<span className="text-sm font-semibold">
							{t('clan.settings.botLinkLabel')}
						</span>
						<span className="text-foreground text-sm font-semibold">
							{t('clan.settings.botLinkHint')}
						</span>
					</div>
					<Button
						disabled={isLinkPending}
						loading={isLinkPending}
						onClick={onGenerate}
						variant="secondary"
					>
						<Icon icon="lucide:link" />
					</Button>
				</div>
			)}

			<div className="flex flex-col gap-2">
				<span className="text-sm font-semibold">
					{t('clan.settings.botGuildsTitle')}
				</span>
				{guilds.length === 0 ? (
					<span className="text-foreground text-sm font-semibold">
						{t('clan.settings.botNoGuilds')}
					</span>
				) : (
					<div className="flex flex-col gap-2">
						{guilds.map((guild) => (
							<div
								className="bg-border-secondary/40 flex items-center justify-between gap-3 rounded-lg px-4 py-3"
								key={guild.guild_id}
							>
								<div className="flex min-w-0 items-center gap-2">
									<Icon
										className="text-foreground shrink-0 text-base"
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
									loading={unlinkPendingId === guild.guild_id}
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
