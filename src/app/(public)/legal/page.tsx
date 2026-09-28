import Link from 'next/link'

const docs = [
	{
		href: '/legal/terms',
		title: 'Правила пользования',
		description: 'Правила использования сервиса, права и обязанности, запрещенные действия, API и лицензия.',
	},
	{
		href: '/legal/privacy',
		title: 'Политика конфиденциальности',
		description: 'Какие данные мы собираем, cookies, OAuth, хранение и удаление данных.',
	},
	{
		href: '/legal/contacts',
		title: 'Контакты',
		description: 'Кто отвечает за сервис и как связаться.',
	},
	{
		href: '/legal/disclaimer',
		title: 'Disclaimer',
		description: 'Отношения StalHub с EXBO и STALCRAFT, права на игровые материалы.',
	},
]

export default function LegalIndexPage() {
	return (
		<section className="mx-auto w-full max-w-4xl px-4 pt-34 pb-12 sm:px-6">
			<h1 className="font-bold text-2xl">Документы</h1>
			<div className="mt-6 flex flex-col gap-4">
				{docs.map((doc) => (
					<Link
						className="rounded-xl border border-border p-4 transition-colors hover:border-primary"
						href={doc.href}
						key={doc.href}
					>
						<p className="font-semibold">{doc.title}</p>
						<p className="mt-1 text-muted-foreground text-sm">
							{doc.description}
						</p>
					</Link>
				))}
			</div>
		</section>
	)
}
