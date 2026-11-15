import { Icon } from '@iconify/react'
import { buttonVariants } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { cn } from '@/lib/cn'

export const SOCIAL_NETWORKS = [
	'telegram',
	'youtube',
	'twitch',
	'boosty',
	'x',
	'tiktok',
] as const

export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number]

export const SOCIAL_ICONS: Record<SocialNetwork, string> = {
	telegram: 'mingcute:telegram-fill',
	youtube: 'lucide:youtube',
	twitch: 'lucide:twitch',
	boosty: 'simple-icons:boosty',
	x: 'prime:twitter',
	tiktok: 'simple-icons:tiktok',
}

function isSafeSocialUrl(value: string): boolean {
	try {
		const url = new URL(value)
		return url.protocol === 'https:' || url.protocol === 'http:'
	} catch {
		return false
	}
}

export function SocialLinks({
	links,
	className,
	withDivider = false,
}: {
	links?: Record<string, string> | null
	className?: string
	withDivider?: boolean
}) {
	const entries = SOCIAL_NETWORKS.map(
		(network) => [network, links?.[network]] as const
	).filter(
		(entry): entry is readonly [SocialNetwork, string] =>
			typeof entry[1] === 'string' &&
			entry[1].trim().length > 0 &&
			isSafeSocialUrl(entry[1].trim())
	)

	if (entries.length === 0) return null

	return (
		<>
			{withDivider && <Divider />}
			<div className={cn('flex flex-wrap gap-2', className)}>
				{entries.map(([network, url]) => (
					<a
						aria-label={network}
						className={cn(
							buttonVariants({
								variant: 'secondary',
								size: 'sm',
							}),
							'gap-1.5 font-medium text-xs'
						)}
						href={url.trim()}
						key={network}
						rel="noopener noreferrer"
						target="_blank"
					>
						<Icon
							className="text-sm"
							icon={SOCIAL_ICONS[network]}
						/>
						<span className="capitalize">{network}</span>
					</a>
				))}
			</div>
		</>
	)
}

export default SocialLinks
