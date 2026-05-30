'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { toast } from '@/components/ui/Toast'
import { Tooltip } from '@/components/ui/Tooltip'
import { statusQueries } from '@/queries/status/status.queries'
import type { Service } from '@/types/status.type'

export const StatusWidget = () => {
	const { data } = useQuery(statusQueries.get())
	const t = useTranslations()

	const services: Service[] = data?.data ? Object.values(data.data) : []

	const problemServices = services.filter((s) => s.currentStatus !== 'UP')

	let indicatorColor = 'bg-green-400'

	if (problemServices.some((s) => s.currentStatus === 'DEGRADED')) {
		indicatorColor = 'bg-amber-400'
	} else if (problemServices.length > 0) {
		indicatorColor = 'bg-red-400'
	}

	const prevProblemsRef = useRef<string[]>([])

	useEffect(() => {
		const currentProblems = problemServices.map((s) => s.name)

		const newProblems = currentProblems.filter(
			(name) => !prevProblemsRef.current.includes(name)
		)

		if (newProblems.length > 0) {
			toast.error(
				`${t('status_widget.services_down')} ${newProblems.join(', ')}`
			)
		}

		const recovered = prevProblemsRef.current.filter(
			(name) => !currentProblems.includes(name)
		)

		if (recovered.length > 0) {
			toast.success(
				`${t('status_widget.services_up')} ${recovered.join(', ')}`
			)
		}

		prevProblemsRef.current = currentProblems
	}, [problemServices, t])

	return (
		<div className="flex items-center gap-2">
			<div className="relative flex size-3">
				<div
					className={`absolute h-full w-full animate-ping rounded-full ${indicatorColor}`}
				/>
				<div
					className={`relative size-3 rounded-full ${indicatorColor}`}
				/>
			</div>

			<div>
				{problemServices.length === 0 ? (
					<p className="text-neutral-400 text-sm">
						{t('status_widget.services_ok')}
					</p>
				) : (
					<Tooltip.Root>
						<Tooltip.Trigger>
							{t('status_widget.services_problem')}
						</Tooltip.Trigger>
						<Tooltip.Content>
							{problemServices.map((s) => (
								<span className="text-xs" key={s.name}>
									{s.name}
								</span>
							))}
						</Tooltip.Content>
					</Tooltip.Root>
				)}
			</div>
		</div>
	)
}
