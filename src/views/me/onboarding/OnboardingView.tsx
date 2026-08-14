'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { userQueries } from '@/queries/user/user.queries'
import { userService } from '@/services/user/user.service'
import { Regions } from '@/types/api.type'
import type {
	BannerMode,
	BannerType,
	CardBackground,
	Layout,
	User,
} from '@/types/user.type'
import {
	BANNER_MODES,
	BANNER_TYPES,
	findLabel,
	LAYOUT_TYPES,
} from '@/views/me/components/settings/constants'
import { OptionDropdown } from '@/views/me/components/settings/OptionDropdown'

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,32}$/

const regionOptions = Object.values(Regions).map((region) => ({
	value: region,
	label: 'region.' + region,
}))

const CARD_BACKGROUNDS: { value: CardBackground; label: string }[] = [
	{ value: 'NONE', label: 'me.bg.none' },
	{ value: 'COLOR', label: 'me.bg.color' },
	{ value: 'AVATAR', label: 'me.bg.avatar' },
]

const DEFAULT_BANNER_COLOR = '#0f4c81'
const DEFAULT_CARD_COLOR = '#171717'

type StepKey =
	| 'welcome'
	| 'name'
	| 'username'
	| 'region'
	| 'layout'
	| 'banner'
	| 'card'
	| 'finish'

const stepIcons: Record<StepKey, string> = {
	welcome: 'lucide:wave',
	name: 'lucide:user',
	username: 'lucide:at-sign',
	region: 'lucide:globe',
	layout: 'lucide:layout-template',
	banner: 'lucide:image',
	card: 'lucide:credit-card',
	finish: 'lucide:sparkles',
}

function LayoutThumb({ layout }: { layout: Layout }) {
	return (
		<div className="flex h-20 w-full items-start gap-1.5 rounded-lg bg-background p-2">
			{layout === 'CLASSIC' && (
				<>
					<div className="flex h-full w-14 flex-col gap-1.5">
						<div className="size-7 shrink-0 rounded-sm bg-border-secondary" />
						<div className="h-1.5 w-10 rounded bg-border-secondary" />
						<div className="h-1.5 w-8 rounded bg-border-secondary" />
					</div>
					<div className="flex flex-1 flex-col gap-1.5">
						<div className="h-2 w-16 rounded bg-border-secondary" />
						<div className="h-1.5 w-full rounded bg-border-secondary" />
						<div className="h-1.5 w-full rounded bg-border-secondary" />
						<div className="h-1.5 w-3/4 rounded bg-border-secondary" />
					</div>
				</>
			)}
			{layout === 'MODERN' && (
				<div className="flex h-full w-full flex-col gap-1.5">
					<div className="h-5 w-full rounded-sm bg-border-secondary" />
					<div className="flex items-center gap-1.5">
						<div className="size-7 shrink-0 rounded-sm bg-border-secondary" />
						<div className="flex flex-1 flex-col gap-1.5">
							<div className="h-2 w-16 rounded bg-border-secondary" />
							<div className="h-1.5 w-24 rounded bg-border-secondary" />
						</div>
					</div>
				</div>
			)}
			{layout === 'COMPACT' && (
				<div className="flex h-full w-full flex-col gap-1.5">
					<div className="flex w-full items-center gap-1.5 rounded-sm bg-accent/40 p-1.5">
						<div className="size-7 shrink-0 rounded-sm bg-border-secondary" />
						<div className="h-2 w-20 rounded bg-border-secondary" />
					</div>
					<div className="h-1.5 w-full rounded bg-border-secondary" />
					<div className="h-1.5 w-full rounded bg-border-secondary" />
				</div>
			)}
		</div>
	)
}

