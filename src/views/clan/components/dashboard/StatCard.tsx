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
		<div className="bg-card flex items-center gap-4 rounded-lg p-4">
			<Icon className="text-2xl" icon={icon} />
			<div>
				<p className="text-foreground text-[13px] font-medium">
					{label}
				</p>
				<p className={`font-mono text-[15px] font-medium`}>{value}</p>
			</div>
		</div>
	)
}
