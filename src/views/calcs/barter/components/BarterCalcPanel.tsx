'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckBox } from '@/components/ui/CheckBox'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { getLocale } from '@/lib/getLocale'
import {
	barterCalcQueries,
	SERUM_ITEM_ID,
	TOKEN_ITEM_ID,
} from '@/queries/barter/barter-calc.queries'
import { applyDiscount } from '@/utils/barterUtils'
import { messageToString } from '@/utils/itemUtils'
import { DISCOUNTS } from '@/views/items/components/tabs/barter/constants'
import { type CalcCurrency, evaluateOffer, evaluateStock } from './calcUtils'

type CalcMode = 'unlimited' | 'stock'

type Props = {
	itemId: string
	includeTokens: boolean
	onIncludeTokensChange: (v: boolean) => void
	serumNeeded: number
	tokenTotal: number
	discount: string
	onDiscountChange: (v: string) => void
}

function parseNum(v: string): number {
	const n = Number(v.replace(',', '.'))
	return Number.isFinite(n) && n >= 0 ? n : 0
}

export default function BarterCalcPanel({
	itemId,
	includeTokens,
	onIncludeTokensChange,
	serumNeeded,
	tokenTotal,
	discount,
	onDiscountChange,
}: Props) {
	const t = useTranslations()
	const locale = getLocale()
	const [mode, setMode] = useState<CalcMode>('unlimited')
	const [currency, setCurrency] = useState<CalcCurrency>('none')
	const [stock, setStock] = useState('')
	const [tokenStock, setTokenStock] = useState('')

	const { data: offersRes } = useQuery({
		...barterCalcQueries.offers(itemId),
		enabled: !!itemId,
	})
	const { data: serumRes } = useQuery({
		...barterCalcQueries.offers(SERUM_ITEM_ID),
		enabled: includeTokens,
	})

	const offers = useMemo(() => offersRes?.recipes ?? [], [offersRes])
	const discountNum = Number(discount) || 0
	const couponApplies = discountNum > 0

	const stockNum = parseNum(stock)
	const tokenStockNum = parseNum(tokenStock)

	const unlimitedRows = useMemo(
		() =>
			offers.map((offer, index) => ({
				index,
				...evaluateOffer(offer, currency, couponApplies, discountNum),
			})),
		[offers, currency, couponApplies, discountNum]
	)
	const bestUnlimited = useMemo(() => {
		if (unlimitedRows.length === 0) return 0
		return unlimitedRows.reduce((a, b) => (b.total <= a.total ? b : a))
			.index
	}, [unlimitedRows])

	const stockEval = useMemo(
		() =>
			evaluateStock(
				offers,
				currency,
				couponApplies,
				discountNum,
				stockNum
			),
		[offers, currency, couponApplies, discountNum, stockNum]
	)

	const tokensPerSerum = useMemo(() => {
		const first = serumRes?.recipes?.[0]
		if (!first) return 0
		const tokenReq = first.items.find((i) => i.item_id === TOKEN_ITEM_ID)
		return tokenReq?.amount ?? 0
	}, [serumRes])

	const tokenAffordable =
		tokensPerSerum > 0 ? Math.floor(tokenStockNum / tokensPerSerum) : 0

	const bestStockRow =
		stockEval.rows.find((r) => r.index === stockEval.bestIndex) ?? null
	const bestStockPick =
		bestStockRow && bestStockRow.affordable ? bestStockRow : null
	const stockRemainder = bestStockPick ? stockNum - bestStockPick.total : 0
	const bestStockOffer = bestStockPick
		? (offers[bestStockPick.index] ?? null)
		: null

	const currencyUnit =
		currency === 'coins'
			? t('barterCalc.coinsUnit')
			: currency === 'shells'
				? t('barterCalc.shellsUnit')
				: t('barterCalc.piecesUnit')

	return (
		<Card.Root className="gap-4">
			<Card.Title className="font-semibold text-base">
				{t('barterCalc.calc')}
			</Card.Title>

			<div className="flex flex-wrap gap-2">
				<Button
					onClick={() => setMode('unlimited')}
					size="sm"
					variant={mode === 'unlimited' ? 'primary' : 'outline'}
				>
					{t('barterCalc.unlimited')}
				</Button>
				<Button
					onClick={() => setMode('stock')}
					size="sm"
					variant={mode === 'stock' ? 'primary' : 'outline'}
				>
					{t('barterCalc.stock')}
				</Button>
			</div>

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				<Combobox
					onValueChange={(v) => setCurrency(v as CalcCurrency)}
					options={[
						{ label: 'barterCalc.noCurrency', value: 'none' },
						{ label: 'barterCalc.coins', value: 'coins' },
						{ label: 'barterCalc.shells', value: 'shells' },
					]}
					placeholder="barterCalc.currency"
					value={currency}
				/>
				<Combobox
					onValueChange={onDiscountChange}
					options={DISCOUNTS.map((d) => ({
						label: d === 0 ? '—' : `${d}%`,
						value: String(d),
					}))}
					placeholder="barterCalc.discount"
					translateOptions={false}
					value={discount}
				/>
				{mode === 'stock' && (
					<Input
						label="barterCalc.stockAmount"
						onChange={(e) => setStock(e.target.value)}
						type="number"
						value={stock}
					/>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				{mode === 'unlimited'
					? unlimitedRows.map((row) => (
							<div
								className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${row.index === bestUnlimited ? 'bg-accent ring-1 ring-primary/50' : 'bg-accent/40'}`}
								key={row.index}
							>
								<span className="text-foreground">
									{t('barterCalc.offer', {
										n: row.index + 1,
									})}
								</span>
								<span className="flex-1 font-mono font-semibold text-primary">
									{row.total.toLocaleString()} {currencyUnit}
								</span>
								{row.money > 0 && (
									<span className="font-mono font-semibold text-foreground text-xs">
										+ {row.money.toLocaleString()} ₽
									</span>
								)}
								{row.index === bestUnlimited &&
									unlimitedRows.length > 1 && (
										<span className="rounded bg-primary/20 px-1.5 py-0.5 font-semibold text-primary text-xs">
											{t('barterCalc.best')}
										</span>
									)}
							</div>
						))
					: stockEval.rows.map((row) => (
							<div
								className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${row.index === stockEval.bestIndex ? 'bg-accent ring-1 ring-primary/50' : 'bg-accent/40'}`}
								key={row.index}
							>
								<span className="text-foreground">
									{t('barterCalc.offer', {
										n: row.index + 1,
									})}
								</span>
								<span className="flex-1 font-mono font-semibold text-primary">
									{row.total.toLocaleString()} {currencyUnit}
								</span>
								{row.money > 0 && (
									<span className="font-mono font-semibold text-foreground text-xs">
										+ {row.money.toLocaleString()} ₽
									</span>
								)}
								{row.affordable ? (
									<span className="rounded bg-green-500/20 px-1.5 py-0.5 font-semibold text-green-400 text-xs">
										{t('barterCalc.affordable')}
									</span>
								) : (
									<span className="rounded bg-red-500/20 px-1.5 py-0.5 font-semibold text-red-400 text-xs">
										{t('barterCalc.shortage', {
											n: row.shortage.toLocaleString(),
										})}
									</span>
								)}
								{row.index === stockEval.bestIndex && (
									<span className="rounded bg-primary/20 px-1.5 py-0.5 font-semibold text-primary text-xs">
										{t('barterCalc.best')}
									</span>
								)}
							</div>
						))}
				{offers.length === 0 && (
					<p className="text-foreground text-sm">…</p>
				)}
			</div>

			{mode === 'stock' && bestStockPick && bestStockOffer && (
				<div className="flex flex-col gap-1.5 rounded-lg bg-accent/60 px-3 py-2.5">
					<div className="flex items-center justify-between gap-2 text-sm">
						<span className="font-semibold">
							{t('barterCalc.bestPick')}:{' '}
							{t('barterCalc.offer', {
								n: bestStockPick.index + 1,
							})}
						</span>
						<span className="font-mono text-green-400">
							{t('barterCalc.remainder', {
								n: stockRemainder.toLocaleString(),
							})}{' '}
							{currencyUnit}
						</span>
					</div>
					{bestStockOffer.items.map((item) => {
						const name =
							messageToString(item.lines as never, locale) ||
							item.item_id
						return (
							<div
								className="flex items-center gap-2 rounded-lg bg-accent/40 px-2 py-1.5 text-sm"
								key={item.item_id}
							>
								{item.category && (
									<Image
										alt={name}
										height={24}
										src={`https://cdn.stalhub.dev/db/icons${item.category}.png`}
										width={24}
									/>
								)}
								<span className="flex-1 truncate">{name}</span>
								<span className="font-mono text-primary">
									×
									{applyDiscount(
										item.amount,
										couponApplies ? discountNum : 0
									)}
								</span>
							</div>
						)
					})}
					{bestStockPick.money > 0 && (
						<div className="flex items-center justify-between text-sm">
							<span className="text-foreground">
								{t('barterCalc.totalPrice')}
							</span>
							<span className="font-mono font-semibold text-primary">
								{bestStockPick.money.toLocaleString()} ₽
							</span>
						</div>
					)}
				</div>
			)}

			<div className="flex flex-col gap-2 rounded-lg bg-accent/40 px-3 py-2.5">
				<CheckBox
					checked={includeTokens}
					label={t('barterCalc.includeTokens')}
					onCheckedChange={onIncludeTokensChange}
				/>
				{includeTokens && (
					<>
						{mode === 'unlimited' ? (
							<div className="flex items-center justify-between text-sm">
								<span className="text-foreground">
									{t('barterCalc.tokensNeed')}
								</span>
								<span className="font-mono font-semibold text-primary">
									{tokenTotal.toLocaleString()}{' '}
									{t('barterCalc.tokensUnit')}
								</span>
							</div>
						) : (
							<div className="flex flex-col gap-2">
								<Input
									label="barterCalc.tokenStock"
									onChange={(e) =>
										setTokenStock(e.target.value)
									}
									type="number"
									value={tokenStock}
								/>
								{tokensPerSerum > 0 && (
									<div className="flex items-center justify-between text-sm">
										<span className="text-foreground">
											{t('barterCalc.tokensEnough', {
												have: tokenAffordable,
												need: serumNeeded,
											})}
										</span>
										{tokenAffordable >= serumNeeded &&
										serumNeeded > 0 ? (
											<span className="rounded bg-green-500/20 px-1.5 py-0.5 font-semibold text-green-400 text-xs">
												{t('barterCalc.affordable')}
											</span>
										) : (
											<span className="rounded bg-red-500/20 px-1.5 py-0.5 font-semibold text-red-400 text-xs">
												{t('barterCalc.shortageSerum', {
													n: Math.max(
														0,
														serumNeeded -
															tokenAffordable
													),
												})}
											</span>
										)}
									</div>
								)}
							</div>
						)}
					</>
				)}
			</div>
		</Card.Root>
	)
}
