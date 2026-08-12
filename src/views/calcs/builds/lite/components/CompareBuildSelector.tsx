'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import DropdownMenu from '@/components/ui/DropDown'
import type { SavedBuild } from '@/stores/useBuild.store'
import type { DropdownItem } from '@/types/ui/dropdown.type'

type CompareBuildSelectorProps = {
	savedBuilds: SavedBuild[]
	currentBuildId: string | null
	compareBuildId: string | null
	onSelect: (buildId: string | null) => void
}

export function CompareBuildSelector({
	savedBuilds,
	currentBuildId,
	compareBuildId,
	onSelect,
}: CompareBuildSelectorProps) {
	const t = useTranslations()

	const candidates = useMemo(
		() => savedBuilds.filter((b) => b.id !== currentBuildId),
		[savedBuilds, currentBuildId]
	)

	const compareBuild = useMemo(
		() => savedBuilds.find((b) => b.id === compareBuildId) ?? null,
		[savedBuilds, compareBuildId]
	)

	const items = useMemo<DropdownItem[]>(
		() =>
			candidates.map((b) => ({
				key: b.id,
				content: (
					<div
						className="flex w-full cursor-pointer items-center justify-between rounded-lg bg-transparent px-2 py-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
						onClick={() => onSelect(b.id)}
					>
						<p className="truncate font-semibold">{b.name}</p>
						{compareBuildId === b.id && (
							<Icon
								className="size-4 text-green-500"
								icon="lucide:check"
							/>
						)}
					</div>
				),
			})),
		[candidates, compareBuildId, onSelect]
	)

	return (
		<div className="flex items-center gap-2">
			{candidates.length === 0 ? (
				<Button
					className="flex items-center gap-2 rounded-lg px-3 py-2"
					disabled
					variant="secondary"
				>
					<Icon
						className="text-xl"
						icon="lucide:git-compare-arrows"
					/>
					<p className="font-semibold text-md">
						{t('buildsLite.compare')}
					</p>
				</Button>
			) : (
				<DropdownMenu
					blur={false}
					className="rounded-lg"
					icon="lucide:git-compare-arrows"
					items={items}
					onlyIcon
					placement="bottom-start"
					title="buildsLite.compare"
					variant="secondary"
				/>
			)}
			{compareBuild && (
				<div className="flex min-w-0 items-center gap-1 rounded-lg bg-background/50 px-2 py-2 ring-2 ring-border/50">
					<Icon
						className="shrink-0 text-green-500 text-lg"
						icon="lucide:git-compare-arrows"
					/>
					<p className="max-w-44 truncate font-semibold text-sm">
						{compareBuild.name}
					</p>
					<Button
						className="rounded p-1 ring-transparent"
						onClick={() => onSelect(null)}
						title={t('buildsLite.compareStop')}
						type="button"
						variant="ghost"
					>
						<Icon className="size-4" icon="lucide:x" />
					</Button>
				</div>
			)}
		</div>
	)
}
