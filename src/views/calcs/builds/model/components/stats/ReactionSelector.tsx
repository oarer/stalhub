'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { useBuildStore } from '@/stores/useBuild.store'

type ReactionSelectorProps = {
	availableReactions: string[]
	selectedReaction: string | null
	displayNamesMap: Record<string, string>
}

export function ReactionSelector({
	availableReactions,
	selectedReaction,
	displayNamesMap,
}: ReactionSelectorProps) {
	const t = useTranslations()
	const setReaction = useBuildStore((s) => s.setReaction)
	const removeReaction = useBuildStore((s) => s.removeReaction)

	const options = useMemo<ComboboxOption[]>(
		() =>
			availableReactions.map((key) => ({
				value: key,
				label: displayNamesMap[key] ?? key,
			})),
		[availableReactions, displayNamesMap]
	)

	return (
		<div className="flex flex-col gap-1">
			<p className="font-semibold text-sm">
				{t('build.reactions.title')}
			</p>
			<Combobox
				onValueChange={(value) => {
					if (!value) {
						removeReaction()
					} else {
						setReaction(value)
					}
				}}
				options={options}
				placeholder="build.reactions.placeholder"
				translateOptions={false}
				value={selectedReaction ?? undefined}
			/>
		</div>
	)
}
