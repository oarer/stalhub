'use client'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanQueries } from '@/queries/clan/clan.queries'
import { clanService } from '@/services/clan/clan.service'
import type { BotLinkToken, ClanSchedule } from '@/types/clan/clan.type'
import { useClanRoles } from './useClanRoles'

export function useClanSettings() {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const { profile, isLeader, isOfficer } = useClanRoles()
	const { data: settings } = useSuspenseQuery(clanQueries.getSettings())
	const { data: guilds } = useSuspenseQuery(clanQueries.getBotGuilds())
	const clan = profile!.clan!

	const [isPublic, setIsPublic] = useState(clan.is_public ?? false)
	const [recruiting, setRecruiting] = useState(clan.recruiting ?? false)
	const [schedule, setSchedule] = useState<ClanSchedule>(settings.schedule)

	useEffect(() => {
		setSchedule(settings.schedule)
	}, [settings.schedule])

	const settingsMutation = useMutation({
		mutationFn: (body: { is_public?: boolean }) =>
			clanService.updatePublicSettings(body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clan', 'me'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'catalog'] })
			toast.success(t('clan.settings.toasts.saved'))
		},
		onError: () => toast.error(t('clan.settings.toasts.saveError')),
	})

	const recruitingMutation = useMutation({
		mutationFn: (value: boolean) => clanService.updateRecruiting(value),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clan', 'me'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'catalog'] })
			toast.success(t('clan.settings.toasts.recruitingUpdated'))
		},
		onError: () => toast.error(t('clan.settings.toasts.recruitingError')),
	})

	const scheduleMutation = useMutation({
		mutationFn: (body: Partial<ClanSchedule>) =>
			clanService.updateSchedule(body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clan', 'settings'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'me'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'catalog'] })
			toast.success(t('clan.settings.toasts.scheduleSaved'))
		},
		onError: () => toast.error(t('clan.settings.toasts.scheduleError')),
	})

	const syncMutation = useMutation({
		mutationFn: (region?: string) =>
			clanService.sync(region ? { region } : undefined),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ['clan', 'me'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'members'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'grenades'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'catalog'] })
			toast.success(
				t('clan.settings.toasts.synced', { count: res.memberCount })
			)
		},
		onError: () => toast.error(t('clan.settings.toasts.syncError')),
	})

	const [linkToken, setLinkToken] = useState<BotLinkToken | null>(null)
	const [unlinkPendingId, setUnlinkPendingId] = useState<string | null>(
		null
	)

	const linkBotMutation = useMutation({
		mutationFn: () => clanService.discordLink(),
		onSuccess: (res) => {
			setLinkToken(res)
			toast.success(t('clan.settings.toasts.botTokenCreated'))
		},
		onError: () => toast.error(t('clan.settings.toasts.botTokenError')),
	})

	const unlinkBotMutation = useMutation({
		mutationFn: (guildId: string) => clanService.unlinkBotGuild(guildId),
		onMutate: (guildId) => setUnlinkPendingId(guildId),
		onSettled: () => setUnlinkPendingId(null),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['clan', 'bot', 'guilds'],
			})
			toast.success(t('clan.settings.toasts.botUnlinked'))
		},
		onError: () => toast.error(t('clan.settings.toasts.botUnlinkError')),
	})

	const freezeMutation = useMutation({
		mutationFn: () => clanService.freeze(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clan'] })
			toast.success(t('clan.settings.toasts.frozen'))
		},
		onError: () => toast.error(t('clan.settings.toasts.freezeError')),
	})

	const togglePublic = (value: boolean) => {
		setIsPublic(value)
		settingsMutation.mutate({ is_public: value })
	}

	const toggleRecruiting = (value: boolean) => {
		setRecruiting(value)
		recruitingMutation.mutate(value)
	}

	const setScheduleField = (
		key: keyof ClanSchedule,
		value: number | boolean
	) => {
		setSchedule((prev) => ({ ...prev, [key]: value }))
	}

	const saveSchedule = () => {
		scheduleMutation.mutate(schedule)
	}

	const sync = () => syncMutation.mutate(undefined)
	const freeze = () => freezeMutation.mutate()
	const generateBotToken = () => linkBotMutation.mutate()
	const unlinkBot = (guildId: string) => unlinkBotMutation.mutate(guildId)
	const closeBotToken = () => setLinkToken(null)

	return {
		clan,
		isLeader,
		isOfficer,
		isPublic,
		recruiting,
		schedule,
		guilds,
		linkToken,
		togglePublic,
		toggleRecruiting,
		setScheduleField,
		saveSchedule,
		sync,
		freeze,
		generateBotToken,
		unlinkBot,
		closeBotToken,
		isPublicPending: settingsMutation.isPending,
		isRecruitingPending: recruitingMutation.isPending,
		isSchedulePending: scheduleMutation.isPending,
		isSyncPending: syncMutation.isPending,
		isFreezePending: freezeMutation.isPending,
		isBotLinkPending: linkBotMutation.isPending,
		unlinkPendingId,
	}
}
