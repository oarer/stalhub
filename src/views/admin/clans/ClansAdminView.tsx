'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { useDebounce } from '@/hooks/useDebounce'
import { adminClanQueries } from '@/queries/admin/clan.queries'

export default function ClansAdminView() {
	const t = useTranslations()
	const [search, setSearch] = useState('')
	const [page, setPage] = useState(1)
	const take = 20
	const debouncedSearch = useDebounce(search)

	const { data } = useSuspenseQuery(
		adminClanQueries.list({ take, page, search: debouncedSearch || undefined })
	)

	const totalPages = data ? Math.ceil(data.total_count / take) : 1

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h1 className="font-semibold text-2xl">
					{t('admin.clans.title')}
				</h1>
				<span className="text-neutral-400 text-sm">
					{data?.total_count ?? 0} {t('admin.clans.total')}
				</span>
			</div>

			<div className="flex items-center gap-3">
				<div className="w-full md:w-80">
					<Input
						label="admin.clans.search"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setSearch(e.target.value)
							setPage(1)
						}}
						value={search}
					/>
				</div>
			</div>

			<Card.Root className="overflow-hidden p-0">
				<div className="overflow-x-auto">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>
								{t('admin.clans.table.name')}
							</Table.Head>
							<Table.Head>
								{t('admin.clans.table.tag')}
							</Table.Head>
							<Table.Head>
								{t('admin.clans.table.alliance')}
							</Table.Head>
							<Table.Head>
								{t('admin.clans.table.members')}
							</Table.Head>
							<Table.Head>
								{t('admin.clans.table.status')}
							</Table.Head>
							<Table.Head>
								{t('admin.clans.table.public')}
							</Table.Head>
							<Table.Head />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{data?.data.map((clan) => (
							<Table.Row key={clan.id}>
								<Table.Cell>
									<Link
										className="font-semibold text-sky-400 hover:underline"
										href={`/admin/clans/${clan.id}`}
									>
										{clan.name}
									</Link>
								</Table.Cell>
								<Table.Cell>{clan.tag || '—'}</Table.Cell>
								<Table.Cell>{clan.alliance || '—'}</Table.Cell>
								<Table.Cell>{clan.member_count}</Table.Cell>
								<Table.Cell>
									{clan.blocked ? (
										<Badge variant="danger">
											{t('admin.clans.status.blocked')}
										</Badge>
									) : clan.status === 'ACTIVE' ? (
										<Badge variant="success">
											{t('admin.clans.status.active')}
										</Badge>
									) : (
										<Badge variant="secondary">
											{t('admin.clans.status.frozen')}
										</Badge>
									)}
								</Table.Cell>
								<Table.Cell>
									{clan.is_public ? (
										<Icon
											className="text-green-400"
											icon="lucide:check"
										/>
									) : (
										<Icon
											className="text-neutral-500"
											icon="lucide:minus"
										/>
									)}
								</Table.Cell>
								<Table.Cell>
									<Link href={`/admin/clans/${clan.id}`}>
										<Button size="sm" variant="ghost">
											<Icon icon="lucide:eye" />
										</Button>
									</Link>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
				</div>
			</Card.Root>

			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
						size="sm"
						variant="outline"
					>
						<Icon icon="lucide:chevron-left" />
					</Button>
					<span className="text-neutral-400 text-sm">
						{page} / {totalPages}
					</span>
					<Button
						disabled={page >= totalPages}
						onClick={() => setPage((p) => p + 1)}
						size="sm"
						variant="outline"
					>
						<Icon icon="lucide:chevron-right" />
					</Button>
				</div>
			)}
		</div>
	)
}
