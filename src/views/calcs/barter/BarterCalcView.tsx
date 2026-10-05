'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { CheckBox } from '@/components/ui/CheckBox'
import Input from '@/components/ui/Input'
import { getLocale } from '@/lib/getLocale'
import {
	type BarterTreeNode,
	barterCalcQueries,
} from '@/queries/barter/barter-calc.queries'
import { messageToString } from '@/utils/itemUtils'

function iconUrl(category: string) {
	return category ? `https://cdn.stalhub.dev/db/icons${category}.png` : null
}

function collectTotals(
	node: BarterTreeNode,
	mult: number,
	done: Set<string>,
	path: string,
	out: Map<string, { name: string; category: string; amount: number }>
) {
	const key = `${path}/${node.item_id}`
	if (done.has(key)) return
	const cur = mult * node.amount
	if (node.children.length === 0) {
		const e = out.get(node.item_id)
		if (e) e.amount += cur
		else
			out.set(node.item_id, {
				name: node.name,
				category: node.category,
				amount: cur,
			})
		return
	}
	for (const ch of node.children) collectTotals(ch, cur, done, key, out)
}

function TreeNode({
	node,
	path,
	depth,
	done,
	onToggle,
}: {
	node: BarterTreeNode
	path: string
	depth: number
	done: Set<string>
	onToggle: (key: string) => void
}) {
	const key = `${path}/${node.item_id}`
	const isDone = done.has(key)
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
						alt={node.name}
						height={28}
						src={iconUrl(node.category)!}
						width={28}
					/>
				)}
				<span className="font-medium text-sm">
					{node.name} ×{node.amount}
				</span>
				{node.money > 0 && (
					<span className="font-mono text-xs text-yellow-400">
						{node.money.toLocaleString()} ₽
					</span>
				)}
				{node.level && (
					<span className="font-mono text-text-accent text-xs">
						ур. {node.level}
					</span>
				)}
				{!node.craftable && (
					<span className="text-text-accent text-xs">— базовый</span>
				)}
			</div>
			{!isDone &&
				node.children.map((ch, i) => (
					<TreeNode
						depth={depth + 1}
						done={done}
						key={`${ch.item_id}-${i}`}
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
	const [search, setSearch] = useState('')
	const [selected, setSelected] = useState('')
	const [done, setDone] = useState<Set<string>>(new Set())

	const { data: list } = useQuery(barterCalcQueries.list())
	const { data: tree, isPending } = useQuery({
		...barterCalcQueries.tree(selected),
		enabled: !!selected,
	})

	useEffect(() => {
		if (!selected) return
		try {
			const raw = localStorage.getItem(`barter-done-${selected}`)
			setDone(new Set(raw ? JSON.parse(raw) : []))
		} catch {
			setDone(new Set())
		}
	}, [selected])

	const toggle = (key: string) => {
		setDone((prev) => {
			const next = new Set(prev)
			if (next.has(key)) next.delete(key)
			else next.add(key)
			try {
				localStorage.setItem(
					`barter-done-${selected}`,
					JSON.stringify([...next])
				)
			} catch {}
			return next
		})
	}

	const items = useMemo(() => {
		const q = search.trim().toLowerCase()
		const arr = list?.items ?? []
		if (!q) return arr.slice(0, 50)
		return arr
			.filter((i) => {
				const name = messageToString(
					i.lines as never,
					locale
				).toLowerCase()
				return name.includes(q) || i.item_id.toLowerCase().includes(q)
			})
			.slice(0, 50)
	}, [list, search, locale])

	const totals = useMemo(() => {
		if (!tree) return []
		const out = new Map<
			string,
			{ name: string; category: string; amount: number }
		>()
		collectTotals(tree, 1, done, '', out)
		return [...out.entries()].map(([id, v]) => ({ id, ...v }))
	}, [tree, done])

	return (
		<section className="mx-auto flex max-w-380 flex-col gap-6 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<div>
				<h1
					className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
				>
					{t('barterCalc.title')}
				</h1>
				<p className="mt-2 font-medium text-muted-foreground text-sm">
					{t('barterCalc.subtitle')}
				</p>
			</div>

			<div className="grid gap-4 lg:grid-cols-[320px_1fr]">
				<div className="flex flex-col gap-2 rounded-xl border-2 border-primary/20 bg-card p-4">
					<Input
						label="barterCalc.search"
						onChange={(e) => setSearch(e.target.value)}
						value={search}
					/>
					<div className="flex max-h-120 flex-col gap-1 overflow-y-auto">
						{items.map((i) => (
							<button
								className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-accent/60 ${selected === i.item_id ? 'bg-accent' : ''}`}
								key={i.item_id}
								onClick={() => setSelected(i.item_id)}
								type="button"
							>
								{i.category && (
									<Image
										alt={i.item_id}
										height={24}
										src={`https://cdn.stalhub.dev/db/icons${i.category}.png`}
										width={24}
									/>
								)}
								<span className="truncate">
									{messageToString(i.lines as never, locale)}
								</span>
							</button>
						))}
					</div>
				</div>

				<div className="flex flex-col gap-4">
					{!selected ? (
						<div className="flex items-center gap-2 rounded-xl border-2 border-primary/20 bg-card p-8 text-sm text-text-accent">
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
									node={tree}
									onToggle={toggle}
									path=""
								/>
							</div>
							<div className="rounded-xl border-2 border-primary/20 bg-card p-4">
								<div className="mb-2 font-semibold text-sm">
									{t('barterCalc.totals')}
								</div>
								{totals.length === 0 ? (
									<p className="text-sm text-text-accent">
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
												<span className="font-mono text-yellow-400">
													×{r.amount}
												</span>
											</div>
										))}
									</div>
								)}
								<Button
									className="mt-3"
									onClick={() => {
										setDone(new Set())
										try {
											localStorage.removeItem(
												`barter-done-${selected}`
											)
										} catch {}
									}}
									size="sm"
									variant="outline"
								>
									{t('barterCalc.reset')}
								</Button>
							</div>
						</>
					) : null}
				</div>
			</div>
		</section>
	)
}
