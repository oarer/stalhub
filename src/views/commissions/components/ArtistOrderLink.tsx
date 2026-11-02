'use client'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { CLink } from '@/components/ui/Link'
import { commissionQueries } from '@/queries/commission/commission.queries'

export default function ArtistOrderLink({ username }: { username: string }) {
	const t = useTranslations('commissions')
	const { data } = useQuery({
		...commissionQueries.artist(username),
		retry: false,
	})
	return data?.accepting ? (
		<CLink
			className="bg-primary/10 text-center"
			href={`/artists/${username}`}
			variant="bordered"
		>
			{t('sendOrder')}
		</CLink>
	) : null
}
