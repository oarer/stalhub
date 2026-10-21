'use client'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const classNames = {
	focus: 'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[3px]',
	tab: 'flex items-center gap-2 px-3.5 py-2.5 rounded-lg font-semibold text-sm aria-[current]:bg-primary aria-[current]:text-primary-foreground max-[760px]:text-xs max-[760px]:p-[9px]',
}

export default function Map3DHeader({
	exporting,
	running,
	status,
	onReset,
}: {
	exporting: boolean
	running: boolean
	status: string
	onReset: () => void
}) {
	return (
		<header className="flex min-h-15 w-full items-center gap-2 border-border-secondary border-b px-6 py-3 max-[760px]:gap-1 max-[760px]:px-3 max-[760px]:py-2.5">
			<Link className={`${classNames.tab} ${classNames.focus}`} href="/map">
				<Icon icon="lucide:map" />
				2D-карта
			</Link>
			<Link
				aria-current="page"
				className={`${classNames.tab} ${classNames.focus}`}
				href="/map/3d"
			>
				<Icon icon="lucide:box" />
				{exporting ? 'Экспорт карты' : '3D-исследование'}
			</Link>
			<div className="ml-auto flex items-center gap-3">
				{running && (
					<Button
						className={`gap-2 ${classNames.focus}`}
						onClick={onReset}
						size="sm"
						variant="secondary"
					>
						<Icon icon="lucide:settings-2" />
						Настройки
					</Button>
				)}
				<span
					className="text-muted-foreground text-xs max-[1000px]:hidden"
					role="status"
				>
					{running ? status : 'Выберите настройки перед отправлением'}
				</span>
			</div>
		</header>
	)
}
