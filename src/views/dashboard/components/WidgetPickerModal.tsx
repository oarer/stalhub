'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useDashboardStore } from '@/stores/useDashboard.store'
import {
	WIDGETS,
	type WidgetCategory,
	type WidgetDef,
} from '../widgets/registry'

type WidgetPickerModalProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
}

const CATEGORY_ORDER: WidgetCategory[] = ['calculators', 'account']

export function WidgetPickerModal({
	open,
	onOpenChange,
}: WidgetPickerModalProps) {
	const t = useTranslations()
	const [query, setQuery] = useState('')
	const addWidget = useDashboardStore((s) => s.addWidget)

	const normalizedQuery = query.trim().toLowerCase()

	const filtered = WIDGETS.filter((widget) =>
		normalizedQuery
			? t(widget.titleKey).toLowerCase().includes(normalizedQuery)
			: true
	)

	const handleAdd = (widget: WidgetDef) => {
		addWidget(widget.id, widget.defaultWidth, widget.defaultHeight)
	}

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content
				align="top"
				className="max-h-dvh max-w-2xl"
				fullScreen={false}
			>
				<Modal.Header>
					<Modal.Title>{t('dashboard.addWidget')}</Modal.Title>
					<Modal.Description className="font-semibold">
						{t('dashboard.addWidgetSubtitle')}
					</Modal.Description>
				</Modal.Header>

				<Modal.Body className="max-h-[60dvh] space-y-5 overflow-y-auto">
					<Input
						label="dashboard.search"
						onChange={(e) => setQuery(e.target.value)}
						type="text"
						value={query}
					/>

					{CATEGORY_ORDER.map((category) => {
						const group = filtered.filter(
							(widget) => widget.category === category
						)
						if (group.length === 0) return null

						return (
							<div className="flex flex-col gap-2" key={category}>
								<p className="font-semibold text-sm text-text-accent">
									{t(`dashboard.categories.${category}`)}
								</p>
								<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
									{group.map((widget) => (
										<Button
											className="relative justify-start gap-2 px-2 py-3"
											key={widget.id}
											onClick={() => handleAdd(widget)}
											variant={'secondary'}
										>
											<Icon
												className="text-primary text-xl"
												icon={widget.icon}
											/>
											<span className="font-semibold text-sm">
												{t(widget.titleKey)}
											</span>
											{widget.requiresAuth && (
												<Icon
													className="absolute top-1/3 right-4 size-3.5 text-text-accent"
													icon="lucide:lock"
												/>
											)}
										</Button>
									))}
								</div>
							</div>
						)
					})}
				</Modal.Body>

				<Modal.Footer>
					<Modal.Close>{t('dashboard.done')}</Modal.Close>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
