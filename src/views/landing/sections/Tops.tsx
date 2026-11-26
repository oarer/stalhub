'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { unbounded } from '@/app/fonts'
import GradientText from '@/components/ui/GradientText'
import Avatar from '@/components/ui/user/Avatar'
import Username from '@/components/ui/user/Username'

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
		<div className="border-border/50 bg-background/50 flex flex-col items-center gap-3 rounded-xl border p-5">
			<Avatar
				height={84}
				id={entry.user.id}
				username={entry.user.username}
				width={84}
			/>
			<Link
				className={`${unbounded.className} text-primary text-center text-lg font-bold tracking-widest uppercase`}
				href={`/users/${entry.user.username}`}
			>
				<Username user={entry.user} />
			</Link>
			<span
				className={`${unbounded.className} text-center text-xs tracking-widest uppercase`}
			>
				{t(`landing.tops.${period}`)} · {entry.views.total}{' '}
				{t('landing.tops.views')}
			</span>
			<div className="border-border/50 flex w-full flex-col gap-2 border-t pt-3">
				{entry.works.map((work) => (
					<Link
						className="text-primary truncate text-center text-sm hover:underline"
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
						className={`${unbounded.className} text-3xl font-bold tracking-tight text-balance md:text-5xl`}
						colors={['var(--primary)', '#afc7d4']}
						yoyo={false}
					>
						{t('landing.tops.title')}
					</GradientText>
					<p className="dark:text-foreground/90 text-center text-xl font-medium md:text-2xl">
						{t('landing.tops.description')}
					</p>
				</div>
			</motion.div>
			<div className="flex flex-col gap-4">
				<h2
					className={`${unbounded.className} text-center text-2xl font-bold`}
				>
					{t('landing.tops.week')}
				</h2>
				{isLoading ? (
					<div className="bg-muted h-40 animate-pulse rounded-xl" />
				) : data?.week ? (
					<AuthorCard entry={data.week} period="week" />
				) : (
					<p className="text-center">{t('landing.tops.empty')}</p>
				)}
			</div>
			<div className="flex flex-col gap-4">
				<h2
					className={`${unbounded.className} text-center text-2xl font-bold`}
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
