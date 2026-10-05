'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import Input from '@/components/ui/Input'
import { getLocale } from '@/lib/getLocale'
import { donateQueries } from '@/queries/donate/donate.queries'
import { messageToString } from '@/utils/itemUtils'

export default function DonateCalcView() {
	const t = useTranslations()
	const locale = getLocale()
	const { data } = useSuspenseQuery(donateQueries.get())
	const [coins, setCoins] = useState(1000)

	const rows = useMemo(() => {
		return (data.items ?? [])
			.filter((i) => i.has_market)
			.map((i) => {
				const affordable =
					i.stalcoins > 0 ? Math.floor(coins / i.stalcoins) : 0
				return { ...i, affordable, totalValue: affordable * i.price }
			})
	}, [data, coins])

	return (
		<section className="mx-auto flex max-w-380 flex-col gap-6 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<div>
				<h1
					className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
				>
					{t('donateCalc.title')}
				</h1>
				<p className="mt-2 font-medium text-muted-foreground text-sm">
					{t('donateCalc.subtitle')}
				</p>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
				<Input
					className="py-2.5 md:w-80"
					id="stalcoins"
					label="donateCalc.input"
					min={0}
					onChange={(e) =>
						setCoins(
							e.target.value === '' ? 0 : Number(e.target.value)
						)
					}
					type="number"
					value={coins}
				/>
				<Alert.Root className="flex-1" variant="default">
					<Alert.Description>
						{t('donateCalc.hint')}
					</Alert.Description>
				</Alert.Root>
			</div>

			<div className="overflow-x-auto rounded-xl border-2 border-primary/20 bg-card">
				<table className="w-full text-sm">
					<thead>
						<tr className="text-left text-text-accent">
							<th className="px-3 py-2 font-medium">
								{t('donateCalc.item')}
							</th>
							<th className="px-3 py-2 font-medium">
								{t('donateCalc.coins')}
							</th>
							<th className="px-3 py-2 font-medium">
								{t('donateCalc.price')}
							</th>
							<th className="px-3 py-2 font-medium">
								{t('donateCalc.perCoin')}
							</th>
							<th className="px-3 py-2 font-medium">
								{t('donateCalc.count')}
							</th>
							<th className="px-3 py-2 font-medium">
								{t('donateCalc.total')}
							</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((r) => (
							<tr
								className="border-border/50 border-t"
								key={r.key}
							>
								<td className="px-3 py-2">
									<span className="flex items-center gap-2">
										{r.icon && (
											<Image
												alt={r.id}
												height={28}
												src={`https://cdn.stalhub.dev/db${r.icon}`}
												width={28}
											/>
										)}
										<span className="font-medium">
											{messageToString(
												r.name as never,
												locale
											)}
										</span>
										{r.amount > 1 && (
											<span className="font-mono text-text-accent text-xs">
												×{r.amount}
											</span>
										)}
									</span>
								</td>
								<td className="px-3 py-2 font-mono">
									{r.stalcoins}
								</td>
								<td className="px-3 py-2 font-mono text-yellow-400">
									{r.price.toLocaleString()} ₽
								</td>
								<td className="px-3 py-2 font-mono text-green-400">
									{r.price_per_coin.toLocaleString()}
								</td>
								<td className="px-3 py-2 font-mono">
									{r.affordable}
								</td>
								<td className="px-3 py-2 font-mono">
									{r.totalValue.toLocaleString()} ₽
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{data.missing.length > 0 && (
				<Alert.Root variant="warning">
					<Alert.Description>
						{t('donateCalc.missing')}: {data.missing.join(', ')}
					</Alert.Description>
				</Alert.Root>
			)}
		</section>
	)
}
