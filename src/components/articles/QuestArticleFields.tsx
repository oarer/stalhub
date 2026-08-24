'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { QuestType } from '@/types/article.type'

export type QuestFieldsValue = {
	quest_name: string
	quest_type: QuestType
	reward_text: string
	reward_money: string
}

export function QuestArticleFields({
	value,
	onChange,
}: {
	value: QuestFieldsValue
	onChange: (value: QuestFieldsValue) => void
}) {
	const t = useTranslations('articles.quest')
	const patch = (next: Partial<QuestFieldsValue>) =>
		onChange({ ...value, ...next })
	const questTypeOptions = [
		{ value: QuestType.STORY, label: t('story') },
		{ value: QuestType.SIDE, label: t('side') },
	]

	return (
		<section className="mx-2 flex flex-col gap-3 rounded-xl border-2 border-primary/20 bg-card p-4">
			<h2 className="flex items-center gap-2 font-semibold">
				<Icon icon="lucide:map-pinned" />
				{t('details')}
			</h2>
			<div className="grid gap-3 md:grid-cols-2">
				<Input
					label="articles.quest.name"
					onChange={(e) => patch({ quest_name: e.target.value })}
					value={value.quest_name}
				/>
				<Combobox
					className="py-0.5"
					onValueChange={(questType) => {
						if (questType)
							patch({ quest_type: questType as QuestType })
					}}
					options={questTypeOptions}
					placeholder="articles.quest.type"
					translateOptions={false}
					value={value.quest_type}
				/>
				<Input
					label="articles.quest.money"
					min={0}
					onChange={(e) => patch({ reward_money: e.target.value })}
					type="number"
					value={value.reward_money}
				/>
			</div>
			<textarea
				className="min-h-10 flex-1 resize-none rounded-lg border-2 border-primary/50 bg-card px-3 py-2 font-semibold text-sm outline-none transition-colors focus:border-primary"
				onChange={(e) => patch({ reward_text: e.target.value })}
				placeholder={t('rewardText')}
				value={value.reward_text}
			/>
		</section>
	)
}
