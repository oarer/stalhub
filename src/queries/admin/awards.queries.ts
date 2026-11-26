import {
	keepPreviousData,
	queryOptions,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query'
import { adminAwardsService as api } from '@/services/admin/awards.service'
import type {
	AdminAwardCategoryInput,
	AdminAwardNomineeInput,
	AdminAwardPlaceBulkInput,
	AdminAwardPlaceInput,
	AdminAwardUpdateCampaignInput,
	AdminAwardVoteParams,
	AdminAwardVoteUpdateInput,
} from '@/types/admin.type'

const key = ['admin', 'awards'] as const

export const adminAwardsQueries = {
	list: () =>
		queryOptions({
			queryKey: key,
			queryFn: () => api.list(),
		}),
	listCategories: (campaignId: string) =>
		queryOptions({
			queryKey: [...key, campaignId, 'categories'],
			queryFn: () => api.listCategories(campaignId),
		}),
	listNominees: (campaignId: string, categoryId: string) =>
		queryOptions({
			queryKey: [...key, campaignId, categoryId, 'nominees'],
			queryFn: () => api.listNominees(campaignId, categoryId),
		}),
	votes: (id: string, params: AdminAwardVoteParams = {}) =>
		queryOptions({
			queryKey: [...key, id, 'votes', params],
			queryFn: () => api.votes(id, params),
			placeholderData: keepPreviousData,
			refetchInterval: 15000,
			refetchIntervalInBackground: false,
		}),
	stats: (id: string) =>
		queryOptions({
			queryKey: [...key, id, 'stats'],
			queryFn: () => api.stats(id),
		}),
	results: (id: string) =>
		queryOptions({
			queryKey: [...key, id, 'results'],
			queryFn: () => api.results(id),
		}),
}

function useAdminAwardsMutation<T, R>(fn: (value: T) => Promise<R>) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: fn,
		onSuccess: () => qc.invalidateQueries({ queryKey: key }),
	})
}

export const useCreateAwardCampaign = () =>
	useAdminAwardsMutation(api.create.bind(api))

export const useUpdateAwardCampaign = () => {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({
			id,
			input,
		}: {
			id: string
			input: AdminAwardUpdateCampaignInput
		}) => api.update(id, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: key }),
	})
}

export const useCreateAwardCategory = () => {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({
			campaignId,
			input,
		}: {
			campaignId: string
			input: AdminAwardCategoryInput
		}) => api.createCategory(campaignId, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: key }),
	})
}

export const useUpdateAwardCategory = () => {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({
			campaignId,
			id,
			input,
		}: {
			campaignId: string
			id: string
			input: Partial<AdminAwardCategoryInput>
		}) => api.updateCategory(campaignId, id, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: key }),
	})
}

export const useDeleteAwardCategory = () => {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ campaignId, id }: { campaignId: string; id: string }) =>
			api.deleteCategory(campaignId, id),
		onSuccess: () => qc.invalidateQueries({ queryKey: key }),
	})
}

export const useCreateAwardNominee = () => {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({
			campaignId,
			categoryId,
			input,
		}: {
			campaignId: string
			categoryId: string
			input: AdminAwardNomineeInput
		}) => api.createNominee(campaignId, categoryId, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: key }),
	})
}

export const useUpdateAwardNominee = () => {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({
			campaignId,
			categoryId,
			id,
			input,
		}: {
			campaignId: string
			categoryId: string
			id: string
			input: Partial<AdminAwardNomineeInput>
		}) => api.updateNominee(campaignId, categoryId, id, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: key }),
	})
}

export const useDeleteAwardNominee = () => {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({
			campaignId,
			categoryId,
			id,
		}: {
			campaignId: string
			categoryId: string
			id: string
		}) => api.deleteNominee(campaignId, categoryId, id),
		onSuccess: () => qc.invalidateQueries({ queryKey: key }),
	})
}

export const useUploadAwardAvatar = () =>
	useAdminAwardsMutation(api.uploadAvatar.bind(api))

export const useUploadAwardCategoryImage = () =>
	useAdminAwardsMutation(api.uploadCategoryImage.bind(api))

export const useSetAwardPlace = () => {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({
			campaignId,
			categoryId,
			nomineeId,
			input,
		}: {
			campaignId: string
			categoryId: string
			nomineeId: string
			input: AdminAwardPlaceInput
		}) => api.place(campaignId, categoryId, nomineeId, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: key }),
	})
}

export const useSetAwardPlaces = () => {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({
			campaignId,
			places,
		}: {
			campaignId: string
			places: AdminAwardPlaceBulkInput[]
		}) => api.placeMany(campaignId, places),
		onSuccess: () => qc.invalidateQueries({ queryKey: key }),
	})
}

export const useUpdateAwardVote = () => {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({
			campaignId,
			voteId,
			input,
		}: {
			campaignId: string
			voteId: string
			input: AdminAwardVoteUpdateInput
		}) => api.updateVote(campaignId, voteId, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: key }),
	})
}
