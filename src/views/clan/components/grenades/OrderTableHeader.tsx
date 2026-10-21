import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { Table } from '@/components/ui/Table'

export function OrderTableHeader({ itemLabel }: { itemLabel: ReactNode }) {
	const t = useTranslations()

	return (
		<Table.Header>
			<Table.Row>
				<Table.Head>{t('clan.grenades.playerName')}</Table.Head>
				<Table.Head>{itemLabel}</Table.Head>
				<Table.Head className="w-20 text-center">×</Table.Head>
				<Table.Head className="w-10" />
			</Table.Row>
		</Table.Header>
	)
}
