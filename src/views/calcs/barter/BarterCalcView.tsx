'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckBox } from '@/components/ui/CheckBox'
import { getLocale } from '@/lib/getLocale'
import {
	type BarterTreeNode,
	barterCalcQueries,
	SERUM_ITEM_ID,
	TOKEN_ITEM_ID,
} from '@/queries/barter/barter-calc.queries'
import type { Locale } from '@/types/item.type'
import { applyDiscount } from '@/utils/barterUtils'
import { messageToString } from '@/utils/itemUtils'
import BarterCalcPanel from './components/BarterCalcPanel'
import BarterPickerModal, {
	type BarterListEntry,
} from './components/BarterPickerModal'

function iconUrl(category: string) {
	return category ? `https://cdn.stalhub.dev/db/icons${category}.png` : null
}

function getNodeName(
	node: BarterTreeNode,
	locale: Locale,
	rootFallback?: string
): string {
	const fromLines = node.lines
		? messageToString(node.lines as never, locale)
		: ''
	if (fromLines) return fromLines
	if (node.name && node.name !== node.item_id) return node.name
	if (rootFallback) return rootFallback
	return node.name || node.item_id
}

function collectTotals(
	node: BarterTreeNode,
	mult: number,
	done: Set<string>,
	path: string,
	out: Map<string, { name: string; category: string; amount: number }>,
	moneyAcc: { value: number },
	locale: Locale,
	rootFallback?: string
) {
	const key = `${path}/${node.item_id}`
	if (done.has(key)) return
	const cur = mult * node.amount
	moneyAcc.value += node.money * mult
	if (node.children.length === 0) {
		const e = out.get(node.item_id)
		const name = getNodeName(node, locale, rootFallback)
		if (e) e.amount += cur
		else
			out.set(node.item_id, {
				name,
				category: node.category,
				amount: cur,
			})
		return
	}
	for (const ch of node.children)
		collectTotals(ch, cur, done, key, out, moneyAcc, locale)
}

/** Сколько сыворотки нужно по дереву (для расчёта жетонов). */
function collectSerum(
	node: BarterTreeNode,
	mult: number,
	done: Set<string>,
	path: string
): number {
	const key = `${path}/${node.item_id}`
	if (done.has(key)) return 0
	const cur = mult * node.amount
	let acc = node.item_id === SERUM_ITEM_ID ? cur : 0
	for (const ch of node.children) acc += collectSerum(ch, cur, done, key)
	return acc
}

function TreeNode({
	node,
	path,
	depth,
	done,
	onToggle,
	locale,
	rootFallback,
}: {
	node: BarterTreeNode
	path: string
	depth: number
	done: Set<string>
	onToggle: (key: string) => void
	locale: Locale
	rootFallback?: string
}) {
	const key = `${path}/${node.item_id}`
	const isDone = done.has(key)
	const name = getNodeName(
		node,
		locale,
		depth === 0 ? rootFallback : undefined
	)
	return (
		<div
			className={
				depth > 0 ? 'ml-4 border-primary/20 border-l-2 pl-3' : ''
			}
		>
			<div
				className={`flex items-center gap-2 rounded-lg p-2 ${isDone ? 'line-through opacity-50' : 'bg-accent/40'}`}
			>
				<CheckBox
					checked={isDone}
					onCheckedChange={() => onToggle(key)}
				/>
				{iconUrl(node.category) && (
					<Image
						alt={name}
						height={28}
						src={iconUrl(node.category)!}
						width={28}
					/>
				)}
				<span className="font-medium text-sm">
					{name} ×{node.amount}
				</span>
				{node.money > 0 && (
					<span className="font-mono font-semibold text-primary text-xs">
						{node.money.toLocaleString()} ₽
					</span>
				)}
				{node.level && (
					<span className="font-mono font-semibold text-foreground text-xs">
						ур. {node.level}
					</span>
				)}
			</div>
			{!isDone &&
				node.children.map((ch, i) => (
					<TreeNode
						depth={depth + 1}
						done={done}
						key={`${ch.item_id}-${i}`}
						locale={locale}
						node={ch}
						onToggle={onToggle}
						path={key}
					/>
				))}
		</div>
	)
}

