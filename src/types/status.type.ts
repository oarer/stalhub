type ServiceStatus = 'UP' | 'DOWN' | 'DEGRADED' | 'MAINTENANCE'

type UptimePoint = {
	ts: number
	countOfUp: number
	countOfDown: number
	countOfDegraded: number
	countOfMaintenance: number
	avgLatency: number
	maxLatency: number
	minLatency: number
}

export type Service = {
	name: string
	description: string
	image: string | null
	currentStatus: ServiceStatus
	uptime: string
	uptimeData: UptimePoint[]
	fromTimeStamp: number
	toTimeStamp: number
	avgLatency: string
	maxLatency: string
	minLatency: string
}

export type StatusResponse = {
	data: Record<string, Service>
	missingTags: string[]
}