export default function OnboardingView({ user: userProp }: { user?: User }) {
	const t = useTranslations()
	const router = useRouter()
	const queryClient = getQueryClient()

	const { data: queryUser } = useSuspenseQuery(userQueries.getMe())

	const user = userProp ?? queryUser

	const [step, setStep] = useState<number>(0)
	const [name, setName] = useState(user.name ?? '')
	const [username, setUsername] = useState(user.username)
	const [region, setRegion] = useState<string>('')
	const [layout, setLayout] = useState<Layout>(
		(user.customization?.layout as Layout) ?? 'CLASSIC'
	)
	const [bannerMode, setBannerMode] = useState<BannerMode>(
		user.customization?.bannerMode ?? 'NONE'
	)
	const [bannerType, setBannerType] = useState<BannerType>(
		user.customization?.bannerType ?? 'HEADER'
	)
	const [bannerColor, setBannerColor] = useState<string>(
		user.customization?.bannerColor ?? DEFAULT_BANNER_COLOR
	)
	const [bannerImage, setBannerImage] = useState<string>(
		user.customization?.bannerImage ?? ''
	)
	const [cardBackground, setCardBackground] = useState<CardBackground>(
		user.customization?.cardBackground ?? 'NONE'
	)
	const [cardColor, setCardColor] = useState<string>(
		user.customization?.cardColor ?? DEFAULT_CARD_COLOR
	)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const hasExbo = Boolean(user.providers.exbo)

	const steps = useMemo<StepKey[]>(
		() => [
			'welcome',
			'name',
			'username',
			...(hasExbo ? (['region'] as const) : []),
			'layout',
			'banner',
			'card',
			'finish',
		],
		[hasExbo]
	)

	const currentStep = steps[step]
	const isLastStep = step === steps.length - 1
	const isWelcome = currentStep === 'welcome'

	const canProceed = {
		welcome: true,
		name: name.trim().length > 0,
		username: USERNAME_PATTERN.test(username),
		region: region.length > 0,
		layout: true,
		banner: true,
		card: true,
		finish: true,
	}[currentStep]

	const completeMutation = useMutation({
		mutationFn: () =>
			userService.completeOnboarding({
				name: name.trim() || undefined,
				username: username !== user.username ? username : undefined,
				region: hasExbo ? region : undefined,
				layout,
				bannerMode,
				bannerType,
				bannerColor,
				bannerImage: bannerImage || undefined,
				cardBackground,
				cardColor,
			}),
		onSuccess: async () => {
			toast.success(t('onboarding.toastSuccess'))
			await queryClient.invalidateQueries({ queryKey: ['user'] })
			router.replace('/me')
		},
		onError: () => {
			toast.error(t('onboarding.toastError'))
		},
	})

	const handleNext = () => {
		if (canProceed === false) return
		setStep((s) => Math.min(s + 1, steps.length - 1))
	}

	const handleBack = () => setStep((s) => Math.max(s - 1, 0))

	const handleBannerUpload = (file: File) => {
		toast.loading(t('onboarding.uploading'), { id: 'onboarding-upload' })
		userService
			.uploadBanner(file)
			.then((res) => {
				toast.dismiss('onboarding-upload')
				setBannerImage(res.banner_image)
				setBannerMode('IMAGE')
			})
			.catch(() => {
				toast.dismiss('onboarding-upload')
				toast.error(t('onboarding.uploadError'))
			})
	}

	useEffect(() => {
		if (user.onboarded) {
			router.replace('/me')
		}
	}, [user.onboarded, router])

	if (user.onboarded) return null

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="flex min-h-dvh w-full items-center justify-center px-4 py-8"
			initial={{ opacity: 0, y: 16 }}
			transition={{ duration: 0.4, ease: 'easeOut' }}
		>
			<div className="flex w-full max-w-xl flex-col gap-5">
				<header className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Icon className="text-2xl" icon="lucide:sparkles" />
							<h1
								className={`${unbounded.className} font-semibold text-xl`}
							>
								{t('onboarding.title')}
							</h1>
						</div>
						{!isWelcome && (
							<span className="font-semibold text-sm text-text-accent">
								{t('onboarding.stepOf', {
									current: step + 1,
									total: steps.length,
								})}
							</span>
						)}
					</div>
					<div className="flex gap-1.5">
						{steps.map((s, i) => (
							<div
								className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
									i <= step
										? 'bg-accent'
										: 'bg-border-secondary'
								}`}
								key={s}
							/>
						))}
					</div>
				</header>

				<div className="relative flex min-h-85 overflow-hidden rounded-xl bg-background p-6 ring-1 ring-border/50">
					<AnimatePresence initial={false} mode="wait">
						<motion.div
							animate={{ opacity: 1, scale: 1, x: 0 }}
							className="flex w-full flex-col justify-center gap-4"
							exit={{ opacity: 0, scale: 0.98, x: -20 }}
							initial={{ opacity: 0, scale: 0.98, x: 20 }}
							key={currentStep}
							transition={{ duration: 0.25, ease: 'easeOut' }}
						>
							{currentStep === 'welcome' && (
								<div className="flex flex-col items-center gap-3 py-4 text-center">
									<div className="flex size-16 items-center justify-center rounded-full bg-accent/50">
										<Icon
											className="text-4xl"
											icon="lucide:waves-horizontal"
										/>
									</div>
									<h2
										className={`${unbounded.className} font-semibold text-2xl`}
									>
										{t('onboarding.welcome.title')}
									</h2>
									<p className="font-semibold text-text-accent">
										{t('onboarding.welcome.subtitle')}
									</p>
								</div>
							)}

							{currentStep !== 'welcome' && (
								<div className="flex flex-col gap-3">
									<div className="flex items-center gap-2">
										<Icon
											className="text-xl"
											icon={stepIcons[currentStep]}
										/>
										<h2 className="font-semibold text-lg">
											{t(
												`onboarding.step.${currentStep}.title`
											)}
										</h2>
									</div>

									{currentStep === 'name' && (
										<>
											<p className="font-semibold text-sm text-text-accent">
												{t('onboarding.step.name.desc')}
											</p>
											<Input
												className="text-base"
												label="me.settings.name"
												maxLength={32}
												onChange={(e) =>
													setName(e.target.value)
												}
												value={name}
											/>
										</>
									)}

									{currentStep === 'username' && (
										<>
											<p className="font-semibold text-sm text-text-accent">
												{t(
													'onboarding.step.username.desc'
												)}
											</p>
											<Input
												className="text-base"
												label="me.settings.username"
												maxLength={32}
												onChange={(e) =>
													setUsername(e.target.value)
												}
												value={username}
											/>
											{!USERNAME_PATTERN.test(
												username
											) && (
												<p className="font-semibold text-red-400 text-xs">
													{t(
														'me.settings.usernameInvalid'
													)}
												</p>
											)}
										</>
									)}

									{currentStep === 'region' && (
										<>
											<p className="font-semibold text-sm text-text-accent">
												{t(
													'onboarding.step.region.desc'
												)}
											</p>
											<Combobox
												onValueChange={setRegion}
												options={regionOptions}
												placeholder="onboarding.step.region.placeholder"
												value={region}
											/>
										</>
									)}

									{currentStep === 'layout' && (
										<>
											<p className="font-semibold text-sm text-text-accent">
												{t(
													'onboarding.step.layout.desc'
												)}
											</p>
											<div className="flex flex-col gap-2">
												{LAYOUT_TYPES.map((option) => (
													<button
														className={`cursor-pointer rounded-lg p-1.5 ring-2 transition-colors ${
															layout ===
															option.value
																? 'bg-accent/50 ring-accent'
																: 'ring-border/40 hover:bg-accent/30'
														}`}
														key={option.value}
														onClick={() =>
															setLayout(
																option.value
															)
														}
														type="button"
													>
														<LayoutThumb
															layout={
																option.value
															}
														/>
														<span className="flex items-center gap-1.5 px-1 pt-1.5 font-semibold text-sm">
															{layout ===
																option.value && (
																<Icon
																	className="text-base"
																	icon="lucide:check"
																/>
															)}
															{t(option.label)}
														</span>
													</button>
												))}
											</div>
										</>
									)}

									{currentStep === 'banner' && (
										<>
											<p className="font-semibold text-sm text-text-accent">
												{t(
													'onboarding.step.banner.desc'
												)}
											</p>
											<div className="flex items-center justify-between rounded-lg bg-accent/50 p-2">
												<span className="font-semibold text-sm">
													{t(
														'me.settings.bannerType'
													)}
												</span>
												<OptionDropdown
													onSelect={setBannerMode}
													options={BANNER_MODES}
													title={t(
														findLabel(
															BANNER_MODES,
															bannerMode,
															'me.settings.bannerModeNone'
														)
													)}
													value={bannerMode}
												/>
											</div>
											<div className="flex items-center justify-between rounded-lg bg-accent/50 p-2">
												<span className="font-semibold text-sm">
													{t(
														'me.settings.bannerPlacement'
													)}
												</span>
												<OptionDropdown
													onSelect={setBannerType}
													options={BANNER_TYPES}
													title={t(
														findLabel(
															BANNER_TYPES,
															bannerType,
															'me.settings.bannerTypeHeader'
														)
													)}
													value={bannerType}
												/>
											</div>
											{bannerMode === 'COLOR' && (
												<div className="flex items-center justify-between rounded-lg bg-accent/50 p-2">
													<span className="font-semibold text-sm">
														{t(
															'me.settings.bannerColor'
														)}
													</span>
													<label className="relative flex cursor-pointer items-center gap-2">
														<div
															className="size-8 rounded-lg ring-2 ring-border/50"
															style={{
																backgroundColor:
																	bannerColor,
															}}
														/>
														<span className="font-semibold text-sm text-text-accent">
															{bannerColor}
														</span>
														<input
															className="sr-only"
															onChange={(e) =>
																setBannerColor(
																	e.target
																		.value
																)
															}
															type="color"
															value={bannerColor}
														/>
													</label>
												</div>
											)}
											{bannerMode === 'IMAGE' && (
												<div className="flex items-center justify-between rounded-lg bg-accent/50 p-2">
													<span className="font-semibold text-sm">
														{t(
															'me.settings.bannerImage'
														)}
													</span>
													<input
														accept="image/png,image/jpeg,image/webp"
														className="hidden"
														onChange={(e) => {
															const file =
																e.target
																	.files?.[0]
															if (file)
																handleBannerUpload(
																	file
																)
															e.target.value = ''
														}}
														ref={fileInputRef}
														type="file"
													/>
													<Button
														onClick={() =>
															fileInputRef.current?.click()
														}
														size="sm"
														variant="ghost"
													>
														<Icon
															className="text-xl"
															icon="lucide:upload"
														/>
													</Button>
												</div>
											)}
										</>
									)}

									{currentStep === 'card' && (
										<>
											<p className="font-semibold text-sm text-text-accent">
												{t('onboarding.step.card.desc')}
											</p>
											<div className="flex flex-col gap-2">
												{CARD_BACKGROUNDS.map(
													(option) => (
														<button
															className={`flex cursor-pointer items-center justify-between rounded-lg p-3 ring-2 transition-colors ${
																cardBackground ===
																option.value
																	? 'bg-accent/50 ring-accent'
																	: 'bg-accent/50 ring-transparent hover:ring-border/50'
															}`}
															key={option.value}
															onClick={() =>
																setCardBackground(
																	option.value
																)
															}
															type="button"
														>
															<span className="flex items-center gap-2 font-semibold text-sm">
																{cardBackground ===
																	option.value && (
																	<Icon
																		className="text-base"
																		icon="lucide:check"
																	/>
																)}
																{t(
																	option.label
																)}
															</span>
														</button>
													)
												)}
												{cardBackground === 'COLOR' && (
													<div className="flex items-center justify-between rounded-lg bg-accent/50 p-2">
														<span className="font-semibold text-sm">
															{t(
																'me.settings.cardColor'
															)}
														</span>
														<label className="relative flex cursor-pointer items-center gap-2">
															<div
																className="size-8 rounded-lg ring-2 ring-border/50"
																style={{
																	backgroundColor:
																		cardColor,
																}}
															/>
															<span className="font-semibold text-sm text-text-accent">
																{cardColor}
															</span>
															<input
																className="sr-only"
																onChange={(e) =>
																	setCardColor(
																		e.target
																			.value
																	)
																}
																type="color"
																value={
																	cardColor
																}
															/>
														</label>
													</div>
												)}
											</div>
										</>
									)}

									{currentStep === 'finish' && (
										<>
											<p className="font-semibold text-sm text-text-accent">
												{t(
													'onboarding.step.finish.desc'
												)}
											</p>
											<div className="flex flex-col gap-1.5 rounded-lg bg-accent/50 p-3">
												<div className="flex items-center justify-between">
													<span className="font-semibold text-sm">
														{t('me.settings.name')}
													</span>
													<span className="font-semibold text-sm text-text-accent">
														{name}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="font-semibold text-sm">
														{t(
															'me.settings.username'
														)}
													</span>
													<span className="font-semibold text-sm text-text-accent">
														{username}
													</span>
												</div>
												{hasExbo && (
													<div className="flex items-center justify-between">
														<span className="font-semibold text-sm">
															{t(
																'me.settings.regionLabel'
															)}
														</span>
														<span className="font-semibold text-sm text-text-accent">
															{t(
																'region.' +
																	region
															)}
														</span>
													</div>
												)}
											</div>
										</>
									)}
								</div>
							)}
						</motion.div>
					</AnimatePresence>
				</div>

				<div className="flex items-center justify-between gap-2">
					<Button
						className="gap-2"
						disabled={step === 0}
						onClick={handleBack}
						size="md"
						variant="ghost"
					>
						<Icon className="text-lg" icon="lucide:arrow-left" />
						{t('onboarding.back')}
					</Button>
					{isLastStep ? (
						<Button
							className="gap-2"
							loading={completeMutation.isPending}
							onClick={() => completeMutation.mutate()}
							size="md"
							variant="primary"
						>
							<Icon className="text-lg" icon="lucide:check" />
							{t('onboarding.finish')}
						</Button>
					) : (
						<Button
							className="gap-2"
							disabled={canProceed === false}
							onClick={handleNext}
							size="md"
							variant="primary"
						>
							{t(
								isWelcome
									? 'onboarding.welcome.start'
									: 'onboarding.next'
							)}
							<Icon
								className="text-lg"
								icon="lucide:arrow-right"
							/>
						</Button>
					)}
				</div>
			</div>
		</motion.div>
	)
}
