export function UnoStat({
	label,
	value,
	accent = false,
}: {
	label: string
	value: string
	accent?: boolean
}) {
	return (
		<div className="border-primary/20 border-l-2 pl-3">
			<p className="text-muted-foreground text-xs">{label}</p>
			<p
				className={
					accent
						? 'font-semibold text-2xl text-primary'
						: 'font-semibold text-2xl'
				}
			>
				{value}
			</p>
		</div>
	)
}
