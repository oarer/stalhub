import axios from 'axios'
import type { StatusResponse } from '@/types/status.type'

class StatusService {
	async get(): Promise<StatusResponse> {
		try {
			const res = await axios.get('/api/status')
			return res.data
		} catch {
			throw new Error('STATUS_API_FAILED')
		}
	}
}

export const statusService = new StatusService()
