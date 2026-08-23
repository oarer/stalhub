import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/Button'

interface ActionButtonsProps {
	onUndo: () => void
	onClear: () => void
	onSave: () => void
	onLoad: () => void
}

export function ActionButtons({
	onUndo,
	onClear,
	onSave,
	onLoad,
}: ActionButtonsProps) {
	const t = useTranslations()

	return (
		<>
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-4">
					<Button
						className="w-full gap-2 rounded-lg px-0"
						onClick={onUndo}
						size="sm"
						variant="outline"
					>
						<Icon className="text-lg" icon="lucide:undo-2" />
					</Button>
					<Button
						className="w-full gap-2 rounded-lg px-0"
						onClick={onClear}
						size="sm"
						variant="danger"
					>
						<Icon className="text-lg" icon="lucide:trash-2" />
					</Button>
					<Button
						className="w-full gap-2 rounded-lg px-0"
						onClick={onSave}
						size="sm"
						variant="secondary"
					>
						<Icon className="text-lg" icon="lucide:save" />
					</Button>
					<Button
						className="w-full gap-2 rounded-lg px-0"
						onClick={onLoad}
						size="sm"
						variant="secondary"
					>
						<Icon className="text-lg" icon="lucide:folder-open" />
					</Button>
				</div>
			</div>

			<div className="font-semibold text-muted-foreground text-xs">
				<p>{t('cwMap.actions.undo')}</p>
				<p>{t('cwMap.actions.save')}</p>
			</div>
		</>
	)
}
