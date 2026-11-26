import {
	queryOptions,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query'
import { awardsService } from '@/services/awards/awards.service'
import type {
	CastPlayerVoteInput,
	CastVoteInput,
	NominateClanInput,
} from '@/types/awards.type'

export const awardsQueries = {
	current: (userId?: number) =>
		queryOptions({
			queryKey: ['awards', 'current', userId ?? null],
			queryFn: () => awardsService.getCurrent(),
			staleTime: 0,
		}),

	category: (year: number, slug: string) =>
		queryOptions({
			queryKey: ['awards', year, slug],
			queryFn: () => awardsService.getCategory(year, slug),
		}),

	results: () =>
		queryOptions({
			queryKey: ['awards', 'results'],
			queryFn: () => awardsService.getResults(),
		}),
}

export const useCastVote = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (input: CastVoteInput) => awardsService.castVote(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['awards'],
			})
		},
	})
}

export const useCastPlayerVote = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (input: CastPlayerVoteInput) =>
			awardsService.castPlayerVote(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['awards'],
			})
		},
	})
}

export const useNominateClanMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (input: NominateClanInput) =>
			awardsService.nominateClan(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['awards'],
			})
		},
	})
}
