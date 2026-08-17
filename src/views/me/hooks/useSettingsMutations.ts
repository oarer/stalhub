'use client'

import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { loadoutService } from '@/services/loadout/loadout.service'
import { userService } from '@/services/user/user.service'
import { EMPTY_LOADOUT, type LoadoutData } from '@/types/loadout/loadout.type'
import type { UpdateUserSettingsDto } from '@/types/user.type'

export type ProviderName = 'discord' | 'telegram' | 'exbo'

const getApiError = (err: unknown): string | undefined =>
	(err as { response?: { data?: { error?: string } } })?.response?.data?.error

export function useSettingsMutations(
	loadout: { data: LoadoutData; is_public: boolean } | null | undefined
) {
	const queryClient = getQueryClient()
	const t = useTranslations()

	const updateMutation = useMutation({
		mutationFn: (data: UpdateUserSettingsDto) => userService.patchMe(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user'] })
			toast.success(t('me.settings.toastSaved'))
		},
		onError: () => {
			toast.error(t('me.settings.toastSaveError'))
		},
	})

	const profileMutation = useMutation({
		mutationFn: (data: UpdateUserSettingsDto) => userService.patchMe(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user'] })
			toast.success(t('me.settings.toastProfileSaved'))
		},
		onError: (err) => {
			const message = getApiError(err)
			if (message) toast.error(message)
			else toast.error(t('me.settings.toastProfileSaveError'))
		},
	})

	const bannerMutation = useMutation({
		mutationFn: (data: UpdateUserSettingsDto) => userService.patchMe(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user'] })
			toast.success(t('me.settings.toastBannerSaved'))
		},
		onError: () => {
			toast.error(t('me.settings.toastBannerSaveError'))
		},
	})

	const layoutMutation = useMutation({
		mutationFn: (data: UpdateUserSettingsDto) => userService.patchMe(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user'] })
			toast.success(t('me.settings.toastLayoutSaved'))
		},
		onError: () => {
			toast.error(t('me.settings.toastLayoutSaveError'))
		},
	})

	const regionMutation = useMutation({
		mutationFn: (region: string) =>
			userService.patchMe({ region } as UpdateUserSettingsDto),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user'] })
			queryClient.invalidateQueries({ queryKey: ['clan'] })
			toast.success(t('me.settings.toastRegionSaved'))
		},
		onError: () => {
			toast.error(t('me.settings.toastRegionSaveError'))
		},
	})

	const uploadBannerMutation = useMutation({
		mutationFn: (file: File) => userService.uploadBanner(file),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user'] })
			toast.success(t('me.settings.toastBannerUploaded'))
		},
		onError: () => {
			toast.error(t('me.settings.toastBannerUploadError'))
		},
	})

	const avatarMutation = useMutation({
		mutationFn: (source: 'discord' | 'telegram') =>
			userService.patchMe({ avatar: source.toUpperCase() as never }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user', 'settings'] })
			toast.success(t('me.settings.toastAvatarSaved'))
		},
		onError: () => {
			toast.error(t('me.settings.toastAvatarSaveError'))
		},
	})

	const uploadAvatarMutation = useMutation({
		mutationFn: (file: File) => userService.uploadAvatar(file),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user', 'settings'] })
			toast.success(t('me.settings.toastAvatarUploaded'))
		},
		onError: () => {
			toast.error(t('me.settings.toastAvatarUploadError'))
		},
	})

	const deleteAvatarMutation = useMutation({
		mutationFn: () => userService.deleteAvatar(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user', 'settings'] })
			toast.success(t('me.settings.toastAvatarRemoved'))
		},
		onError: () => {
			toast.error(t('me.settings.toastAvatarRemoveError'))
		},
	})

	const saveLoadoutMutation = useMutation({
		mutationFn: (data: LoadoutData) =>
			loadoutService.upsert(data, loadout?.is_public ?? false),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['loadout'] })
			toast.success(t('me.settings.toastLoadoutSaved'))
		},
		onError: () => {
			toast.error(t('me.settings.toastLoadoutSaveError'))
		},
	})

	const toggleLoadoutPublicMutation = useMutation({
		mutationFn: (isPublic: boolean) =>
			loadoutService.upsert(loadout?.data ?? EMPTY_LOADOUT, isPublic),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['loadout'] })
			toast.success(t('me.settings.toastDisplaySaved'))
		},
		onError: () => {
			toast.error(t('me.settings.toastDisplayError'))
		},
	})

	const socialLinksMutation = useMutation({
		mutationFn: (links: Record<string, string>) =>
			userService.patchMe({ social_links: links }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user'] })
			toast.success(t('me.settings.socialLinksSaved'))
		},
		onError: () => {
			toast.error(t('me.settings.socialLinksSaveError'))
		},
	})

	const deleteSessionMutation = useMutation({
		mutationFn: (id: number) => userService.deleteSession(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user', 'sessions'] })
			toast.success(t('me.settings.toastSessionDeleted'))
		},
		onError: () => {
			toast.error(t('me.settings.toastSessionDeleteError'))
		},
	})

	const deleteAllSessionsMutation = useMutation({
		mutationFn: () => userService.deleteAllSessions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user', 'sessions'] })
			toast.success(t('me.settings.toastSessionsDeleted'))
		},
		onError: () => {
			toast.error(t('me.settings.toastSessionsDeleteError'))
		},
	})

	const linkMutation = useMutation({
		mutationFn: (provider: ProviderName) =>
			userService.getProviderLinkUrl(provider),
		onSuccess: (url) => {
			window.location.href = url
		},
		onError: () => {
			toast.error(t('me.settings.toastLinkError'))
		},
	})

	const unlinkMutation = useMutation({
		mutationFn: (provider: ProviderName) =>
			userService.unlinkProvider(provider),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user'] })
			toast.success(t('me.settings.toastUnlinked'))
		},
		onError: () => {
			toast.error(t('me.settings.toastUnlinkError'))
		},
	})

	const deleteAccountMutation = useMutation({
		mutationFn: () => userService.deleteMe(),
		onSuccess: () => {
			toast.success(t('me.settings.toastAccountDeleted'))
			window.location.href = '/'
		},
		onError: () => {
			toast.error(t('me.settings.toastAccountDeleteError'))
		},
	})

	return {
		updateMutation,
		profileMutation,
		bannerMutation,
		layoutMutation,
		regionMutation,
		uploadBannerMutation,
		avatarMutation,
		uploadAvatarMutation,
		deleteAvatarMutation,
		saveLoadoutMutation,
		toggleLoadoutPublicMutation,
		deleteSessionMutation,
		deleteAllSessionsMutation,
		socialLinksMutation,
		linkMutation,
		unlinkMutation,
		deleteAccountMutation,
	}
}
