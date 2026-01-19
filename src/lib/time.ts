import type { TFunction } from 'i18next'

export const numbersTxt = (
	num: number,
	variations: [string, string, string]
): string => {
	const past = num % 10
	const first = Math.floor(num / 10) % 10

	let text: string
	if (past === 1 && !num.toString().endsWith('11')) {
		text = variations[0]
	} else if (past >= 2 && past <= 4 && first !== 1) {
		text = variations[1]
	} else {
		text = variations[2]
	}

	return `${num} ${text}`
}

export const stringTimeDelta = (delta: number, t: TFunction) => {
	if (delta < 60) {
		return numbersTxt(Math.round(delta), [
			t('time.second.one'),
			t('time.second.few'),
			t('time.second.many'),
		])
	} else if (delta < 3600) {
		return numbersTxt(Math.round(delta / 60), [
			t('time.minute.one'),
			t('time.minute.few'),
			t('time.minute.many'),
		])
	} else if (delta < 86400) {
		return numbersTxt(Math.round(delta / 3600), [
			t('time.hour.one'),
			t('time.hour.few'),
			t('time.hour.many'),
		])
	} else if (delta < 2592000) {
		return numbersTxt(Math.round(delta / 86400), [
			t('time.day.one'),
			t('time.day.few'),
			t('time.day.many'),
		])
	} else if (delta < 31104000) {
		return numbersTxt(Math.round(delta / 2592000), [
			t('time.month.one'),
			t('time.month.few'),
			t('time.month.many'),
		])
	} else {
		return numbersTxt(Math.round(delta / 31104000), [
			t('time.year.one'),
			t('time.year.few'),
			t('time.year.many'),
		])
	}
}

export const stringTimeDeltaFull = (delta: number, t: TFunction) => {
	const days = Math.floor(delta / 86400)
	const hours = Math.floor((delta % 86400) / 3600)
	const minutes = Math.floor((delta % 3600) / 60)

	const parts: string[] = []

	if (days > 0) {
		parts.push(
			numbersTxt(days, [
				t('time.day.one'),
				t('time.day.few'),
				t('time.day.many'),
			])
		)
	}

	if (hours > 0) {
		parts.push(
			numbersTxt(hours, [
				t('time.hour.one'),
				t('time.hour.few'),
				t('time.hour.many'),
			])
		)
	}

	if (minutes > 0 || parts.length === 0) {
		parts.push(
			numbersTxt(minutes, [
				t('time.minute.one'),
				t('time.minute.few'),
				t('time.minute.many'),
			])
		)
	}

	if (parts.length > 1) {
		const last = parts.pop()
		return `${parts.join(', ')} ${t('time.and')} ${last}`
	}

	return parts[0]
}

export const dateSince = (iso: Date, lang: TFunction) => {
	const past = new Date(iso).getTime()
	const now = Date.now()
	const delta = Math.floor((now - past) / 1000)

	return stringTimeDelta(delta, lang)
}
