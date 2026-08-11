'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDashboardStore } from '@/stores/useDashboard.store'
import { DashboardCanvas } from './components/DashboardCanvas'
import { WidgetPickerModal } from './components/WidgetPickerModal'

export function DashboardView() {
	const t = useTranslations()
	const hasHydrated = useDashboardStore((s) => s.hasHydrated)
	const resetLayout = useDashboardStore((s) => s.resetLayout)
	const hasWidgets = useDashboardStore((s) => s.items.length > 0)

	const [pickerOpen, setPickerOpen] = useState(false)

	const handleReset = () => {
		if (window.confirm(t('dashboard.resetConfirm'))) {
			resetLayout()
		}
	}

	return (
		<section className="flex h-dvh w-full flex-col">
			<div className="mx-auto flex w-full max-w-400 flex-col items-center gap-4 px-4 pt-24 pb-5 text-center lg:pt-34">
				<h1
					className={`${unbounded.className} font-semibold text-2xl tracking-tight md:text-3xl xl:text-4xl`}
				>
					{t('dashboard.title')}
				</h1>
				<p className="font-semibold text-[16px] text-text-accent">
					{t('dashboard.subtitle')}
				</p>

				<div className="flex flex-wrap items-center justify-center gap-2">
					<Button
						className="flex items-center gap-2"
						onClick={() => setPickerOpen(true)}
						size="sm"
						variant="primary"
					>
						<Icon className="size-4" icon="lucide:plus" />
						{t('dashboard.addWidget')}
					</Button>

					{hasWidgets && (
						<Button
							className="flex items-center gap-2"
							onClick={handleReset}
							size="sm"
							variant="ghost"
						>
							<Icon className="size-4" icon="lucide:rotate-ccw" />
							{t('dashboard.reset')}
						</Button>
					)}
				</div>
			</div>

			<div className="flex min-h-0 flex-1 flex-col px-4 pb-6">
				{!hasHydrated ? (
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
						<Skeleton className="h-64 w-full" />
						<Skeleton className="hidden h-64 w-full md:block" />
						<Skeleton className="hidden h-64 w-full lg:block" />
					</div>
				) : hasWidgets ? (
					<DashboardCanvas />
				) : (
					<div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-border-secondary border-dashed px-6 py-20 text-center">
						<Icon
							className="size-12 text-text-accent"
							icon="lucide:layout-grid"
						/>
						<div className="flex flex-col gap-1">
							<p className="font-semibold text-lg">
								{t('dashboard.emptyTitle')}
							</p>
							<p className="font-semibold text-sm text-text-accent">
								{t('dashboard.emptySubtitle')}
							</p>
						</div>
						<Button
							className="flex items-center gap-2"
							onClick={() => setPickerOpen(true)}
							size="md"
							variant="primary"
						>
							<Icon className="size-4" icon="lucide:plus" />
							{t('dashboard.addFirstWidget')}
						</Button>
					</div>
				)}
			</div>

			<WidgetPickerModal onOpenChange={setPickerOpen} open={pickerOpen} />
		</section>
	)
}
