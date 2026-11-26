'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Combobox } from '@/components/ui/Combobox'
import { Tabs } from '@/components/ui/Tabs'
import { effectiveAwardStatus } from '@/lib/awardStatus'
import { adminAwardsQueries } from '@/queries/admin/awards.queries'
import CampaignsTab from './CampaignsTab'
import CategoriesTab from './CategoriesTab'
import NomineesTab from './NomineesTab'
import ResultsTab from './ResultsTab'
import VotesTab from './VotesTab'

export default function AwardsAdminView() {
	const t = useTranslations()
	const { data } = useSuspenseQuery(adminAwardsQueries.list())
	const preferredCampaign =
		data.items.find((item) => item.status === 'voting') ??
		data.items.find((item) => item.status === 'draft') ??
		data.items[0]
	const [campaignId, setCampaignId] = useState(preferredCampaign?.id ?? '')
	const campaign = data.items.find((item) => item.id === campaignId) ?? null

	useEffect(() => {
		if (!data.items.some((item) => item.id === campaignId))
			setCampaignId(preferredCampaign?.id ?? '')
	}, [campaignId, data.items, preferredCampaign?.id])

	const status = campaign
		? effectiveAwardStatus(campaign.status, campaign.ends_at)
		: 'draft'
	const statusVariant =
		status === 'voting' || status === 'published' ? 'success' : 'secondary'

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<h1 className="text-2xl font-semibold">
					{t('admin.awards.title')}
				</h1>
				{data.items.length > 0 && (
					<div className="flex flex-col gap-1 text-sm">
						<span className="text-muted-foreground text-xs">
							{t('admin.awards.campaignContext')}
						</span>
						<div className="flex flex-nowrap items-center gap-2">
							{campaign && (
								<Badge
									className="shrink-0 whitespace-nowrap"
									variant={statusVariant}
								>
									{campaign.year} ·{' '}
									{t(`awards.status.${status}`)}
								</Badge>
							)}
							<Combobox
								className="min-w-52"
								onValueChange={(value) =>
									value && setCampaignId(value)
								}
								options={data.items.map((item) => ({
									value: item.id,
									label: `${item.year} · ${item.title}`,
								}))}
								placeholder="admin.awards.selectCampaign"
								translateOptions={false}
								value={campaignId}
							/>
						</div>
					</div>
				)}
			</div>
			<Tabs.Root defaultValue="campaigns">
				<Tabs.List>
					<Tabs.Trigger value="campaigns">
						{t('admin.awards.campaigns')}
					</Tabs.Trigger>
					<Tabs.Trigger value="categories">
						{t('admin.awards.categories')}
					</Tabs.Trigger>
					<Tabs.Trigger value="nominees">
						{t('admin.awards.nominees')}
					</Tabs.Trigger>
					<Tabs.Trigger value="votes">
						{t('admin.awards.votes')}
					</Tabs.Trigger>
					<Tabs.Trigger value="results">
						{t('admin.awards.results')}
					</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="campaigns">
					<CampaignsTab
						campaigns={data.items}
						onSelect={setCampaignId}
						selectedId={campaignId}
					/>
				</Tabs.Content>
				<Tabs.Content value="categories">
					<CategoriesTab campaign={campaign} />
				</Tabs.Content>
				<Tabs.Content value="nominees">
					<NomineesTab campaign={campaign} />
				</Tabs.Content>
				<Tabs.Content value="votes">
					<VotesTab campaign={campaign} />
				</Tabs.Content>
				<Tabs.Content value="results">
					<ResultsTab campaign={campaign} />
				</Tabs.Content>
			</Tabs.Root>
		</div>
	)
}
