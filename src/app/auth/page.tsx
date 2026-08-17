'use client'

import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { authService } from '@/services/auth/auth.service'
import { discordAuthService } from '@/services/auth/discord/discord.service'
import { exboAuthService } from '@/services/auth/exbo/auth.service'
import { telegramAuthService } from '@/services/auth/telegram/telegram.service'
import { userService } from '@/services/user/user.service'
import { montserrat, unbounded } from '../fonts'

type Provider = 'discord' | 'telegram' | 'exbo'

const steps = ['providers', 'credentials'] as const
type StepKey = (typeof steps)[number]

const stepIcons: Record<StepKey, string> = {
	providers: 'lucide:shield',
	credentials: 'lucide:key-round',
}

export default function Page() {
	const [step, setStep] = useState(0)
	const [direction, setDirection] = useState(1)
	const [loading, setLoading] = useState<Provider | null>(null)
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()
	const t = useTranslations()

	const currentStep = steps[step]
	const isLastStep = step === steps.length - 1

	const handleLogin = async (provider: Provider) => {
		setLoading(provider)
		try {
			const services = {
				discord: discordAuthService,
				telegram: telegramAuthService,
				exbo: exboAuthService,
			}
			const url = await services[provider].getLoginUrl()
			router.push(url)
		} catch {
			setLoading(null)
		}
	}

	const handlePasswordLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!username || !password || isSubmitting) return

		setIsSubmitting(true)
		setError(null)
		try {
			await authService.login(username, password)
			const user = await userService.getMe()
			const isGuest = user.roles?.some((r) => r.name === 'clan_guest')
			router.replace(isGuest ? '/me/clan' : '/me')
		} catch (err) {
			const message = (
				err as {
					response?: { data?: { error?: string } }
				}
			)?.response?.data?.error
			setError(message ?? t('auth.loginError'))
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleNext = () => {
		setError(null)
		setDirection(1)
		setStep((s) => Math.min(s + 1, steps.length - 1))
	}

	const handleBack = () => {
		setError(null)
		setDirection(-1)
		setStep((s) => Math.max(s - 1, 0))
	}

	return (
		<section className="flex min-h-dvh w-full items-center justify-center px-4 py-8">
			<div className="flex w-full max-w-lg flex-col gap-5">
				<header className="flex flex-col gap-3">
					<div className="flex items-center gap-2">
						<Icon className="text-2xl" icon="lucide:log-in" />
						<h1
							className={`${unbounded.className} font-semibold text-xl`}
						>
							{t('auth.title')}
						</h1>
					</div>
					<div className="flex gap-1.5">
						{steps.map((s, i) => (
							<div
								className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
									i === step
										? 'bg-accent'
										: 'bg-border-secondary'
								}`}
								key={s}
							/>
						))}
					</div>
					<Alert.Root variant="info">
						<Alert.Title>
							{t('auth.recommendationTitle')}
						</Alert.Title>
						<Alert.Description>
							{t('auth.recommendationDesc')}
						</Alert.Description>
					</Alert.Root>
				</header>

				<div className="relative flex min-h-58 overflow-hidden rounded-xl bg-background p-6 ring-2 ring-border/50">
					<AnimatePresence initial={false} mode="wait">
						<motion.div
							animate={{ opacity: 1, scale: 1, x: 0 }}
							className="flex w-full flex-col justify-center gap-4"
							exit={{
								opacity: 0,
								scale: 0.98,
								x: -20 * direction,
							}}
							initial={{
								opacity: 0,
								scale: 0.98,
								x: 20 * direction,
							}}
							key={currentStep}
							transition={{ duration: 0.25, ease: 'easeOut' }}
						>
							{currentStep === 'providers' && (
								<div className="flex flex-col gap-3">
									<div className="flex items-center gap-2">
										<Icon
											className="text-xl"
											icon={stepIcons[currentStep]}
										/>
										<h2 className="font-semibold text-lg">
											{t('auth.login')}
										</h2>
									</div>

									<div className="flex flex-col gap-3">
										<Button
											className="gap-2"
											disabled={loading === 'discord'}
											onClick={() =>
												handleLogin('discord')
											}
											variant={'secondary'}
										>
											<Image
												alt="discord auth"
												height={20}
												src="/images/other/discord.png"
												width={20}
											/>
											<p className="font-semibold">
												Discord
											</p>
										</Button>
										<Button
											className="gap-2"
											loading={loading === 'telegram'}
											onClick={() =>
												handleLogin('telegram')
											}
											variant={'secondary'}
										>
											<Image
												alt="telegram auth"
												height={20}
												src="/images/other/telegram.png"
												width={20}
											/>
											<p className="font-semibold">
												Telegram
											</p>
										</Button>
										<Button
											className="gap-2 bg-purple-600 ring-2 ring-purple-900 dark:bg-purple-700/40 dark:ring-purple-700"
											loading={loading === 'exbo'}
											onClick={() => handleLogin('exbo')}
										>
											<Image
												alt="exbo auth"
												height={20}
												src="/images/other/exbo.png"
												width={20}
											/>
											<p className="font-semibold">
												EXBO
											</p>
										</Button>
									</div>
								</div>
							)}

							{currentStep === 'credentials' && (
								<div className="flex flex-col gap-3">
									<div className="flex items-center gap-2">
										<Icon
											className="text-xl"
											icon={stepIcons[currentStep]}
										/>
										<h2 className="font-semibold text-lg">
											{t('auth.loginByPassword')}
										</h2>
									</div>

									<form
										className="flex flex-col gap-2"
										id="auth-form"
										onSubmit={handlePasswordLogin}
									>
										<Input
											autoComplete="username"
											label="auth.username"
											onChange={(e) =>
												setUsername(e.target.value)
											}
											value={username}
										/>
										<Input
											autoComplete="current-password"
											label="auth.password"
											onChange={(e) =>
												setPassword(e.target.value)
											}
											type="password"
											value={password}
										/>
										{error && (
											<p className="font-semibold text-red-400 text-sm">
												{error}
											</p>
										)}
										<Button
											className="w-full"
											disabled={!username || !password}
											loading={isSubmitting}
											type="submit"
											variant="primary"
										>
											{t('auth.login')}
										</Button>
									</form>
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
						variant="secondary"
					>
						<Icon className="text-lg" icon="lucide:arrow-left" />
						{t('auth.back')}
					</Button>
					{isLastStep ? (
						<Button
							className="gap-2"
							disabled={!username || !password}
							form="auth-form"
							loading={isSubmitting}
							size="md"
							type="submit"
							variant="primary"
						>
							{t('auth.login')}
							<Icon className="text-lg" icon="lucide:check" />
						</Button>
					) : (
						<Button
							className="gap-2"
							onClick={handleNext}
							size="md"
							variant="primary"
						>
							{t('auth.next')}
							<Icon
								className="text-lg"
								icon="lucide:arrow-right"
							/>
						</Button>
					)}
				</div>
				<p
					className={`${montserrat.className} font-semibold text-sm text-text-accent`}
				>
					{t('auth.terms')}{' '}
					<Link
						className="underline underline-offset-2"
						href="/wiki/legal/tos"
					>
						{t('auth.termsLink')}
					</Link>
				</p>
			</div>
		</section>
	)
}
