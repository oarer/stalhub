'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanQueries } from '@/queries/clan/clan.queries'
import { userQueries } from '@/queries/user/user.queries'
import { clanService } from '@/services/clan/clan.service'

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
	const { data: user } = useSuspenseQuery(userQueries.getMe())
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

	if (profile.clan.status === 'FROZEN') {
		const isLeader =
			profile.clan.leader.toLowerCase() ===
			user.providers.exbo?.username?.toLowerCase()

		if (!isLeader) {
			return (
				<div className="flex flex-col items-center gap-4 rounded-xl bg-background p-8 text-center">
					<Icon className="text-4xl" icon="lucide:snowflake" />
					<h1 className={`${unbounded.className} font-semibold text-xl`}>
						{t.rich('clan.layout.frozen.titleMember', {
							name: profile.clan.name,
							span: (chunks) => (
								<span className="text-border">{chunks}</span>
							),
							tag: profile.clan.tag,
						})}
					</h1>
					<p className="font-semibold">
						{t('clan.layout.frozen.descMember')}
					</p>
				</div>
			)
		}

		return (
			<div className="flex flex-col items-center gap-4 rounded-xl bg-background p-8 text-center">
				<Icon className="text-4xl" icon="lucide:crown" />
				<h1 className={`${unbounded.className} font-semibold text-xl`}>
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
		)
	}

	return <div className="flex flex-col gap-4">{children}</div>
}
