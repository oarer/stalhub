import { MSK_OFFSET_MS } from '@/lib/date'

export function mskLabel(date: string): string {
	const d = new Date(new Date(date).getTime() + MSK_OFFSET_MS)
	return d.toLocaleString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	})
}
