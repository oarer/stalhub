'use client'

import { Icon } from '@iconify/react'
import { useQueries } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatComparisonTable } from '@/components/ui/StatComparisonTable'
import { Switch } from '@/components/ui/Switch'
import { playerQueries } from '@/queries/player/player.queries'
import { Regions } from '@/types/api.type'
import type { Locale } from '@/types/item.type'
import { PlayerPickerDialog } from './components/comparison/PlayerPickerDialog'
import { PlayerSlot } from './components/comparison/PlayerSlot'
import {
	buildPlayerComparisonSections,
	countPlayerComparisonDifferences,
} from './components/comparison/playerComparisonStats'
import {
	MAX_COMPARISON_PLAYERS,
	type PlayerComparisonState,
	type PlayerRef,
	parsePlayerComparisonState,
	serializePlayerComparisonState,
} from './components/comparison/playerComparisonUtils'

type PickerTarget = number | 'new' | null

function Notice({
	icon,
	text,
	onRetry,
	onAction,
	actionLabel,
}: {
	icon: string
	text: string
	onRetry?: () => void
	onAction?: () => void
	actionLabel?: string
}) {
	const t = useTranslations()

	return (
		<Card.Root className="items-center justify-center gap-3 py-12 text-center">
			<Icon className="text-4xl text-muted-foreground" icon={icon} />
			<p className="max-w-md font-medium text-sm">{text}</p>
			{(onRetry || onAction) && (
				<div className="flex flex-wrap justify-center gap-2">
					{onAction && actionLabel && (
						<Button onClick={onAction} size="sm">
							<Icon className="mr-2" icon="lucide:plus" />
							{actionLabel}
						</Button>
					)}
					{onRetry && (
						<Button onClick={onRetry} size="sm" variant="outline">
							<Icon className="mr-2" icon="lucide:refresh-cw" />
							{t('player.comparison.retry')}
						</Button>
					)}
				</div>
			)}
		</Card.Root>
	)
}

const SKELETON_KEYS = ['a', 'b', 'c', 'd']

function ComparisonSkeleton({ count }: { count: number }) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{SKELETON_KEYS.slice(0, count).map((key) => (
				<Card.Root key={key}>
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-4/5" />
					<Skeleton className="h-4 w-3/5" />
				</Card.Root>
			))}
		</div>
	)
}

