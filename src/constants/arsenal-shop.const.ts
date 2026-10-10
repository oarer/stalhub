// Вкладка "Магазин" арсенала: быстрый выбор репутации + ассортимент.
// ID найдены в listing.json (cdn.stalhub.dev/db/listing.json).

export type ShopItem = { id: string; icon: string; ru: string }
export type ShopExchange = { give: ShopItem[]; get: ShopItem }

const ic = (path: string) => `https://cdn.stalhub.dev/db${path}`

export const ARSENAL_SHOP_10K: ShopItem[] = [
	{
		id: '0rq99',
		icon: ic('/icons/weapon/assault_rifle/0rq99.png'),
		ru: '«Руна» (А)',
	},
	{
		id: '5lgo1',
		icon: ic('/icons/weapon/assault_rifle/5lgo1.png'),
		ru: 'XM8 (А)',
	},
	{
		id: 'j5vz0',
		icon: ic('/icons/weapon/assault_rifle/j5vz0.png'),
		ru: 'АК-308 (А)',
	},
	{
		id: 'knv5y',
		icon: ic('/icons/weapon/assault_rifle/knv5y.png'),
		ru: 'HK417 (А)',
	},
	{
		id: 'lyv9k',
		icon: ic('/icons/weapon/assault_rifle/lyv9k.png'),
		ru: 'X95 (А)',
	},
	{
		id: 'qjg3j',
		icon: ic('/icons/weapon/assault_rifle/qjg3j.png'),
		ru: 'DSA-58 (А)',
	},
	{
		id: 'wj6l2',
		icon: ic('/icons/weapon/assault_rifle/wj6l2.png'),
		ru: 'SCAR-H (А)',
	},
	{
		id: 'zzlwy',
		icon: ic('/icons/weapon/assault_rifle/zzlwy.png'),
		ru: 'FAL (А)',
	},
	{
		id: '4q17r',
		icon: ic('/icons/weapon/sniper_rifle/4q17r.png'),
		ru: 'ПТРД-М (А)',
	},
	{
		id: 'm0v1y',
		icon: ic('/icons/weapon/pistol/m0v1y.png'),
		ru: '«Инвертор» (А)',
	},
	{
		id: 'p615w',
		icon: ic('/icons/weapon/shotgun_rifle/p615w.png'),
		ru: 'Derya MK-12 (А)',
	},
	{
		id: '2olgl',
		icon: ic('/icons/weapon/sniper_rifle/2olgl.png'),
		ru: 'Cheytac M300 (А)',
	},
	{
		id: 'g4v16',
		icon: ic('/icons/weapon/sniper_rifle/g4v16.png'),
		ru: 'ВСК-94 (А)',
	},
	{
		id: 'ok9z6',
		icon: ic('/icons/weapon/sniper_rifle/ok9z6.png'),
		ru: 'СВЧ (А)',
	},
	{
		id: 'rwz6v',
		icon: ic('/icons/weapon/sniper_rifle/rwz6v.png'),
		ru: '«Волна» (А)',
	},
]

export const ARSENAL_SHOP_20K: ShopItem[] = [
	{
		id: 'vj40r',
		icon: ic('/icons/weapon/assault_rifle/vj40r.png'),
		ru: 'АК-12 (А)',
	},
	{
		id: 'n42g1',
		icon: ic('/icons/weapon/assault_rifle/n42g1.png'),
		ru: 'AUG A3 (А)',
	},
	{
		id: 'dmv6j',
		icon: ic('/icons/weapon/assault_rifle/dmv6j.png'),
		ru: 'HK416 (А)',
	},
]

export const ARSENAL_SHOP_30K: ShopExchange[] = [
	{
		give: [
			{
				id: 'qjr43',
				icon: ic('/icons/attachment/handgrips/qjr43.png'),
				ru: 'Fortis SHIFT Vertical',
			},
		],
		get: {
			id: '7l62j',
			icon: ic('/icons/attachment/handgrips/7l62j.png'),
			ru: 'Рукоятка «Перо»',
		},
	},
	{
		give: [
			{
				id: 'qjr43',
				icon: ic('/icons/attachment/handgrips/qjr43.png'),
				ru: 'Fortis SHIFT Vertical',
			},
		],
		get: {
			id: '6wv20',
			icon: ic('/icons/attachment/handgrips/6wv20.png'),
			ru: 'Рукоятка «Утяжелитель»',
		},
	},
	{
		give: [
			{
				id: '1rvm2',
				icon: ic('/icons/attachment/handgrips/1rvm2.png'),
				ru: 'Magpul AFG',
			},
		],
		get: {
			id: '96v2y',
			icon: ic('/icons/attachment/handgrips/96v2y.png'),
			ru: 'Рукоятка «Блиц»',
		},
	},
	{
		give: [
			{
				id: 'zz9k9',
				icon: ic('/icons/attachment/barrel/zz9k9.png'),
				ru: 'Osprey',
			},
			{
				id: 'j52n4',
				icon: ic('/icons/attachment/barrel/j52n4.png'),
				ru: 'SRD762Ti',
			},
			{
				id: '4qpol',
				icon: ic('/icons/attachment/barrel/4qpol.png'),
				ru: 'KAC Style QD',
			},
			{
				id: 'y3mnw',
				icon: ic('/icons/attachment/barrel/y3mnw.png'),
				ru: 'АТГ',
			},
		],
		get: {
			id: 'ok5p4',
			icon: ic('/icons/attachment/barrel/ok5p4.png'),
			ru: 'Глушитель «Торопыжка»',
		},
	},
	{
		give: [
			{
				id: 'g42ng',
				icon: ic('/icons/attachment/barrel/g42ng.png'),
				ru: 'ДТК «Косой»',
			},
		],
		get: {
			id: '6wpy6',
			icon: ic('/icons/attachment/barrel/6wpy6.png'),
			ru: 'ДТК «Окоём»',
		},
	},
	{
		give: [
			{
				id: 'vjlog',
				icon: ic('/icons/attachment/barrel/vjlog.png'),
				ru: 'Venom TA',
			},
			{
				id: 'y3m4w',
				icon: ic('/icons/attachment/barrel/y3m4w.png'),
				ru: 'Цитадель 5.45',
			},
			{
				id: 'wjrjd',
				icon: ic('/icons/attachment/barrel/wjrjd.png'),
				ru: 'VG6 EPSILON',
			},
		],
		get: {
			id: '96p3w',
			icon: ic('/icons/attachment/barrel/96p3w.png'),
			ru: 'Пламегаситель «Крен»',
		},
	},
	{
		give: [
			{
				id: 'knwdv',
				icon: ic('/icons/attachment/collimator_sights/knwdv.png'),
				ru: 'Прицел Barska',
			},
		],
		get: {
			id: 'wjpdo',
			icon: ic('/icons/attachment/collimator_sights/wjpdo.png'),
			ru: 'Прицел «Баркас»',
		},
	},
]
