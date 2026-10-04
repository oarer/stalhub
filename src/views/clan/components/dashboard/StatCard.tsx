import { Icon } from '@iconify/react'

export function StatCard({
	icon,
	label,
	value,
}: {
	icon: string
	label: string
	value: number | string
}) {
	return (
		<div className="flex items-center gap-4 rounded-lg bg-card p-4">
			<Icon className="text-2xl" icon={icon} />
			<div>
				<p className="font-medium text-[13px] text-text-accent">
					{label}
				</p>
				<p className={`font-medium font-mono text-[15px]`}>{value}</p>
			</div>
		</div>
	)
}
