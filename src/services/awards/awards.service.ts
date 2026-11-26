import axios, { type AxiosError } from 'axios'
import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	AwardCampaign,
	AwardErrorPayload,
	AwardPlayerSearchResponse,
	AwardPlayerTop,
	AwardResults,
	CastPlayerVoteInput,
	CastVoteInput,
	NominateClanInput,
	NominateClanResponse,
} from '@/types/awards.type'

export class AwardApiError extends Error {
	readonly status: number
	readonly payload?: AwardErrorPayload

	constructor(status: number, payload?: AwardErrorPayload) {
		super(payload?.message ?? payload?.code ?? 'Awards request failed')
		this.name = 'AwardApiError'
		this.status = status
		this.payload = payload
	}
}

class AwardsService {
	private async request<T>(request: () => Promise<{ data: T }>): Promise<T> {
		try {
			const response = await request()
			return response.data
		} catch (error) {
			if (!axios.isAxiosError<AwardErrorPayload>(error)) {
				throw error
			}

			const axiosError = error as AxiosError<AwardErrorPayload>
			throw new AwardApiError(
				axiosError.response?.status ?? 0,
				axiosError.response?.data
			)
		}
	}

	getCurrent(): Promise<AwardCampaign> {
		return this.request(() =>
			apiClient.get<AwardCampaign>('/api/v1/awards')
		)
	}

	getResults(): Promise<AwardResults> {
		return this.request(() =>
			apiClient.get<AwardResults>('/api/v1/awards/results')
		)
	}

	getCategory(year: number, slug: string): Promise<AwardCampaign> {
		return this.request(() =>
			apiClient.get<AwardCampaign>(
				`/api/v1/awards/${year}/${encodeURIComponent(slug)}`
			)
		)
	}

	castVote(input: CastVoteInput): Promise<void> {
		return this.request(() =>
			apiClient.post<void>('/api/v1/awards/vote', input)
		)
	}

	searchPlayers(
		categoryId: string,
		query: string,
		signal?: AbortSignal
	): Promise<AwardPlayerSearchResponse> {
		return this.request(() =>
			apiClient.get<AwardPlayerSearchResponse>(
				'/api/v1/awards/players/search',
				{ params: { category_id: categoryId, q: query }, signal }
			)
		)
	}

	getPlayerTop(categoryId: string, limit = 10): Promise<AwardPlayerTop[]> {
		return this.request(() =>
			apiClient.get<AwardPlayerTop[]>('/api/v1/awards/players/top', {
				params: { category_id: categoryId, limit },
			})
		)
	}

	castPlayerVote(input: CastPlayerVoteInput): Promise<{ id: string }> {
		return this.request(() =>
			apiClient.post<{ id: string }>('/api/v1/awards/votes/player', input)
		)
	}

	nominateClan(input: NominateClanInput): Promise<NominateClanResponse> {
		return this.request(() =>
			apiClient.post<NominateClanResponse>(
				'/api/v1/awards/nominate',
				input
			)
		)
	}
}

export const awardsService = new AwardsService()
