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
