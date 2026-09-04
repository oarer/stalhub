export type ServerOnlineEntry = {
	region: string
	serverId: string
	online: number
	updatedAt: string
}

export type ServerOnlineHistoryPoint = {
	region: string
	createdAt: string
	online: number
}
