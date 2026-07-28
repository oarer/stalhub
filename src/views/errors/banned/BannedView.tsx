'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { unbounded } from '@/app/fonts'
import { stringTimeDeltaFull } from '@/lib/time'
import { useBanStore } from '@/stores/useBan.store'
import SupportText from '../shared/SupportText'

export default function BannedView() {
	const t = useTranslations()
	const reason = useBanStore((s) => s.reason)
	const expireIn = useBanStore((s) => s.expireIn)

	const [remaining, setRemaining] = useState(expireIn)

	useEffect(() => {
		if (expireIn == null) return

		setRemaining(expireIn)

		const interval = setInterval(() => {
			setRemaining((prev) => {
				if (prev == null || prev <= 0) {
					clearInterval(interval)
					return 0
				}
				return prev - 1000
			})
		}, 1000)

		return () => clearInterval(interval)
	}, [expireIn])

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
			<div className="grid items-center gap-8 md:flex">
				<div className="flex max-w-sm flex-col gap-2">
					<h1
						className={`${unbounded.className} text-center font-bold text-2xl uppercase tracking-widest md:text-left md:text-3xl`}
					>
						{t('errors.banned.account')}{' '}
						<span className="text-red-500">
							{t('errors.banned.blocked')}
						</span>
					</h1>
					<p
						className={`${unbounded.className} text-center font-semibold text-md md:text-left md:text-xl dark:text-text-accent`}
					>
						{reason
							? `${t('errors.banned.reasonPrefix')} ${reason}`
							: t('errors.banned.blockedMessage')}
					</p>
					{remaining != null && remaining > 0 && (
						<p
							className={`${unbounded.className} text-center font-semibold text-sm md:text-left md:text-lg dark:text-neutral-400`}
						>
							{t('errors.banned.remaining')}{' '}
							{stringTimeDeltaFull(
								Math.floor(remaining / 1000),
								t
							)}
						</p>
					)}
				</div>
				<Image
					alt="banned"
					className="rounded-lg bg-neutral-400 p-3 dark:bg-transparent"
					height={400}
					src="/images/errors/banned.png"
					width={400}
				/>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SupportText
					identifierLabel={t('errors.banned.ifMistake')}
					identifierPrefix={t('errors.banned.reasonLabel')}
					identifierValue={reason}
					identifierValuePrefix={t('errors.banned.reasonValuePrefix')}
				/>
			</div>
		</div>
	)
}
