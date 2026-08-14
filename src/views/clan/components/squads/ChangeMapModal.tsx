'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Modal } from '@/components/ui/Modal'
import type { ClanSquad, SquadMap } from '@/types/clan/clan.type'
import { SQUAD_MAPS } from './squads.const'

interface ChangeMapModalProps {
	squad: ClanSquad | null
	targetMap: SquadMap
	isPending: boolean
	onTargetMapChange: (map: SquadMap) => void
	onSave: () => void
	onOpenChange: (open: boolean) => void
}

export function ChangeMapModal({
	squad,
	targetMap,
	isPending,
	onTargetMapChange,
	onSave,
	onOpenChange,
}: ChangeMapModalProps) {
	const t = useTranslations()

	return (
		<Modal.Root onOpenChange={onOpenChange} open={squad !== null}>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>
						{t('clan.squads.mapTitle', {
							name: squad?.name ? `«${squad.name}»` : '',
						})}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="flex flex-col gap-2">
						{SQUAD_MAPS.map((map) => (
							<button
								className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
									targetMap === map.value
										? 'border-sky-500/60 bg-sky-500/10'
										: 'border-border-secondary hover:bg-accent'
								}`}
								key={map.value}
								onClick={() => onTargetMapChange(map.value)}
								type="button"
							>
								<Icon
									className="text-lg text-neutral-400"
									icon={map.icon}
								/>
								<span className="font-medium text-sm">
									{t(map.label)}
								</span>
								{targetMap === map.value && (
									<Icon
										className="ml-auto text-sky-500"
										icon="lucide:check"
									/>
								)}
							</button>
						))}
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
					<Modal.Action
						closeOnClick
						disabled={isPending || squad?.map === targetMap}
						onClick={onSave}
					>
						{t('clan.common.save')}
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
