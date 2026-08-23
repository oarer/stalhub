'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
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
							label={t('clan.squads.namePlaceholder')}
							onChange={(e) => onNameChange(e.target.value)}
							value={name}
						/>
						<div className="flex flex-col gap-2">
							<p className="font-semibold text-muted-foreground text-sm">
								{t('clan.squads.map')}
							</p>
							<div className="flex flex-col gap-2">
								{SQUAD_MAPS.map((mapOpt) => (
									<Button
										className={cn(
											'gap-2',
											map === mapOpt.value &&
												'bg-primary/40'
										)}
										key={mapOpt.value}
										onClick={() =>
											onMapChange(mapOpt.value)
										}
										variant={'secondary'}
									>
										<Icon
											className="text-lg text-muted-foreground"
											icon={mapOpt.icon}
										/>
										{t(mapOpt.label)}
									</Button>
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
