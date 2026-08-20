'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { montserrat, unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import DropdownMenu from '@/components/ui/DropDown'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanQueries } from '@/queries/clan/clan.queries'
import { exboQueries } from '@/queries/exbo/exbo.queries'
import { clanService } from '@/services/clan/clan.service'
import { Regions } from '@/types/api.type'
import type { MyClanProfile, UserClanProfile } from '@/types/clan/clan.type'

export default function ClanLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const router = useRouter()
	const t = useTranslations()
	const {
		data: profile,
		isLoading,
		error,
	} = useSuspenseQuery(clanQueries.getMe())
	const { data: myClans } = useSuspenseQuery(clanQueries.getMyClans())
	const { data: characters } = useQuery({
		...exboQueries.getCharacters(
			(profile?.clan?.region as Regions) ?? Regions.RU
		),
		enabled: Boolean(profile?.clan && profile.clan.status === 'FROZEN'),
	})
	const queryClient = getQueryClient()

	const registerMutation = useMutation({
		mutationFn: () => clanService.register(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clan', 'me'] })
			toast.success(t('clan.layout.activated'))
		},
		onError: () => {
			toast.error(t('clan.layout.activateError'))
		},
	})

	const switchMutation = useMutation({
		mutationFn: (clanId: string) => clanService.switchClan(clanId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clan', 'me'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'my-clans'] })
		},
		onError: () => {
			toast.error(t('clan.layout.switchError'))
		},
	})

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-96 w-full" />
			</div>
		)
	}

	if (error || !profile) {
		return (
			<div className="flex flex-col items-center gap-4 rounded-xl bg-background p-8 text-center">
				<Icon className="text-4xl" icon="lucide:users" />
				<h1 className={`${unbounded.className} font-semibold text-xl`}>
					{t('clan.layout.notLinked.title')}
				</h1>
				<p className="font-semibold">
					{t('clan.layout.notLinked.desc')}
				</p>
				<Button
					className="w-full"
					onClick={() => router.push('/me/settings')}
				>
					{t('clan.layout.notLinked.settings')}
				</Button>
			</div>
		)
	}

	if (!profile.clan) {
		return (
			<div className="flex flex-col items-center gap-4 rounded-xl bg-background p-8 text-center">
				<Icon className="text-4xl" icon="lucide:users" />
				<h1 className={`${unbounded.className} font-semibold text-xl`}>
					{t('clan.layout.notFound.title')}
				</h1>
				<p className="font-semibold">
					{t('clan.layout.notFound.desc')}
				</p>
			</div>
		)
	}

	if (profile.clan.blocked) {
		return (
			<div className="flex flex-col gap-4">
				<ClanSelector
					myClans={myClans}
					profile={profile}
					switchMutation={switchMutation}
				/>
				<div className="flex flex-col items-center gap-2 rounded-xl bg-background p-8 text-center">
					<Icon
						className="text-4xl text-red-400"
						icon="lucide:shield-ban"
					/>

					<h1
						className={`${unbounded.className} font-semibold text-red-400 text-xl`}
					>
						{t('clan.layout.blocked.title')}
					</h1>

					<p className="whitespace-pre font-semibold">
						{t('clan.layout.blocked.desc')}
					</p>

					{profile.clan.block_reason && (
						<p
							className={`${unbounded.className} font-semibold text-sm uppercase tracking-widest`}
						>
							{t('clan.layout.blocked.reason')}:{' '}
							{profile.clan.block_reason}
						</p>
					)}
				</div>
			</div>
		)
	}

	if (profile.clan.status === 'FROZEN') {
		const isLeader =
			characters?.some(
				(c) =>
					c.username.toLowerCase() ===
					profile.clan!.leader.toLowerCase()
			) ?? false

		if (!isLeader) {
			return (
				<div className="flex flex-col gap-4">
					<ClanSelector
						myClans={myClans}
						profile={profile}
						switchMutation={switchMutation}
					/>
					<div className="flex flex-col items-center gap-4 rounded-xl bg-background p-8 text-center">
						<Icon className="text-4xl" icon="lucide:snowflake" />
						<h1
							className={`${unbounded.className} font-semibold text-xl`}
						>
							{t.rich('clan.layout.frozen.titleMember', {
								name: profile.clan.name,
								span: (chunks) => (
									<span className="text-border">
										{chunks}
									</span>
								),
								tag: profile.clan.tag,
							})}
						</h1>
						<p className="font-semibold">
							{t('clan.layout.frozen.descMember')}
						</p>
					</div>
				</div>
			)
		}

		return (
			<div className="flex flex-col gap-4">
				<ClanSelector
					myClans={myClans}
					profile={profile}
					switchMutation={switchMutation}
				/>
				<div className="flex flex-col items-center gap-4 rounded-xl bg-background p-8 text-center">
					<Icon className="text-4xl" icon="lucide:crown" />
					<h1
						className={`${unbounded.className} font-semibold text-xl`}
					>
						{t.rich('clan.layout.frozen.title', {
							name: profile.clan.name,
							span: (chunks) => (
								<span className="text-border">{chunks}</span>
							),
							tag: profile.clan.tag,
						})}
					</h1>
					<p className="whitespace-pre-line font-semibold">
						{t('clan.layout.frozen.desc')}
					</p>
					<Button
						className="w-full"
						loading={registerMutation.isPending}
						onClick={() => registerMutation.mutate()}
						variant="primary"
					>
						{t('clan.layout.frozen.activate')}
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<ClanSelector
				myClans={myClans}
				profile={profile}
				switchMutation={switchMutation}
			/>
			{children}
		</div>
	)
}

function ClanSelector({
	myClans,
	profile,
	switchMutation,
}: {
	myClans: MyClanProfile[] | undefined
	profile: UserClanProfile
	switchMutation: ReturnType<typeof useMutation<void, Error, string>>
}) {
	if ((myClans?.length ?? 0) <= 1) return null
	if (!profile.clan) return null

	return (
		<DropdownMenu
			className={`${montserrat.className} text-sm`}
			items={(myClans ?? []).map((c) => ({
				key: c.clanId,
				content: (
					<div
						className="flex w-full cursor-pointer items-center justify-between gap-2 px-2 py-1"
						onClick={() => {
							if (c.clanId !== profile.clanId) {
								switchMutation.mutate(c.clanId)
							}
						}}
					>
						<span className="font-semibold">
							[{c.clan.tag}] {c.clan.name}
						</span>
						{c.clanId === profile.clanId && (
							<Icon className="text-lg" icon="lucide:check" />
						)}
					</div>
				),
			}))}
			title={`[${profile.clan.tag}] ${profile.clan.name}`}
		/>
	)
}
