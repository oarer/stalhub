'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { ClanGearEdit } from '../../hooks/useClanGearEdit'
import { LoadoutEditorModal } from '../../../me/components/LoadoutEditorModal'
import { SQUAD_MAPS } from '../squads/squads.const'

export function GearEditModals({
	controller,
}: {
	controller: ClanGearEdit
}) {
	const t = useTranslations()
	const targets = controller.pickerMember
		? controller.membershipsOf(controller.pickerMember.id)
		: []

	return (
		<>
			<Modal.Root
				onOpenChange={(open) => {
					if (!open) controller.closePicker()
				}}
				open={controller.pickerMember !== null}
			>
				<Modal.Content className="max-w-md" fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{t('clan.squads.pickTargetTitle', {
								name: controller.pickerMember?.name ?? '',
							})}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className="flex max-h-[55vh] flex-col gap-2 overflow-y-auto pr-1">
							{targets.map((target) => (
								<Button
									className="justify-between gap-2"
									key={`${target.squadId}-${target.slot}`}
									onClick={() => controller.pickTarget(target)}
									variant="secondary"
								>
									<span className="truncate font-semibold text-sm">
										{target.squadName}
									</span>
									<span className="shrink-0 font-mono font-semibold text-muted-foreground text-xs">
										{t(
											SQUAD_MAPS.find(
												(m) => m.value === target.map
											)?.label ?? target.map
										)}{' '}
										·{' '}
										{t('clan.squads.slot', {
											slot: target.slot + 1,
										})}
									</span>
								</Button>
							))}
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Modal.Close>{t('clan.common.close')}</Modal.Close>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>

			{controller.editingMember && (
				<LoadoutEditorModal
					armors={controller.armors}
					builds={controller.myBuilds}
					isPending={controller.isPending}
					loadout={controller.editorLoadout}
					onOpenChange={(open) => {
						if (!open) controller.closeEditor()
					}}
					onSave={controller.handleSave}
					open
					weapons={controller.weapons}
				/>
			)}
		</>
	)
}
