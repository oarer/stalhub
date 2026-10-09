'use client'

import { Icon } from '@iconify/react'
import { useMutation } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminUserService } from '@/services/admin/user.service'
import type { AdminUserDetail } from '@/types/admin.type'

export function UserCustomizationTab({
	userId,
	user,
}: {
	userId: number
	user: AdminUserDetail
}) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const [editLayout, setEditLayout] = useState(
		user.customization?.layout ?? 'CLASSIC'
	)
	const [editCardBackground, setEditCardBackground] = useState(
		user.customization?.card_background ?? 'NONE'
	)
	const [editCardColor, setEditCardColor] = useState(
		user.customization?.card_color ?? '#171717'
	)
	const [editAvatar, setEditAvatar] = useState<string>(
		user.customization?.avatar ?? 'NONE'
	)

	const [bannerMode, setBannerMode] = useState<'COLOR' | 'IMAGE' | 'NONE'>(
		user.customization?.banner_mode ?? 'NONE'
	)
	const [bannerType, setBannerType] = useState<'BACKGROUND' | 'HEADER'>(
		user.customization?.banner_type ?? 'HEADER'
	)
	const [bannerColor, setBannerColor] = useState(
		user.customization?.banner_color ?? '#171717'
	)
	const [bannerImage, setBannerImage] = useState(
		user.customization?.banner_image ?? ''
	)

	const invalidateUser = () =>
		queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] })

	const customizationMutation = useMutation({
		mutationFn: () =>
			adminUserService.updateCustomization(userId, {
				layout: editLayout as 'CLASSIC' | 'MODERN' | 'COMPACT',
				card_background: editCardBackground as
					| 'COLOR'
					| 'AVATAR'
					| 'NONE',
				card_color: editCardColor,
				avatar:
					editAvatar === 'NONE'
						? null
						: (editAvatar as 'DISCORD' | 'TELEGRAM'),
			}),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.customizationUpdated'))
			invalidateUser()
		},
		onError: () =>
			toast.error(t('admin.userDetail.toast.customizationUpdateError')),
	})

	const bannerMutation = useMutation({
		mutationFn: () =>
			adminUserService.updateCustomization(userId, {
				banner_mode: bannerMode,
				banner_type: bannerType,
				banner_color: bannerColor,
				banner_image: bannerImage || null,
			}),
		onSuccess: () => {
			toast.success(t('admin.userDetail.toast.bannerUpdated'))
			invalidateUser()
		},
		onError: () =>
			toast.error(t('admin.userDetail.toast.bannerUpdateError')),
	})

	const uploadBannerMutation = useMutation({
		mutationFn: (file: File) => adminUserService.uploadBanner(userId, file),
		onSuccess: (res) => {
			toast.success(t('admin.userDetail.toast.bannerUploaded'))
			setBannerImage(res.banner_image)
			setBannerMode('IMAGE')
			invalidateUser()
		},
		onError: () =>
			toast.error(t('admin.userDetail.toast.bannerUploadError')),
	})

	return (
		<>
			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:palette" />
						{t('admin.userDetail.customization.title')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-4">
						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							<Combobox
								onValueChange={setEditLayout}
								options={[
									{
										value: 'CLASSIC',
										label: 'admin.userDetail.customization.layoutClassic',
									},
									{
										value: 'MODERN',
										label: 'admin.userDetail.customization.layoutModern',
									},
									{
										value: 'COMPACT',
										label: 'admin.userDetail.customization.layoutCompact',
									},
								]}
								placeholder="admin.userDetail.customization.layout"
								value={editLayout}
							/>
							<Combobox
								onValueChange={setEditCardBackground}
								options={[
									{
										value: 'NONE',
										label: 'admin.userDetail.banner.modeNone',
									},
									{
										value: 'COLOR',
										label: 'admin.userDetail.customization.cardBackgroundColor',
									},
									{
										value: 'AVATAR',
										label: 'admin.userDetail.customization.cardBackgroundAvatar',
									},
								]}
								placeholder="admin.userDetail.customization.cardBackground"
								value={editCardBackground}
							/>
							<Combobox
								onValueChange={setEditAvatar}
								options={[
									{
										value: 'NONE',
										label: 'admin.userDetail.customization.avatarNone',
									},
									{
										value: 'DISCORD',
										label: 'admin.userDetail.customization.avatarDiscord',
									},
									{
										value: 'TELEGRAM',
										label: 'admin.userDetail.customization.avatarTelegram',
									},
								]}
								placeholder="admin.userDetail.customization.avatar"
								value={editAvatar}
							/>
						</div>

						{editCardBackground === 'COLOR' && (
							<div className="flex items-center gap-3">
								<input
									className="h-9 w-16 cursor-pointer rounded border-2 border-primary bg-card"
									onChange={(e) =>
										setEditCardColor(e.target.value)
									}
									type="color"
									value={editCardColor}
								/>
								<Input
									label="admin.userDetail.customization.cardColor"
									onChange={(e) =>
										setEditCardColor(e.target.value)
									}
									value={editCardColor}
								/>
							</div>
						)}

						<div className="flex items-center gap-3">
							<Button
								loading={customizationMutation.isPending}
								onClick={() => customizationMutation.mutate()}
							>
								{t('admin.userDetail.save')}
							</Button>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root className="mt-4">
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:image" />
						{t('admin.userDetail.banner.title')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-4">
						<div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-primary">
							{bannerMode === 'COLOR' && (
								<div
									className="h-full w-full"
									style={{
										backgroundColor: bannerColor,
									}}
								/>
							)}
							{bannerMode === 'IMAGE' && bannerImage && (
								<Image
									alt="banner"
									className="h-full w-full object-cover"
									height={128}
									src={`${process.env.NEXT_PUBLIC_CDN_URL}${bannerImage}`}
									unoptimized
									width={512}
								/>
							)}
							{bannerMode === 'NONE' ||
								(bannerMode === 'IMAGE' && !bannerImage && (
									<span className="text-neutral-400 text-sm">
										{t('admin.userDetail.banner.noBanner')}
									</span>
								))}
						</div>

						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							<Combobox
								onValueChange={(v) =>
									setBannerMode(
										v as 'COLOR' | 'IMAGE' | 'NONE'
									)
								}
								options={[
									{
										value: 'NONE',
										label: 'admin.userDetail.banner.modeNone',
									},
									{
										value: 'COLOR',
										label: 'admin.userDetail.banner.modeColor',
									},
									{
										value: 'IMAGE',
										label: 'admin.userDetail.banner.modeImage',
									},
								]}
								placeholder="admin.userDetail.banner.mode"
								value={bannerMode}
							/>
							<Combobox
								onValueChange={(v) =>
									setBannerType(v as 'BACKGROUND' | 'HEADER')
								}
								options={[
									{
										value: 'HEADER',
										label: 'admin.userDetail.banner.typeHeader',
									},
									{
										value: 'BACKGROUND',
										label: 'admin.userDetail.banner.typeBackground',
									},
								]}
								placeholder="admin.userDetail.banner.type"
								value={bannerType}
							/>
						</div>

						{bannerMode === 'COLOR' && (
							<div className="flex items-center gap-3">
								<input
									className="h-9 w-16 cursor-pointer rounded border-2 border-primary bg-card"
									onChange={(e) =>
										setBannerColor(e.target.value)
									}
									type="color"
									value={bannerColor}
								/>
								<Input
									label="admin.userDetail.banner.color"
									onChange={(e) =>
										setBannerColor(e.target.value)
									}
									value={bannerColor}
								/>
							</div>
						)}

						{bannerMode === 'IMAGE' && (
							<div className="flex flex-col gap-3">
								<Input
									label="admin.userDetail.banner.imageUrl"
									onChange={(e) =>
										setBannerImage(e.target.value)
									}
									value={bannerImage}
								/>
								<label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border-2 border-primary px-4 py-2 font-semibold text-sm transition-colors duration-300 hover:bg-accent">
									<Icon icon="lucide:upload" />
									{t('admin.userDetail.banner.upload')}
									<input
										accept="image/png,image/jpeg,image/webp"
										className="hidden"
										disabled={
											uploadBannerMutation.isPending
										}
										onChange={(e) => {
											const file = e.target.files?.[0]
											if (file) {
												uploadBannerMutation.mutate(
													file
												)
											}
										}}
										type="file"
									/>
								</label>
							</div>
						)}

						<div className="flex items-center gap-3">
							<Button
								loading={bannerMutation.isPending}
								onClick={() => bannerMutation.mutate()}
							>
								{t('admin.userDetail.banner.save')}
							</Button>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</>
	)
}
