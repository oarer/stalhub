import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import { Divider } from '@/components/ui/Divider'
import { getLocale } from '@/lib/getLocale'
import type { BarterResponse } from '@/types/barter.type'
import { InfoColor, infoColorMap } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

type Props = {
	data: BarterResponse
}

export default function Barter({ data }: Props) {
	const t = useTranslations()

	const locale = getLocale()
	const [selectedRecipe, setSelectedRecipe] = useState(0)

	const recipes = data.recipes ?? []
	const hasMultipleRecipes = recipes.length > 1

	return (
		<Card.Root className="space-y-3">
			<Card.Header className="flex gap-2">
				<Card.Title>
					{t('barter.lvl_req')}: {data.settlement_required_level}
				</Card.Title>
				<Divider className="my-2" />
				<Card.Description className="flex flex-col justify-start gap-2">
					<h1 className={`font-semibold text-md`}>
						{t('barter.base')}:
					</h1>
					<div className="flex flex-wrap">
						{data.settlement_titles.map((title, index) => (
							<span
								className="flex items-center"
								key={`${title}-${index}`}
							>
								<p className="font-semibold text-text-accent/90">
									{messageToString(title, locale)}
								</p>
								{index !==
									data.settlement_titles.length - 1 && (
									<span className="mx-1">,</span>
								)}
							</span>
						))}
					</div>
				</Card.Description>
			</Card.Header>
			<Divider />
			<Card.Content className="flex flex-col gap-4">
				{data.recipes?.length > 0 && (
					<section className="flex flex-col gap-3">
						{recipes.length > 0 && (
							<div
								className="flex flex-col gap-3"
								key={`${recipes[selectedRecipe].money}-${selectedRecipe}`}
							>
								<div className="flex items-center justify-between gap-3">
									{hasMultipleRecipes && (
										<div className="w-32">
											<Combobox
												onValueChange={(value) =>
													setSelectedRecipe(
														Number(value)
													)
												}
												options={recipes.map(
													(_, index) => ({
														label: t(
															'barter.recipe',
															{
																number:
																	index + 1,
															}
														),
														value: String(index),
													})
												)}
												placeholder="barter.recipe"
												value={String(selectedRecipe)}
											/>
										</div>
									)}
									<p className="font-mono font-semibold text-sm">
										{t('barter.money')}:{' '}
										{Number(
											recipes[selectedRecipe]?.money ?? 0
										).toLocaleString('en-US', {
											minimumFractionDigits: 0,
											maximumFractionDigits: 2,
										})}{' '}
										₽
									</p>
								</div>

								<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
									{recipes[selectedRecipe].items.map(
										(item, itemIndex) => (
											<Link
												className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border-secondary p-2"
												href={`/items${item.category}`}
												key={`${item.category}-${itemIndex}`}
											>
												<Image
													alt={messageToString(
														item.lines,
														locale
													)}
													// пиздец анимки смешные
													className="transition-transform group-hover:-rotate-5 group-hover:scale-110"
													height={52}
													src={`https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons${item.category}.png`}
													width={52}
												/>
												<Divider />
												<p
													className="font-mono text-xs"
													style={{
														color:
															infoColorMap[
																item?.color as InfoColor
															] ||
															InfoColor.DEFAULT,
													}}
												>
													{item.amount}x
												</p>
											</Link>
										)
									)}
								</div>
							</div>
						)}
					</section>
				)}
				{data.used_in?.length > 0 && (
					<>
						<Divider />
						<section className="flex flex-col gap-3">
							<h2 className="font-semibold text-sm">
								{t('barter.used_in')}:
							</h2>

							<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
								{data.used_in.map((item) => (
									<Link
										className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border-secondary p-2"
										href={`/items${item.category}`}
										key={`${item.item_id}`}
									>
										<Image
											alt={messageToString(
												item.lines,
												locale
											)}
											className="transition-transform group-hover:-rotate-5 group-hover:scale-110"
											height={52}
											src={`https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons${item.category}.png`}
											width={52}
										/>

										<p
											className="max-w-24 truncate font-semibold text-sm"
											style={{
												color:
													infoColorMap[
														item?.color as InfoColor
													] || InfoColor.DEFAULT,
											}}
										>
											{messageToString(
												item.lines,
												locale
											)}
										</p>
									</Link>
								))}
							</div>
						</section>
					</>
				)}
			</Card.Content>
		</Card.Root>
	)
}
