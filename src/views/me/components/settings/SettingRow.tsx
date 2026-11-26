export function SettingRow({
	title,
	description,
	children,
}: {
	title: string
	description: string
	children: React.ReactNode
}) {
	return (
		<div className="bg-accent/50 flex items-center justify-between rounded-lg p-4">
			<div className="flex flex-col gap-1">
				<span className="text-sm font-semibold">{title}</span>
				<span className="text-foreground text-xs font-semibold">
					{description}
				</span>
			</div>
			{children}
		</div>
	)
}
