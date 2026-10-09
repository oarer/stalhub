'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/Switch'
import { Table } from '@/components/ui/Table'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/Toast'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminScNodeQueries } from '@/queries/admin/sc-node.queries'
import { adminScNodeService } from '@/services/admin/sc-node.service'
import type {
	AdminScNode,
	AdminScNodePing,
	AdminScTokenUsage,
} from '@/types/admin.type'

const QUERY_KEY = ['admin', 'sc-nodes']

function UsageBar({ used, total }: { used: number; total: number }) {
	const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
	const color =
		pct >= 100
			? 'bg-red-500'
			: pct >= 80
				? 'bg-amber-500'
				: 'bg-emerald-500'
	return (
		<div className="flex items-center gap-2">
			<div className="h-2 min-w-24 flex-1 overflow-hidden rounded-full bg-border/20">
				<div
					className={`h-full rounded-full transition-all ${color}`}
					style={{ width: `${pct}%` }}
				/>
			</div>
			<span className="font-mono text-neutral-400 text-xs">
				{used}/{total}
			</span>
		</div>
	)
}

function secondsUntil(iso: string): number {
	return Math.max(
		0,
		Math.round((new Date(iso).getTime() - Date.now()) / 1000)
	)
}

export default function ScNodesAdminView() {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const { data: overview } = useSuspenseQuery(adminScNodeQueries.overview())

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: QUERY_KEY })

	// node form
	const [nodeName, setNodeName] = useState('')
	const [nodeUrl, setNodeUrl] = useState('')
	const [nodeKey, setNodeKey] = useState('')
	const [nodePriority, setNodePriority] = useState('0')
	// token forms
	const [tokenLabel, setTokenLabel] = useState('')
	const [tokenValue, setTokenValue] = useState('')
	const [bulkText, setBulkText] = useState('')
	// per-row state
	const [pingResults, setPingResults] = useState<
		Record<number, AdminScNodePing & { at: number }>
	>({})
	const [deleteNode, setDeleteNode] = useState<AdminScNode | null>(null)
	const [deleteToken, setDeleteToken] = useState<AdminScTokenUsage | null>(
		null
	)

	const onError = () => toast.error(t('admin.scNodes.toast.error'))

	const createNodeMutation = useMutation({
		mutationFn: () =>
			adminScNodeService.createNode({
				name: nodeName.trim(),
				base_url: nodeUrl.trim(),
				api_key: nodeKey.trim() || undefined,
				priority: Number(nodePriority) || 0,
			}),
		onSuccess: () => {
			toast.success(t('admin.scNodes.toast.nodeCreated'))
			invalidate()
			setNodeName('')
			setNodeUrl('')
			setNodeKey('')
			setNodePriority('0')
		},
		onError,
	})

	const toggleNodeMutation = useMutation({
		mutationFn: (node: AdminScNode) =>
			adminScNodeService.updateNode(node.id, { enabled: !node.enabled }),
		onSuccess: () => {
			toast.success(t('admin.scNodes.toast.updated'))
			invalidate()
		},
		onError,
	})

	const deleteNodeMutation = useMutation({
		mutationFn: (id: number) => adminScNodeService.deleteNode(id),
		onSuccess: () => {
			toast.success(t('admin.scNodes.toast.nodeDeleted'))
			invalidate()
			setDeleteNode(null)
		},
		onError,
	})

	const pingMutation = useMutation({
		mutationFn: (id: number) => adminScNodeService.pingNode(id),
		onSuccess: (res, id) => {
			setPingResults((prev) => ({
				...prev,
				[id]: { ...res, at: Date.now() },
			}))
			if (!res.ok) toast.error(t('admin.scNodes.toast.pingFailed'))
			invalidate()
		},
		onError,
	})

	const createTokenMutation = useMutation({
		mutationFn: () =>
			adminScNodeService.createToken({
				label: tokenLabel.trim() || undefined,
				token: tokenValue.trim(),
			}),
		onSuccess: () => {
			toast.success(t('admin.scNodes.toast.tokenCreated'))
			invalidate()
			setTokenLabel('')
			setTokenValue('')
		},
		onError,
	})

	const bulkMutation = useMutation({
		mutationFn: () => adminScNodeService.bulkTokens({ tokens: bulkText }),
		onSuccess: (res) => {
			toast.success(
				t('admin.scNodes.toast.bulkLoaded', {
					created: res.created,
					skipped: res.skipped,
				})
			)
			invalidate()
			setBulkText('')
		},
		onError,
	})

	const toggleTokenMutation = useMutation({
		mutationFn: (token: AdminScTokenUsage) =>
			adminScNodeService.updateToken(token.id, {
				enabled: !token.enabled,
			}),
		onSuccess: () => {
			toast.success(t('admin.scNodes.toast.updated'))
			invalidate()
		},
		onError,
	})

	const deleteTokenMutation = useMutation({
		mutationFn: (id: number) => adminScNodeService.deleteToken(id),
		onSuccess: () => {
			toast.success(t('admin.scNodes.toast.tokenDeleted'))
			invalidate()
			setDeleteToken(null)
		},
		onError,
	})

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h1
					className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
				>
					{t('admin.scNodes.title')}
				</h1>
				<span className="flex items-center gap-1.5 text-neutral-400 text-sm">
					<Icon
						className="size-4 animate-spin"
						icon="lucide:refresh-cw"
					/>
					{t('admin.scNodes.autoRefresh')}
				</span>
			</div>

			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				<Card.Root>
					<Card.Content className="flex items-center gap-3 py-4">
						<div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/10">
							<Icon
								className="size-5 text-sky-400"
								icon="lucide:server"
							/>
						</div>
						<div>
							<p className="font-medium font-mono text-2xl">
								{overview.nodes_up}
							</p>
							<p className="text-foreground text-xs">
								{t('admin.scNodes.stats.nodesUp')}
							</p>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Content className="flex items-center gap-3 py-4">
						<div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
							<Icon
								className="size-5 text-emerald-400"
								icon="lucide:key"
							/>
						</div>
						<div>
							<p className="font-medium font-mono text-2xl">
								{overview.tokens_up}
							</p>
							<p className="text-foreground text-xs">
								{t('admin.scNodes.stats.tokensUp')}
							</p>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Content className="flex items-center gap-3 py-4">
						<div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
							<Icon
								className="size-5 text-amber-400"
								icon="lucide:gauge"
							/>
						</div>
						<div>
							<p className="font-medium font-mono text-2xl">
								{overview.quota_per_minute}
							</p>
							<p className="text-foreground text-xs">
								{t('admin.scNodes.stats.quotaPerMin')}
							</p>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Content className="flex items-center gap-3 py-4">
						<div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
							<Icon
								className="size-5 text-violet-400"
								icon="lucide:coins"
							/>
						</div>
						<div>
							<p className="font-medium font-mono text-2xl">
								{overview.costs.default}/
								{overview.costs.auction}
							</p>
							<p className="text-foreground text-xs">
								{t('admin.scNodes.stats.costs')}
							</p>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:server" />
						{t('admin.scNodes.nodes.title')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-3">
						<div className="flex flex-col flex-wrap gap-3 md:flex-row md:items-end">
							<div className="w-full flex-1 md:w-auto md:max-w-48">
								<Input
									label="admin.scNodes.nodes.name"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setNodeName(e.target.value)}
									value={nodeName}
								/>
							</div>
							<div className="w-full flex-1 md:w-auto md:max-w-72">
								<Input
									label="admin.scNodes.nodes.baseUrl"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setNodeUrl(e.target.value)}
									placeholder="http://node-1:3101"
									value={nodeUrl}
								/>
							</div>
							<div className="w-full flex-1 md:w-auto md:max-w-60">
								<Input
									label="admin.scNodes.nodes.apiKey"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setNodeKey(e.target.value)}
									type="password"
									value={nodeKey}
								/>
							</div>
							<div className="w-full md:w-28">
								<Input
									label="admin.scNodes.nodes.priority"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setNodePriority(e.target.value)}
									type="number"
									value={nodePriority}
								/>
							</div>
							<Button
								disabled={!nodeName.trim() || !nodeUrl.trim()}
								loading={createNodeMutation.isPending}
								onClick={() => createNodeMutation.mutate()}
							>
								{t('admin.scNodes.nodes.add')}
							</Button>
						</div>

						<div className="overflow-x-auto">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>
											{t('admin.scNodes.nodes.name')}
										</Table.Head>
										<Table.Head>URL</Table.Head>
										<Table.Head>
											{t('admin.scNodes.nodes.status')}
										</Table.Head>
										<Table.Head>
											{t('admin.scNodes.tokens.usage')} IP
										</Table.Head>
										<Table.Head>
											{t('admin.scNodes.nodes.ping')}
										</Table.Head>
										<Table.Head />
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{overview.nodes.map((node) => {
										const ping = pingResults[node.id]
										return (
											<Table.Row key={node.id}>
												<Table.Cell>
													<span className="font-semibold text-sm">
														{node.name}
													</span>
													<span className="ml-2 font-mono text-neutral-400 text-xs">
														prio {node.priority}
													</span>
												</Table.Cell>
												<Table.Cell>
													<span className="font-mono text-neutral-400 text-xs">
														{node.base_url}
													</span>
													{node.last_error && (
														<p className="max-w-64 truncate text-red-400 text-xs">
															{node.last_error}
														</p>
													)}
												</Table.Cell>
												<Table.Cell>
													<div className="flex items-center gap-2">
														<Switch
															checked={
																node.enabled
															}
															onCheckedChange={() =>
																toggleNodeMutation.mutate(
																	node
																)
															}
															size="sm"
														/>
														<Badge
															variant={
																node.enabled
																	? 'primary'
																	: 'secondary'
															}
														>
															{node.enabled
																? t(
																		'admin.scNodes.nodes.on'
																	)
																: t(
																		'admin.scNodes.nodes.off'
																	)}
														</Badge>
													</div>
													{node.last_seen_at && (
														<p className="mt-1 text-neutral-400 text-xs">
															{new Date(
																node.last_seen_at
															).toLocaleString()}
														</p>
													)}
												</Table.Cell>
												<Table.Cell>
													<div className="min-w-40">
														<UsageBar
															total={
																overview.node_quota_per_minute
															}
															used={node.used}
														/>
														<p className="mt-1 font-mono text-neutral-400 text-xs">
															{secondsUntil(
																node.reset_at
															)}
															s
														</p>
													</div>
												</Table.Cell>
												<Table.Cell>
													<div className="flex items-center gap-2">
														<Button
															loading={
																pingMutation.isPending
															}
															onClick={() =>
																pingMutation.mutate(
																	node.id
																)
															}
															size="sm"
															variant="outline"
														>
															<Icon icon="lucide:activity" />
														</Button>
														{ping &&
															(ping.ok ? (
																<span className="font-mono text-emerald-400 text-xs">
																	{
																		ping.latency_ms
																	}
																	ms
																</span>
															) : (
																<span className="text-red-400 text-xs">
																	fail
																</span>
															))}
													</div>
												</Table.Cell>
												<Table.Cell>
													<Button
														onClick={() =>
															setDeleteNode(node)
														}
														size="sm"
														variant="ghost"
													>
														<Icon
															className="text-red-400"
															icon="lucide:trash-2"
														/>
													</Button>
												</Table.Cell>
											</Table.Row>
										)
									})}
									{overview.nodes.length === 0 && (
										<Table.Row>
											<Table.Cell>
												<span className="text-neutral-400 text-sm">
													{t(
														'admin.scNodes.nodes.empty'
													)}
												</span>
											</Table.Cell>
											<Table.Cell />
											<Table.Cell />
											<Table.Cell />
											<Table.Cell />
											<Table.Cell />
										</Table.Row>
									)}
								</Table.Body>
							</Table.Root>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:key" />
						{t('admin.scNodes.tokens.title')}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col flex-wrap gap-3 md:flex-row md:items-end">
							<div className="w-full flex-1 md:w-auto md:max-w-48">
								<Input
									label="admin.scNodes.tokens.label"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setTokenLabel(e.target.value)}
									value={tokenLabel}
								/>
							</div>
							<div className="w-full flex-1">
								<Input
									label="admin.scNodes.tokens.token"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => setTokenValue(e.target.value)}
									type="password"
									value={tokenValue}
								/>
							</div>
							<Button
								disabled={!tokenValue.trim()}
								loading={createTokenMutation.isPending}
								onClick={() => createTokenMutation.mutate()}
							>
								{t('admin.scNodes.tokens.add')}
							</Button>
						</div>

						<div className="flex flex-col gap-2">
							<p className="font-semibold text-foreground text-xs">
								{t('admin.scNodes.tokens.bulk')}
							</p>
							<Textarea
								className="min-h-20 w-full bg-background font-mono font-normal text-xs placeholder:text-neutral-500 focus:border-sky-500/50"
								onChange={(e) => setBulkText(e.target.value)}
								placeholder={t(
									'admin.scNodes.tokens.bulkPlaceholder'
								)}
								value={bulkText}
							/>
							<div>
								<Button
									disabled={!bulkText.trim()}
									loading={bulkMutation.isPending}
									onClick={() => bulkMutation.mutate()}
									size="sm"
									variant="outline"
								>
									<Icon icon="lucide:upload" />
									{t('admin.scNodes.tokens.bulkButton')}
								</Button>
							</div>
						</div>

						<div className="overflow-x-auto">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>
											{t('admin.scNodes.tokens.label')}
										</Table.Head>
										<Table.Head>
											{t('admin.scNodes.tokens.usage')}
										</Table.Head>
										<Table.Head>
											{t('admin.scNodes.tokens.resetIn')}
										</Table.Head>
										<Table.Head />
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{overview.tokens.map((token) => (
										<Table.Row
											className={
												!token.enabled
													? 'opacity-50'
													: ''
											}
											key={token.id}
										>
											<Table.Cell>
												<span className="font-semibold text-sm">
													{token.label ||
														`token #${token.id}`}
												</span>
												<span className="ml-2 font-mono text-neutral-400 text-xs">
													…{token.tail}
												</span>
											</Table.Cell>
											<Table.Cell>
												<div className="min-w-48">
													<UsageBar
														total={
															overview.quota_per_minute
														}
														used={token.used}
													/>
												</div>
											</Table.Cell>
											<Table.Cell>
												<span className="font-mono text-neutral-400 text-xs">
													{secondsUntil(
														token.reset_at
													)}
													s
												</span>
											</Table.Cell>
											<Table.Cell>
												<div className="flex items-center gap-1">
													<Switch
														checked={token.enabled}
														onCheckedChange={() =>
															toggleTokenMutation.mutate(
																token
															)
														}
														size="sm"
													/>
													<Button
														onClick={() =>
															setDeleteToken(
																token
															)
														}
														size="sm"
														variant="ghost"
													>
														<Icon
															className="text-red-400"
															icon="lucide:trash-2"
														/>
													</Button>
												</div>
											</Table.Cell>
										</Table.Row>
									))}
									{overview.tokens.length === 0 && (
										<Table.Row>
											<Table.Cell>
												<span className="text-neutral-400 text-sm">
													{t(
														'admin.scNodes.tokens.empty'
													)}
												</span>
											</Table.Cell>
											<Table.Cell />
											<Table.Cell />
											<Table.Cell />
										</Table.Row>
									)}
								</Table.Body>
							</Table.Root>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Modal.Root
				onOpenChange={(o) => {
					if (!o) setDeleteNode(null)
				}}
				open={!!deleteNode}
			>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{t('admin.scNodes.nodes.deleteTitle')}
						</Modal.Title>
						<Modal.Description>
							{deleteNode?.name}
						</Modal.Description>
					</Modal.Header>
					<Modal.Footer>
						<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
						<Modal.Action
							closeOnClick
							onClick={() =>
								deleteNode &&
								deleteNodeMutation.mutate(deleteNode.id)
							}
							variant="danger"
						>
							{t('clan.common.delete')}
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>

			<Modal.Root
				onOpenChange={(o) => {
					if (!o) setDeleteToken(null)
				}}
				open={!!deleteToken}
			>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{t('admin.scNodes.tokens.deleteTitle')}
						</Modal.Title>
						<Modal.Description>
							{deleteToken?.label || `#${deleteToken?.id}`} (…
							{deleteToken?.tail})
						</Modal.Description>
					</Modal.Header>
					<Modal.Footer>
						<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
						<Modal.Action
							closeOnClick
							onClick={() =>
								deleteToken &&
								deleteTokenMutation.mutate(deleteToken.id)
							}
							variant="danger"
						>
							{t('clan.common.delete')}
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}
