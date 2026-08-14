export default function ArticlesLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<section
			className="flex h-full min-h-[calc(100vh-7rem)] w-full flex-col xl:pt-36"
			data-editor
		>
			{children}
		</section>
	)
}
