export const DATE_FORMATS = {
	time: {
		hour: '2-digit',
		minute: '2-digit',
	},
	date: {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	},
	datetime: {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	},
} as const

export const formatDate = (
	date: Date | string | number,
	format: keyof typeof DATE_FORMATS = 'datetime',
	locale = 'ru-RU'
) => new Date(date).toLocaleString(locale, DATE_FORMATS[format])

export const MSK_OFFSET_MS = 3 * 60 * 60 * 1000

export const mskDate = (date: Date = new Date()): string => {
	const msk = new Date(date.getTime() + MSK_OFFSET_MS)
	const y = msk.getUTCFullYear()
	const m = String(msk.getUTCMonth() + 1).padStart(2, '0')
	const d = String(msk.getUTCDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

export const mskTimeString = (date: Date = new Date()): string => {
	const msk = new Date(date.getTime() + MSK_OFFSET_MS)
	return msk.toISOString().slice(11, 16)
}

export const mskHour = (date: Date = new Date()): number => {
	return new Date(date.getTime() + MSK_OFFSET_MS).getUTCHours()
}
