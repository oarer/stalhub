'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export function Countdown({
	endsAt,
	serverTime,
}: {
	endsAt: string
	serverTime: string
}) {
	const t = useTranslations('awards.countdown')
	const [left, setLeft] = useState(() =>
		Math.max(0, Date.parse(endsAt) - Date.parse(serverTime))
	)

	useEffect(() => {
		const offset = Date.parse(serverTime) - Date.now()
		const tick = () =>
			setLeft(Math.max(0, Date.parse(endsAt) - Date.now() - offset))
		tick()
		const id = window.setInterval(tick, 1000)
		return () => window.clearInterval(id)
	}, [endsAt, serverTime])

	const days = Math.floor(left / 86400000)
	const clock = [
		{ label: t('hours'), value: Math.floor(left / 3600000) % 24 },
		{ label: t('minutes'), value: Math.floor(left / 60000) % 60 },
		{ label: t('seconds'), value: Math.floor(left / 1000) % 60 },
	]

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			aria-label={t('label')}
			className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
			initial={{ opacity: 0, y: 8 }}
			role="timer"
			transition={{ duration: 0.4, ease: 'easeOut' }}
		>
			<span className="text-muted-foreground text-sm">{t('label')}</span>
			<div className="flex items-center gap-1 sm:gap-1.5">
				<span className="bg-muted flex min-h-8 items-baseline gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold shadow-sm sm:min-h-9 sm:px-3 sm:text-base">
					{days}
					<span className="text-foreground/70 text-xs sm:text-sm">
						{t('days')}
					</span>
				</span>
				{clock.map((unit, index) => (
					<span
						className="flex items-center gap-1 sm:gap-1.5"
						key={unit.label}
					>
						<span className="text-muted-foreground/50 px-0.5 text-sm font-semibold">
							:
						</span>
						<span className="flex items-center gap-0.5">
							{String(unit.value)
								.padStart(2, '0')
								.split('')
								.map((digit, digitIndex) => (
									<Digit
										digit={digit}
										key={`${index}-${digitIndex}`}
									/>
								))}
						</span>
					</span>
				))}
			</div>
		</motion.div>
	)
}

function Digit({ digit }: { digit: string }) {
	return (
		<span className="bg-muted relative flex size-8 items-center justify-center overflow-hidden rounded-lg text-base font-semibold tabular-nums shadow-sm sm:size-9 sm:text-lg">
			<AnimatePresence initial={false}>
				<motion.span
					animate={{ opacity: 1, y: '0%' }}
					className="absolute inset-0 flex items-center justify-center"
					exit={{ opacity: 0, y: '-100%' }}
					initial={{ opacity: 0, y: '100%' }}
					key={digit}
					transition={{
						duration: 0.32,
						ease: [0.22, 1, 0.36, 1],
					}}
				>
					{digit}
				</motion.span>
			</AnimatePresence>
		</span>
	)
}