export default function BarterCalcView() {
	const t = useTranslations()
	const locale = getLocale()
	const [selected, setSelected] = useState<BarterListEntry | null>(null)
	const [showPicker, setShowPicker] = useState(false)
	const [done, setDone] = useState<Set<string>>(new Set())
	const [includeTokens, setIncludeTokens] = useState(true)
	const [discount, setDiscount] = useState('0')

	const selectedId = selected?.item_id ?? ''
	const rootFallback = selected
		? messageToString(selected.lines as never, locale) || selected.item_id
		: ''

	const { data: list, isLoading: listLoading } = useQuery(
		barterCalcQueries.list()
	)
	const { data: tree, isPending } = useQuery({
		...barterCalcQueries.tree(
			selectedId,
			selected
				? {
						lines: selected.lines,
						category: selected.category,
						color: selected.color,
					}
				: undefined,
			includeTokens
		),
		enabled: !!selectedId,
	})

	useEffect(() => {
		if (!selectedId) return
		try {
			const raw = localStorage.getItem(`barter-done-${selectedId}`)
			setDone(new Set(raw ? JSON.parse(raw) : []))
		} catch {
			setDone(new Set())
		}
	}, [selectedId])

	const toggle = (key: string) => {
		setDone((prev) => {
			const next = new Set(prev)
			if (next.has(key)) next.delete(key)
			else next.add(key)
			try {
				localStorage.setItem(
					`barter-done-${selectedId}`,
					JSON.stringify([...next])
				)
			} catch {}
			return next
		})
	}

	const { totals, totalMoney, serumNeeded, tokenTotal } = useMemo(() => {
		if (!tree)
			return { totals: [], totalMoney: 0, serumNeeded: 0, tokenTotal: 0 }
		const out = new Map<
			string,
			{ name: string; category: string; amount: number }
		>()
		const moneyAcc = { value: 0 }
		collectTotals(tree, 1, done, '', out, moneyAcc, locale, rootFallback)
		const discountNum = Number(discount) || 0
		const serum = includeTokens
			? collectSerum(tree, 1, done, '')
			: (out.get(SERUM_ITEM_ID)?.amount ?? 0)
		return {
			totals: [...out.entries()].map(([id, v]) => ({
				id,
				...v,
				amount:
					id === TOKEN_ITEM_ID
						? v.amount
						: applyDiscount(v.amount, discountNum),
			})),
			totalMoney: applyDiscount(moneyAcc.value, discountNum),
			serumNeeded: serum,
			tokenTotal: includeTokens
				? (out.get(TOKEN_ITEM_ID)?.amount ?? 0)
				: 0,
		}
	}, [tree, done, locale, rootFallback, includeTokens, discount])

	const selectedIcon = selected ? iconUrl(selected.category) : null

	return (
		<section className="mx-auto flex max-w-300 flex-col gap-4 px-4 pt-32 pb-12 sm:px-6">
			<h1
				className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
			>
				{t('barterCalc.title')}
			</h1>

			<Card.Root className="gap-4">
				<div className="flex flex-wrap items-center gap-3">
					{selected && selectedIcon ? (
						<Image
							alt={rootFallback}
							height={40}
							src={selectedIcon}
							width={40}
						/>
					) : (
						<div className="flex size-10 items-center justify-center rounded-lg bg-accent/40">
							<Icon
								className="text-foreground text-xl"
								icon="lucide:package"
							/>
						</div>
					)}
					<div className="min-w-0 flex-1">
						{selected ? (
							<>
								<div className="truncate font-semibold text-lg">
									{rootFallback}
								</div>
							</>
						) : (
							<div className="text-foreground text-sm">
								{t('barterCalc.pick')}
							</div>
						)}
					</div>
					<Button
						className="flex items-center gap-2"
						onClick={() => setShowPicker(true)}
						variant={selected ? 'outline' : 'primary'}
					>
						<Icon icon="lucide:search" />
						{selected
							? t('barterCalc.change')
							: t('barterCalc.select')}
					</Button>
					{selected && (
						<Button
							onClick={() => {
								setDone(new Set())
								try {
									localStorage.removeItem(
										`barter-done-${selectedId}`
									)
								} catch {}
							}}
							size="sm"
							variant="ghost"
						>
							{t('barterCalc.reset')}
						</Button>
					)}
				</div>
			</Card.Root>

			{selected && (
				<BarterCalcPanel
					discount={discount}
					includeTokens={includeTokens}
					itemId={selectedId}
					onDiscountChange={setDiscount}
					onIncludeTokensChange={setIncludeTokens}
					serumNeeded={serumNeeded}
					tokenTotal={tokenTotal}
				/>
			)}

			{!selected ? (
				<div className="flex items-center gap-2 rounded-xl border-2 border-primary/20 bg-card p-8 text-foreground text-sm">
					<Icon icon="lucide:info" />
					{t('barterCalc.pick')}
				</div>
			) : isPending ? (
				<div className="rounded-xl border-2 border-primary/20 bg-card p-8 text-sm">
					…
				</div>
			) : tree ? (
				<>
					<div className="rounded-xl border-2 border-primary/20 bg-card p-4">
						<div className="mb-2 font-semibold text-sm">
							{t('barterCalc.tree')}
						</div>
						<TreeNode
							depth={0}
							done={done}
							locale={locale}
							node={tree}
							onToggle={toggle}
							path=""
							rootFallback={rootFallback}
						/>
					</div>
					<div className="rounded-xl border-2 border-primary/20 bg-card p-4">
						<div className="mb-2 font-semibold text-sm">
							{t('barterCalc.totals')}
						</div>
						{totals.length === 0 ? (
							<p className="text-foreground text-sm">
								{t('barterCalc.allDone')}
							</p>
						) : (
							<div className="flex flex-col gap-1.5">
								{totals.map((r) => (
									<div
										className="flex items-center gap-2 rounded-lg bg-accent/40 px-2 py-1.5 text-sm"
										key={r.id}
									>
										{r.category && (
											<Image
												alt={r.name}
												height={24}
												src={`https://cdn.stalhub.dev/db/icons${r.category}.png`}
												width={24}
											/>
										)}
										<span className="flex-1 truncate">
											{r.name}
										</span>
										<span className="font-mono font-semibold text-primary">
											×{r.amount}
										</span>
									</div>
								))}
							</div>
						)}
						<div className="mt-3 flex items-center justify-between rounded-lg bg-accent/60 px-3 py-2.5">
							<span className="flex items-center gap-2 font-semibold text-sm">
								<Icon
									className="text-primary"
									icon="lucide:coins"
								/>
								{t('barterCalc.totalPrice')}
							</span>
							<span className="font-bold font-mono text-primary">
								{totalMoney.toLocaleString()} ₽
							</span>
						</div>
					</div>
				</>
			) : null}

			<BarterPickerModal
				items={list?.items as BarterListEntry[] | undefined}
				loading={listLoading}
				onOpenChange={setShowPicker}
				onSelect={(item) => {
					setSelected(item)
					setShowPicker(false)
				}}
				open={showPicker}
				selectedId={selectedId}
			/>
		</section>
	)
}
