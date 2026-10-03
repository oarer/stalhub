import { queryOptions } from '@tanstack/react-query'
import { personalService } from '@/services/personal/personal.service'
import type {
	PersonalProfile,
	PersonalSnapshot,
	PersonalStageStats,
	PersonalSummary,
	PublicPersonal,
} from '@/types/personal/personal.type'

class PersonalQueries {
	getMe() {
		return queryOptions<PersonalProfile | null>({
			queryKey: ['personal', 'me'],
			queryFn: () => personalService.getMe(),
			staleTime: 1000 * 30,
			retry: false,
		})
	}

	getSnapshots() {
		return queryOptions<PersonalSnapshot[]>({
			queryKey: ['personal', 'snapshots'],
			queryFn: () => personalService.getSnapshots(),
			staleTime: 1000 * 60,
		})
	}

	getSummary() {
		return queryOptions<PersonalSummary>({
			queryKey: ['personal', 'summary'],
			queryFn: () => personalService.getSummary(),
			staleTime: 1000 * 60,
		})
	}

	getSessions() {
		return queryOptions({
			queryKey: ['personal', 'sessions'],
			queryFn: () => personalService.getSessions(),
			staleTime: 1000 * 30,
		})
	}

	getStageStats() {
		return queryOptions<PersonalStageStats>({
			queryKey: ['personal', 'stage-stats'],
			queryFn: () => personalService.getStageStats(),
			staleTime: 1000 * 60,
		})
	}

	getPublic(username: string) {
		return queryOptions<PublicPersonal>({
			queryKey: ['personal', 'public', username],
			queryFn: () => personalService.getPublic(username),
			staleTime: 1000 * 60,
			retry: false,
		})
	}
}

export const personalQueries = new PersonalQueries()
