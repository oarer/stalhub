export function relativeDate(date: string): string {
	const diff = Date.now() - new Date(date).getTime()
	const minutes = Math.floor(diff / 60_000)
	if (minutes < 1) return 'now'
	if (minutes < 60) return `${minutes}m`
	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `${hours}h`
	const days = Math.floor(hours / 24)
	if (days < 30) return `${days}d`
	return new Date(date).toLocaleDateString()
}
