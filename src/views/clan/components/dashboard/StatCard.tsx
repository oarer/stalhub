import { Icon } from '@iconify/react'
import { montserrat } from '@/app/fonts'

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
		<div className="flex items-center gap-4 rounded-lg bg-background p-4">
			<Icon className="text-2xl" icon={icon} />
			<div>
				<p className="font-bold text-sm">{label}</p>
				<p className={`${montserrat.className} font-semibold text-md`}>
					{value}
				</p>
			</div>
		</div>
	)
}
