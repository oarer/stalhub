'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { FormSkeleton } from '@/components/ui/PageSkeletons'
import { commissionQueries as queries } from '@/queries/commission/commission.queries'
import { StudioForm } from './components/StudioForm'
import { Feedback, usePrivateScope } from './components/shared'

export default function StudioView() {
	const t = useTranslations('commissions')
	const user = usePrivateScope()
	const capabilities = useQuery(queries.capabilities(user))
	const query = useQuery({
		...queries.profile(user),
		enabled: !!user && !!capabilities.data?.author,
	})
	return (
		<div className="flex flex-col gap-5">
			<h1 className="font-semibold text-2xl">{t('studio')}</h1>
			<Feedback error={query.error || capabilities.error} />
			{capabilities.data && !capabilities.data.author ? (
				<p>{t('accessDenied')}</p>
			) : query.isPending ? (
				<FormSkeleton />
			) : (
				<StudioForm
					initial={query.data ?? null}
					key={query.data?.version ?? 0}
				/>
			)}
		</div>
	)
}
