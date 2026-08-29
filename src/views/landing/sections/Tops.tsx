'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { unbounded } from '@/app/fonts'
import GradientText from '@/components/ui/GradientText'
import Avatar from '@/components/ui/user/Avatar'

import { tierListQueries } from '@/queries/tier-list/tier-list.queries'
import type { WeeklyTopAuthor, WeeklyTopWork } from '@/types/tier-list.type'

const workHref = (work: WeeklyTopWork) =>
	work.kind === 'tier_list'
		? `/tierlists/${work.external_id}`
		: work.kind === 'article'
			? `/articles/${work.external_id}`
			: work.kind === 'art'
				? `/arts/${work.external_id}`
				: `/calcs/builds/lite?build=${work.id}`

function AuthorCard({
	entry,
	period,
}: {
	entry: WeeklyTopAuthor
	period: 'week' | 'month'
}) {
	const t = useTranslations()
	return (
		<div className="flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-background/50 p-5">
			<Avatar
				height={84}
				id={entry.user.id}
				username={entry.user.username}
				width={84}
			/>
			<Link
				className={`${unbounded.className} text-center font-bold text-lg text-primary uppercase tracking-widest`}
				href={`/users/${entry.user.username}`}
			>
				{entry.user.name || entry.user.username}
			</Link>
			<span
				className={`${unbounded.className} text-center text-xs uppercase tracking-widest`}
			>
				{t(`landing.tops.${period}`)} · {entry.views.total}{' '}
				{t('landing.tops.views')}
			</span>
			<div className="flex w-full flex-col gap-2 border-border/50 border-t pt-3">
				{entry.works.map((work) => (
					<Link
						className="truncate text-center text-primary text-sm hover:underline"
						href={workHref(work)}
						key={`${work.kind}-${work.id}`}
					>
						{work.title}
					</Link>
				))}
			</div>
		</div>
	)
}

export default function Tops() {
	const t = useTranslations()
	const { data, isLoading } = useQuery(tierListQueries.topAuthorOfWeek())
	const month = data?.month ?? []
	return (
		<section
			className="mx-auto flex w-full max-w-355 flex-col gap-10 pb-20"
			id="tops"
		>
			<motion.div
				className="text-center"
				initial={{ y: 30, opacity: 0 }}
				transition={{ duration: 0.6 }}
				viewport={{ once: true }}
				whileInView={{ y: 0, opacity: 1 }}
			>
				<div className="flex flex-col gap-4">
					<GradientText
						className={`${unbounded.className} text-balance font-bold text-3xl tracking-tight md:text-5xl`}
						colors={['var(--primary)', '#afc7d4']}
						yoyo={false}
					>
						{t('landing.tops.title')}
					</GradientText>
					<p className="text-center font-medium text-xl md:text-2xl dark:text-foreground/90">
						{t('landing.tops.description')}
					</p>
				</div>
			</motion.div>
			<div className="flex flex-col gap-4">
				<h2
					className={`${unbounded.className} text-center font-bold text-2xl`}
				>
					{t('landing.tops.week')}
				</h2>
				{isLoading ? (
					<div className="h-40 animate-pulse rounded-xl bg-muted" />
				) : data?.week ? (
					<AuthorCard entry={data.week} period="week" />
				) : (
					<p className="text-center">{t('landing.tops.empty')}</p>
				)}
			</div>
			<div className="flex flex-col gap-4">
				<h2
					className={`${unbounded.className} text-center font-bold text-2xl`}
				>
					{t('landing.tops.month')}
				</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{month.map((entry) => (
						<AuthorCard
							entry={entry}
							key={entry.user.id}
							period="month"
						/>
					))}
				</div>
			</div>
		</section>
	)
}
