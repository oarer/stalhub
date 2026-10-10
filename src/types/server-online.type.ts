export type ServerOnlineEntry = {
	region: string
	serverId: string
	online: number
	updatedAt: Date
}

export type ServerOnlineHistoryPoint = {
	region: string
	createdAt: Date
	online: number
}

export type ServerOnlinePeak = {
	date: string
	region: string
	peak: number
}

export type EmissionInfo = {
	region: string
	currentStart?: string | null
	previousStart?: string | null
	previousEnd?: string | null
}
