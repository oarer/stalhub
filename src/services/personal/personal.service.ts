import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	PersonalProfile,
	PersonalSession,
	PersonalSnapshot,
	PersonalStageStats,
	PersonalSummary,
	PublicPersonal,
} from '@/types/personal/personal.type'

class PersonalService {
	async getMe(): Promise<PersonalProfile | null> {
		const { data } = await apiClient.get<PersonalProfile | null>(
			'/api/v1/personal/me'
		)
		return data
	}

	async link(region: string, character: string): Promise<PersonalProfile> {
		const { data } = await apiClient.post<PersonalProfile>(
			'/api/v1/personal/link',
			{ region, character }
		)
		return data
	}

	async unlink(): Promise<void> {
		await apiClient.delete('/api/v1/personal/me')
	}

	async setVisibility(
		is_public: boolean,
		public_fields?: string[]
	): Promise<PersonalProfile> {
		const { data } = await apiClient.patch<PersonalProfile>(
			'/api/v1/personal/visibility',
			{ is_public, public_fields }
		)
		return data
	}

	async snapshotNow(): Promise<PersonalSnapshot> {
		const { data } = await apiClient.post<PersonalSnapshot>(
			'/api/v1/personal/snapshot'
		)
		return data
	}

	async getSnapshots(params?: {
		from?: string
		to?: string
		limit?: number
	}): Promise<PersonalSnapshot[]> {
		const { data } = await apiClient.get<PersonalSnapshot[]>(
			'/api/v1/personal/snapshots',
			{ params }
		)
		return data ?? []
	}

	async getSummary(): Promise<PersonalSummary> {
		const { data } = await apiClient.get<PersonalSummary>(
			'/api/v1/personal/summary'
		)
		return data
	}

	async getSessions(): Promise<PersonalSession[]> {
		const { data } = await apiClient.get<PersonalSession[]>(
			'/api/v1/personal/sessions'
		)
		return data ?? []
	}

	async createSession(body: {
		region: string
		map_name: string
		type?: string
		stage_number?: number
		started_at?: string
	}): Promise<PersonalSession> {
		const { data } = await apiClient.post<PersonalSession>(
			'/api/v1/personal/sessions',
			body
		)
		return data
	}

	async getSession(id: number): Promise<unknown> {
		const { data } = await apiClient.get(`/api/v1/personal/sessions/${id}`)
		return data
	}

	async deleteSession(id: number): Promise<void> {
		await apiClient.delete(`/api/v1/personal/sessions/${id}`)
	}

	async uploadScreenshot(sessionId: number, file: File): Promise<unknown> {
		const form = new FormData()
		form.append('file', file)
		const { data } = await apiClient.post(
			`/api/v1/personal/sessions/${sessionId}/screenshots`,
			form,
			{ headers: { 'Content-Type': 'multipart/form-data' } }
		)
		return data
	}

	async getStageStats(): Promise<PersonalStageStats> {
		const { data } = await apiClient.get<PersonalStageStats>(
			'/api/v1/personal/stage-stats'
		)
		return data
	}

	async getPublic(username: string): Promise<PublicPersonal> {
		const { data } = await apiClient.get<PublicPersonal>(
			`/api/v1/personal/public/${encodeURIComponent(username)}`
		)
		return data
	}
}

export const personalService = new PersonalService()
