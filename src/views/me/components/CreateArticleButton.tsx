'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function CreateArticleButton({ label }: { label?: string }) {
	const t = useTranslations()

	return (
		<Link
			className="inline-flex items-center gap-1.5 rounded-lg bg-sky-400 px-4 py-2 font-medium text-sm text-white shadow-md transition-all hover:brightness-120 dark:bg-sky-600/70"
			href="/me/articles/new"
		>
			<Icon className="size-4" icon="lucide:plus" />
			<p className="font-semibold">{label ?? t('me.articles.create')}</p>
		</Link>
	)
}
