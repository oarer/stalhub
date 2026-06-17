type Status = 'done' | 'in-progress' | 'planned'

export interface RoadmapItem {
	date: string
	title: string
	description?: string
	status: Status
}

export const RoadmapItems: RoadmapItem[] = [
	{
		date: '2025.08',
		title: 'Зарождение проекта',
		description:
			'Начало разработки и формирование основной идеи. Создание первых концептов и структуры.',
		status: 'done',
	},
	{
		date: '2026.02',
		title: 'ЗБТ',
		description:
			'Закрытое бета-тестирование. Проверка работоспособности функционала сайта, сбор баг-репортов.',
		status: 'done',
	},
	{
		date: '2026.06',
		title: 'ОБТ',
		description:
			'Открытое бета-тестирование. Подготовка к релизу, фикс багов, обновление инфраструктуры.',
		status: 'in-progress',
	},
	{
		date: '2026.07',
		title: 'Релиз проекта',
		description:
			'Полноценный запуск проекта и дальнейшая поддержка проекта.',
		status: 'planned',
	},
]
