'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useMemo, useState } from 'react'
import { montserrat, unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'

import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from '@/components/ui/Toast'
import { GITHUB_RAW_BASE } from '@/constants/github.const'
import { tierListQueries } from '@/queries/tier-list/tier-list.queries'
import { tierListService } from '@/services/tier-list/tier-list.service'
import {
	type InfoColor,
	type Item,
	infoColorMap,
	type Locale,
} from '@/types/item.type'
import {
	ALL_TIER_RANKS,
	TIER_RANK_COLORS,
	TierItemKind,
	type TierListEntry,
	TierRank,
} from '@/types/tier-list.type'
import { ItemPickerModal } from '@/views/calcs/builds/lite/components/ItemPickerModal'
import {
	type DndItem,
	TierDndProvider,
	useTierDraggable,
	useTierDroppable,
} from './components/editor-dnd'
import { ItemHoverCard } from './components/ItemHoverCard'
import { getItemIconUrl, getItemName } from './components/ItemPicker'
import { useTierTtk } from './hooks/useTierTtk'

function TierRow({
	rank,
	entries,
	items,
	ttkMap,
	onDrop,
	onRemove,
}: {
	rank: TierRank
	entries: TierListEntry[]
	items: Record<string, Item>
	ttkMap: Record<string, { ttk: number; ammoName: string | null }>
	onDrop: (item: DndItem) => void
	onRemove: (itemId: string) => void
}) {
	const t = useTranslations()
	const colors = TIER_RANK_COLORS[rank]

	const { isOver, droppableProps } = useTierDroppable({
		onDrop: (item: DndItem) => {
			onDrop({ ...item, rank })
		},
		accepts: (item: DndItem) => item.rank !== rank,
	})

	return (
		<div className="flex gap-2">
			<div
				className={`flex size-17 shrink-0 items-center justify-center rounded-lg font-bold text-xl ring-2 ${colors.bg} ${colors.text} ${colors.ring}`}
			>
				{rank}
			</div>
			<div
				{...droppableProps}
				className={`flex min-h-14 flex-1 flex-wrap gap-2 rounded-lg border p-2 transition-colors ${
					isOver
						? 'border-primary bg-primary/5'
						: 'border-muted bg-card/50'
				}`}
			>
				{entries.length === 0 && (
					<span className="flex items-center px-2 font-semibold text-foreground text-sm">
						{t('tierlists.empty')}
					</span>
				)}
				{entries.map((entry) => (
					<DraggableEntry
						ammoName={ttkMap[entry.item_id]?.ammoName ?? null}
						entry={entry}
						item={items[entry.item_id]}
						key={entry.item_id}
						onRemove={onRemove}
						ttk={ttkMap[entry.item_id]?.ttk}
					/>
				))}
			</div>
		</div>
	)
}

function DraggableEntry({
	entry,
	item,
	onRemove,
	ttk,
	ammoName,
}: {
	entry: TierListEntry
	item: Item | undefined
	onRemove: (itemId: string) => void
	ttk?: number
	ammoName?: string | null
}) {
	const locale = useLocale()
	const { isDragging, draggableProps } = useTierDraggable({
		item_id: entry.item_id,
		rank: entry.rank,
		position: entry.position,
	})
	const name = item ? getItemName(item, locale) : entry.item_id

	const content = (
		<div
			{...draggableProps}
			className={`group flex items-center gap-2 rounded-md border border-muted bg-card px-3 py-2 text-sm transition-colors hover:border-primary/30 ${
				isDragging ? 'opacity-50' : ''
			}`}
		>
			<Icon
				className="size-4 cursor-grab text-text-accent/50"
				icon="lucide:grip-vertical"
			/>
			{item && (
				<Image
					alt={name}
					className="size-8 shrink-0 object-contain"
					height={24}
					src={getItemIconUrl(item)}
					width={24}
				/>
			)}
			<span
				className={`${montserrat.className} truncate font-semibold`}
				style={{ color: infoColorMap[item?.color as InfoColor] }}
			>
				{name}
			</span>
			<Button
				className="hidden p-2.5 ring-0 group-hover:block"
				onClick={() => onRemove(entry.item_id)}
				type="button"
				variant={'danger'}
			>
				<Icon className="size-3" icon="lucide:x" />
			</Button>
		</div>
	)

	if (!item) return content

	return (
		<ItemHoverCard ammoName={ammoName} item={item} side="right" ttk={ttk}>
			{content}
		</ItemHoverCard>
	)
}

const TIER_LIST_CATEGORIES: Array<{ key: string; labelKey: string }> = [
	{ key: 'general', labelKey: 'tierlists.categories.general' },
	{ key: 'assault_rifle', labelKey: 'tierlists.categories.assault_rifle' },
	{ key: 'sniper_rifle', labelKey: 'tierlists.categories.sniper_rifle' },
	{ key: 'shotgun_rifle', labelKey: 'tierlists.categories.shotgun_rifle' },
	{
		key: 'submachine_gun',
		labelKey: 'tierlists.categories.submachine_gun',
	},
	{ key: 'machine_gun', labelKey: 'tierlists.categories.machine_gun' },
	{ key: 'pistol', labelKey: 'tierlists.categories.pistol' },
]

export default function TierListEditorView() {
	const t = useTranslations()
	const router = useRouter()
	const params = useParams()
	const queryClient = useQueryClient()
	const editId = params.id as string | undefined
	const isEditing = Boolean(editId)

	const { data: existing, isLoading: loadingExisting } = useQuery({
		...tierListQueries.get(editId!),
		enabled: isEditing,
	})

	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [itemKind, setItemKind] = useState<TierItemKind>(TierItemKind.WEAPON)
	const [category, setCategory] = useState<string | undefined>(undefined)
	const [entries, setEntries] = useState<TierListEntry[]>([])
	const [initialized, setInitialized] = useState(false)
	const [pickerOpen, setPickerOpen] = useState(false)
	const [previewId, setPreviewId] = useState<string | null>(null)
	const locale = useLocale() as Locale

	if (isEditing && existing && !initialized) {
		setTitle(existing.title)
		setDescription(existing.description ?? '')
		setItemKind(existing.item_kind)
		setCategory(existing.category ?? undefined)
		setEntries(existing.entries ?? [])
		setInitialized(true)
	}

	const categoryOptions = useMemo(
		() =>
			TIER_LIST_CATEGORIES.map((cat) => ({
				value: cat.key,
				label: cat.labelKey,
			})),
		[]
	)

	const { data: items } = useQuery({
		queryKey: ['items', itemKind],
		queryFn: async () => {
			const type = itemKind === TierItemKind.WEAPON ? 'weapons' : 'armor'
			const { data } = await axios.get<Record<string, Item>>(
				`${GITHUB_RAW_BASE}/listing/${type}.json`
			)
			return data
		},
	})

	const itemsList = useMemo(
		() => (items ? Object.values(items) : []),
		[items]
	)

	const favoriteType = itemKind === TierItemKind.WEAPON ? 'weapon' : 'armor'

	const { getTtk } = useTierTtk()

	const ttkMap = useMemo(() => {
		if (!items || itemKind !== TierItemKind.WEAPON) return {}
		const map: Record<string, { ttk: number; ammoName: string | null }> = {}
		for (const item of Object.values(items)) {
			const res = getTtk(item)
			if (res.ttk > 0 && Number.isFinite(res.ttk)) {
				map[item.id] = res
			}
		}
		return map
	}, [items, itemKind, getTtk])

	const groupedEntries = useMemo(() => {
		const map: Record<TierRank, TierListEntry[]> = {
			S: [],
			A: [],
			B: [],
			C: [],
			D: [],
			E: [],
		}
		for (const entry of entries) {
			map[entry.rank]?.push(entry)
		}
		return map
	}, [entries])

	const handleAddItem = useCallback((itemId: string) => {
		setEntries((prev) => {
			if (prev.some((e) => e.item_id === itemId)) return prev
			return [
				...prev,
				{
					id: Date.now(),
					item_id: itemId,
					rank: TierRank.D,
					ttk: null,
					position: prev.length,
				},
			]
		})
		setPickerOpen(false)
	}, [])

	const handleRemoveItem = useCallback((itemId: string) => {
		setEntries((prev) => prev.filter((e) => e.item_id !== itemId))
	}, [])

	const handleDrop = useCallback((item: DndItem) => {
		setEntries((prev) =>
			prev.map((e) =>
				e.item_id === item.item_id
					? { ...e, rank: item.rank, position: item.position }
					: e
			)
		)
	}, [])

	const saveMutation = useMutation({
		mutationFn: async () => {
			const data = {
				title,
				description: description || undefined,
				item_kind: itemKind,
				category,
				entries: entries.map((e, i) => ({
					item_id: e.item_id,
					rank: e.rank,
					position: i,
					ttk: null,
				})),
			}

			if (isEditing && editId) {
				return tierListService.update(editId, data)
			}
			return tierListService.create(data)
		},
		onSuccess: (result) => {
			toast.success(t('tierlists.saved'))
			queryClient.invalidateQueries({ queryKey: ['tier-lists'] })
			router.push(`/tierlists/${result.external_id}`)
		},
		onError: () => {
			toast.error(t('tierlists.saveError'))
		},
	})

	if (isEditing && loadingExisting) {
		return (
			<div className="flex flex-col gap-8">
				<Skeleton className="mb-4 h-10 w-64" />
				<Skeleton className="mb-2 h-20 w-full" />
				<Skeleton className="mb-2 h-20 w-full" />
			</div>
		)
	}

	return (
		<TierDndProvider>
			<div className="flex flex-col gap-5">
				<div className="flex items-center justify-between">
					<h1 className={`${unbounded.className} font-bold text-3xl`}>
						{isEditing
							? t('tierlists.editor.edit')
							: t('tierlists.editor.create')}
					</h1>
					<Button
						className="gap-2"
						disabled={!title.trim() || saveMutation.isPending}
						onClick={() => saveMutation.mutate()}
						size="sm"
					>
						{saveMutation.isPending ? (
							<Icon
								className="size-4 animate-spin"
								icon="lucide:loader-circle"
							/>
						) : (
							<Icon className="size-4" icon="lucide:save" />
						)}
						{t('tierlists.editor.save')}
					</Button>
				</div>

				<div className="flex flex-col gap-3">
					<Input
						label="tierlists.editor.title"
						onChange={(e) => setTitle(e.target.value)}
						value={title}
					/>
					<Input
						label="tierlists.editor.description"
						onChange={(e) => setDescription(e.target.value)}
						value={description}
					/>
					<div>
						<p
							className={`${montserrat.className} mb-1 font-bold text-muted-foreground text-sm`}
						>
							{t('tierlists.editor.category')}
						</p>
						<Combobox
							onValueChange={setCategory}
							options={categoryOptions}
							placeholder="tierlists.editor.categoryPlaceholder"
							value={category}
						/>
					</div>
					<div className="flex gap-2">
						<Button
							onClick={() => setItemKind(TierItemKind.WEAPON)}
							size="sm"
							variant={
								itemKind === TierItemKind.WEAPON
									? 'primary'
									: 'outline'
							}
						>
							{t('tierlists.weapons')}
						</Button>
						<Button
							onClick={() => setItemKind(TierItemKind.ARMOR)}
							size="sm"
							variant={
								itemKind === TierItemKind.ARMOR
									? 'primary'
									: 'outline'
							}
						>
							{t('tierlists.armor')}
						</Button>
					</div>
				</div>

				<div className="space-y-2">
					{ALL_TIER_RANKS.map((rank) => (
						<TierRow
							entries={groupedEntries[rank] ?? []}
							items={items ?? {}}
							key={rank}
							onDrop={handleDrop}
							onRemove={handleRemoveItem}
							rank={rank}
							ttkMap={ttkMap}
						/>
					))}
				</div>

				<Button
					className="w-fit gap-2"
					onClick={() => {
						setPreviewId(null)
						setPickerOpen(true)
					}}
					size="sm"
					variant="primary"
				>
					<Icon className="size-4" icon="lucide:plus" />
					{t('tierlists.editor.addItem')}
				</Button>

				<ItemPickerModal
					emptyTitle="tierlists.empty"
					favoriteType={favoriteType}
					items={itemsList}
					locale={locale}
					onConfirm={handleAddItem}
					previewId={previewId}
					searchLabel="tierlists.editor.searchItems"
					setPreviewId={setPreviewId}
					setShowModal={setPickerOpen}
					showModal={pickerOpen}
					title={t('tierlists.editor.pickItem')}
				/>
			</div>
		</TierDndProvider>
	)
}
