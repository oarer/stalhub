export type AwardCategoryKind = 'nominees' | 'updates'

export interface AwardCandidate {
	id: string
	name: string
	description: string
	image: string
	twitchUrl?: string
	date?: string
	patchUrl?: string
}

export interface AwardCategory {
	id: string
	title: string
	description: string
	image: string
	kind: AwardCategoryKind
	candidates: AwardCandidate[]
}

const PLACEHOLDER_IMAGE = '/images/avatars/oarer.jpg'
const PLACEHOLDER_TWITCH = 'https://www.twitch.tv/oarer'
const PLACEHOLDER_PATCH_NOTES = 'https://forum.exbo.net'

export const AWARDS_YEAR = 2026

export const AWARD_CATEGORIES: AwardCategory[] = [
	{
		id: 'event',
		title: 'Событие года',
		description:
			'Главное событие StalZone, которое запомнилось сообществу больше всего.',
		image: PLACEHOLDER_IMAGE,
		kind: 'nominees',
		candidates: [
			{
				id: 'event-winter',
				name: 'Зимний фестиваль',
				description: 'Праздничные активности и клановые испытания',
				image: PLACEHOLDER_IMAGE,
				twitchUrl: PLACEHOLDER_TWITCH,
			},
			{
				id: 'event-clan-league',
				name: 'Клановая лига',
				description: 'Сезон напряжённых боёв за контроль над Зоной',
				image: PLACEHOLDER_IMAGE,
				twitchUrl: PLACEHOLDER_TWITCH,
			},
			{
				id: 'event-hunter-night',
				name: 'Ночь охотника',
				description: 'Ночной ивент с особыми наградами и боссами',
				image: PLACEHOLDER_IMAGE,
				twitchUrl: PLACEHOLDER_TWITCH,
			},
		],
	},
	{
		id: 'media',
		title: 'Медийка года',
		description:
			'Авторы и стримеры, которые лучше всего раскрыли StalZone в этом году.',
		image: PLACEHOLDER_IMAGE,
		kind: 'nominees',
		candidates: [
			{
				id: 'media-oarer',
				name: 'oarer',
				description: 'Стримы, гайды и разборы обновлений',
				image: PLACEHOLDER_IMAGE,
				twitchUrl: PLACEHOLDER_TWITCH,
			},
			{
				id: 'media-shnyuvsik',
				name: 'shnyuvsik',
				description: 'Клановая аналитика и соревновательные стримы',
				image: PLACEHOLDER_IMAGE,
				twitchUrl: PLACEHOLDER_TWITCH,
			},
			{
				id: 'media-art3mlapa',
				name: 'art3mlapa',
				description: 'Арты, оформление и творческие эфиры',
				image: PLACEHOLDER_IMAGE,
				twitchUrl: PLACEHOLDER_TWITCH,
			},
		],
	},
	{
		id: 'update',
		title: 'Обновление года',
		description:
			'Патч или сезон, который сильнее всего изменил игру и сообщество.',
		image: PLACEHOLDER_IMAGE,
		kind: 'updates',
		candidates: [
			{
				id: 'update-new-zone',
				name: 'Обновление 1.0: Новая Зона',
				description:
					'Новые локации, переработанная экономика и свежий сезонный прогресс.',
				image: PLACEHOLDER_IMAGE,
				date: '12 декабря 2026',
				patchUrl: PLACEHOLDER_PATCH_NOTES,
			},
			{
				id: 'update-polar-night',
				name: 'Сезон «Полярная ночь»',
				description:
					'Зимние события, новый боевой пропуск и уникальные награды.',
				image: PLACEHOLDER_IMAGE,
				date: '3 октября 2026',
				patchUrl: PLACEHOLDER_PATCH_NOTES,
			},
		],
	},
]