export default function PlayerComparisonView() {
	const t = useTranslations()
	const searchParams = useSearchParams()
	const locale = useLocale() as Locale

	const [state, setState] = useState<PlayerComparisonState>(() =>
		parsePlayerComparisonState(searchParams)
	)
	const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null)
	const [onlyDifferences, setOnlyDifferences] = useState(false)
	const translate = useCallback((key: string) => t(key), [t])

	const search = searchParams.toString()

	useEffect(() => {
		setState(parsePlayerComparisonState(new URLSearchParams(search)))
	}, [search])

	useEffect(() => {
		const onPopState = () => {
			setState(
				parsePlayerComparisonState(
					new URLSearchParams(window.location.search)
				)
			)
		}

		window.addEventListener('popstate', onPopState)
		return () => window.removeEventListener('popstate', onPopState)
	}, [])

	const applyState = useCallback((next: PlayerComparisonState) => {
		setState(next)

		if (typeof window === 'undefined') return

		const query = serializePlayerComparisonState(next)
		window.history.replaceState(
			window.history.state,
			'',
			`${window.location.pathname}${query ? `?${query}` : ''}`
		)
	}, [])

	const queries = useQueries({
		queries: state.players.map((ref) => playerQueries.get(ref)),
	})
	const players = useMemo(() => queries.map((query) => query.data), [queries])

	const loadedPlayers = useMemo(
		() =>
			players.filter(
				(player): player is NonNullable<typeof player> => !!player
			),
		[players]
	)

	const allLoaded =
		players.length > 0 && loadedPlayers.length === players.length

	const sections = useMemo(
		() =>
			allLoaded
				? buildPlayerComparisonSections(
						loadedPlayers,
						locale,
						translate
					)
				: [],
		[allLoaded, loadedPlayers, locale, translate]
	)

	const diffCount = useMemo(
		() => countPlayerComparisonDifferences(sections),
		[sections]
	)

	const columns = state.players.map((ref, index) => ({
		key: `${ref.region}:${ref.character.toLocaleLowerCase()}`,
		name: players[index]?.username || ref.character,
	}))

	const pickerRegion: Regions =
		pickerTarget === 'new'
			? (state.players.at(-1)?.region ?? Regions.RU)
			: typeof pickerTarget === 'number'
				? (state.players[pickerTarget]?.region ??
					state.players[0]?.region ??
					Regions.RU)
				: Regions.RU

	const handlePick = (ref: PlayerRef) => {
		if (pickerTarget === null) return

		if (pickerTarget === 'new') {
			applyState({
				players: [...state.players, ref].slice(
					0,
					MAX_COMPARISON_PLAYERS
				),
			})
		} else {
			applyState({
				players: state.players.map((player, index) =>
					index === pickerTarget ? ref : player
				),
			})
		}

		setPickerTarget(null)
	}

	const handleRemove = (index: number) => {
		applyState({
			players: state.players.filter(
				(_, playerIndex) => playerIndex !== index
			),
		})
	}

	const handleClear = () => applyState({ players: [] })

	const retryPlayers = () => {
		for (const query of queries) void query.refetch()
	}

	let content: ReactNode

	if (state.players.length < 2) {
		content = (
			<Notice
				actionLabel={t('player.comparison.addPlayer')}
				icon="lucide:git-compare"
				onAction={() => setPickerTarget('new')}
				text={
					state.players.length > 0
						? t('player.comparison.selectSecond')
						: t('player.comparison.selectFirst')
				}
			/>
		)
	} else if (queries.some((query) => query.isPending)) {
		content = <ComparisonSkeleton count={state.players.length} />
	} else if (queries.some((query) => query.isError) || !allLoaded) {
		content = (
			<Notice
				icon="lucide:triangle-alert"
				onRetry={retryPlayers}
				text={t('player.comparison.playerError')}
			/>
		)
	} else if (sections.length === 0) {
		content = (
			<Notice
				icon="lucide:user-round-x"
				text={t('player.comparison.noStats')}
			/>
		)
	} else if (onlyDifferences && diffCount === 0) {
		content = (
			<Notice
				icon="lucide:check-check"
				text={t('player.comparison.noDifferences')}
			/>
		)
	} else {
		content = (
			<StatComparisonTable
				columns={columns}
				namespace="player.comparison"
				onlyDifferences={onlyDifferences}
				sections={sections}
			/>
		)
	}

	return (
		<section className="mx-auto max-w-360 space-y-6 px-4 pt-32 pb-12 md:px-8 lg:pt-36">
			<header className="space-y-2">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<h1
						className={`${mtsExtended.className} font-semibold text-2xl md:text-3xl`}
					>
						{t('player.comparison.title')}
					</h1>
					{state.players.length > 0 && (
						<Button onClick={handleClear} size="sm" variant="ghost">
							<Icon className="mr-2" icon="lucide:trash-2" />
							{t('player.comparison.clear')}
						</Button>
					)}
				</div>
			</header>

			<Card.Root className="gap-4">
				<div className="flex flex-wrap gap-3">
					{state.players.map((ref, index) => (
						<div
							className="min-w-60 flex-1 basis-64"
							key={`${ref.region}:${ref.character}`}
						>
							<PlayerSlot
								isError={queries[index]?.isError ?? false}
								isFetching={queries[index]?.isFetching ?? false}
								isPending={queries[index]?.isPending ?? false}
								label={t('player.comparison.slotLabel', {
									index: index + 1,
								})}
								onPick={() => setPickerTarget(index)}
								onRemove={() => handleRemove(index)}
								onRetry={() => void queries[index]?.refetch()}
								player={players[index]}
								refValue={ref}
							/>
						</div>
					))}

					{state.players.length < MAX_COMPARISON_PLAYERS && (
						<div className="min-w-60 flex-1 basis-64">
							<PlayerSlot
								isError={false}
								isFetching={false}
								isPending={false}
								label={t('player.comparison.slotLabel', {
									index: state.players.length + 1,
								})}
								onPick={() => setPickerTarget('new')}
								onRemove={() => undefined}
								onRetry={() => undefined}
								player={undefined}
								refValue={null}
							/>
						</div>
					)}
				</div>

				<div className="flex flex-wrap items-center justify-between gap-3 border-muted border-t pt-3">
					<Switch
						checked={onlyDifferences}
						label={t('player.comparison.onlyDifferences')}
						onCheckedChange={setOnlyDifferences}
					/>
				</div>
			</Card.Root>

			{content}

			<PlayerPickerDialog
				exclude={
					typeof pickerTarget === 'number'
						? state.players.filter(
								(_, index) => index !== pickerTarget
							)
						: state.players
				}
				onOpenChange={(open) => {
					if (!open) setPickerTarget(null)
				}}
				onPick={handlePick}
				open={pickerTarget !== null}
				region={pickerRegion}
			/>
		</section>
	)
}
