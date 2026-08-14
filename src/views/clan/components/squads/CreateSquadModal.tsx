'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { SquadMap } from '@/types/clan/clan.type'
import { SQUAD_MAPS } from './squads.const'

interface CreateSquadModalProps {
	open: boolean
	name: string
	map: SquadMap
	isPending: boolean
	onNameChange: (name: string) => void
	onMapChange: (map: SquadMap) => void
	onOpenChange: (open: boolean) => void
	onSave: () => void
}

export function CreateSquadModal({
	open,
	name,
	map,
	isPending,
	onNameChange,
	onMapChange,
	onOpenChange,
	onSave,
}: CreateSquadModalProps) {
	const t = useTranslations()

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Trigger className="gap-2" variant="primary">
				<Icon className="text-lg" icon="lucide:plus" />
				{t('clan.squads.create')}
			</Modal.Trigger>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{t('clan.squads.new')}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="flex flex-col gap-3">
						<Input
							onChange={(e) => onNameChange(e.target.value)}
							placeholder={t('clan.squads.namePlaceholder')}
							value={name}
						/>
						<div className="flex flex-col gap-2">
							<p className="font-medium text-neutral-500 text-sm">
								{t('clan.squads.map')}
							</p>
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
								{SQUAD_MAPS.map((mapOpt) => (
									<button
										className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
											map === mapOpt.value
												? 'border-sky-500/60 bg-sky-500/10'
												: 'border-border-secondary hover:bg-accent'
										}`}
										key={mapOpt.value}
										onClick={() =>
											onMapChange(mapOpt.value)
										}
										type="button"
									>
										<Icon
											className="text-lg text-neutral-400"
											icon={mapOpt.icon}
										/>
										{t(mapOpt.label)}
									</button>
								))}
							</div>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
					<Modal.Action
						closeOnClick
						disabled={!name.trim() || isPending}
						onClick={onSave}
					>
						{t('clan.common.create')}
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
