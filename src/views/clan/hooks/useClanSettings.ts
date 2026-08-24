'use client'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanQueries } from '@/queries/clan/clan.queries'
import { clanService } from '@/services/clan/clan.service'
import type {
	BoostMode,
	BotLinkToken,
	ClanSchedule,
	SundayActivity,
} from '@/types/clan/clan.type'
import {
	type RecruitmentFormState,
	toRecruitmentPayload,
} from '../utils/recruitment'
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
	const [recruitmentForm, setRecruitmentForm] =
		useState<RecruitmentFormState>({
			leader_discord: settings.leader_discord,
			clan_discord: settings.clan_discord ?? '',
			paid_recruitment: settings.paid_recruitment,
			tier: settings.tier,
			guilds_per_week: settings.guilds_per_week?.toString() ?? '',
		})
	const savedLeaderDiscord = settings.leader_discord.trim()
	const [schedule, setSchedule] = useState<ClanSchedule>(settings.schedule)

	useEffect(() => {
		setSchedule(settings.schedule)
	}, [settings.schedule])
	useEffect(() => {
		setRecruitmentForm({
			leader_discord: settings.leader_discord,
			clan_discord: settings.clan_discord ?? '',
			paid_recruitment: settings.paid_recruitment,
			tier: settings.tier,
			guilds_per_week: settings.guilds_per_week?.toString() ?? '',
		})
	}, [settings])

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
		onSuccess: (_result, value) => {
			setRecruiting(value)
			queryClient.invalidateQueries({ queryKey: ['clan', 'me'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'catalog'] })
			toast.success(t('clan.settings.toasts.recruitingUpdated'))
		},
		onError: () => toast.error(t('clan.settings.toasts.recruitingError')),
	})

	const recruitmentMutation = useMutation({
		mutationFn: () =>
			clanService.updateRecruitment(
				toRecruitmentPayload(recruitmentForm)
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clan', 'settings'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'me'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'catalog'] })
			toast.success(t('clan.settings.toasts.recruitmentSaved'))
		},
		onError: () => toast.error(t('clan.settings.toasts.recruitmentError')),
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
		mutationFn: (region: string) => clanService.sync({ region }),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ['clan', 'me'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'members'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'grenades'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'catalog'] })
			toast.success(
				t('clan.settings.toasts.synced', { count: res.member_count })
			)
		},
		onError: () => toast.error(t('clan.settings.toasts.syncError')),
	})

	const [linkToken, setLinkToken] = useState<BotLinkToken | null>(null)
	const [unlinkPendingId, setUnlinkPendingId] = useState<string | null>(null)

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

	const boostModeMutation = useMutation({
		mutationFn: (boostMode: BoostMode) =>
			clanService.updateBoostMode(boostMode),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clan', 'settings'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'grenades'] })
			toast.success(t('clan.settings.toasts.saved'))
		},
		onError: () => toast.error(t('clan.settings.toasts.saveError')),
	})

	const grenadeModeMutation = useMutation({
		mutationFn: (grenadeMode: BoostMode) =>
			clanService.updateGrenadeMode(grenadeMode),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clan', 'settings'] })
			queryClient.invalidateQueries({ queryKey: ['clan', 'grenades'] })
			toast.success(t('clan.settings.toasts.saved'))
		},
		onError: () => toast.error(t('clan.settings.toasts.saveError')),
	})

	const togglePublic = (value: boolean) => {
		setIsPublic(value)
		settingsMutation.mutate({ is_public: value })
	}

	const toggleRecruiting = (value: boolean) => {
		recruitingMutation.mutate(value)
	}
	const setRecruitmentField = <K extends keyof RecruitmentFormState>(
		key: K,
		value: RecruitmentFormState[K]
	) => setRecruitmentForm((previous) => ({ ...previous, [key]: value }))
	const saveRecruitment = () => recruitmentMutation.mutate()

	const setScheduleField = (
		key: keyof ClanSchedule,
		value: number | boolean | SundayActivity
	) => {
		setSchedule((prev) => ({ ...prev, [key]: value }))
	}

	const saveSchedule = () => {
		scheduleMutation.mutate(schedule)
	}

	const sync = () => syncMutation.mutate(clan.region)
	const freeze = () => freezeMutation.mutate()
	const generateBotToken = () => linkBotMutation.mutate()
	const unlinkBot = (guildId: string) => unlinkBotMutation.mutate(guildId)
	const closeBotToken = () => setLinkToken(null)
	const setBoostMode = (boostMode: BoostMode) =>
		boostModeMutation.mutate(boostMode)
	const setGrenadeMode = (grenadeMode: BoostMode) =>
		grenadeModeMutation.mutate(grenadeMode)

	return {
		clan,
		settings,
		isLeader,
		isOfficer,
		isPublic,
		recruiting,
		recruitmentForm,
		hasSavedLeaderDiscord: Boolean(savedLeaderDiscord),
		schedule,
		guilds,
		linkToken,
		togglePublic,
		toggleRecruiting,
		setRecruitmentField,
		saveRecruitment,
		setScheduleField,
		saveSchedule,
		sync,
		freeze,
		setBoostMode,
		setGrenadeMode,
		generateBotToken,
		unlinkBot,
		closeBotToken,
		isPublicPending: settingsMutation.isPending,
		isRecruitingPending: recruitingMutation.isPending,
		isRecruitmentPending: recruitmentMutation.isPending,
		isSchedulePending: scheduleMutation.isPending,
		isSyncPending: syncMutation.isPending,
		isFreezePending: freezeMutation.isPending,
		isBotLinkPending: linkBotMutation.isPending,
		unlinkPendingId,
	}
}
