import { queryOptions } from '@tanstack/react-query'
import { commissionService as api } from '@/services/commission/commission.service'

export const commissionQueries = {
	artists: (page: number, search: string) =>
		queryOptions({
			queryKey: ['artists', page, search],
			queryFn: () => api.artists(page, search),
			staleTime: 30000,
		}),
	artist: (name: string) =>
		queryOptions({
			queryKey: ['artists', name],
			queryFn: () => api.artist(name),
			staleTime: 30000,
		}),
	capabilities: (user: number | undefined) =>
		queryOptions({
			queryKey: ['commissions', user, 'capabilities'],
			queryFn: api.capabilities,
			enabled: !!user,
		}),
	profile: (user: number | undefined) =>
		queryOptions({
			queryKey: ['commissions', user, 'profile'],
			queryFn: api.profile,
			enabled: !!user,
		}),
	orders: (
		user: number | undefined,
		side: string,
		page: number,
		status: string
	) =>
		queryOptions({
			queryKey: ['commissions', user, 'orders', side, page, status],
			queryFn: () => api.orders(side, page, status),
			enabled: !!user,
			refetchInterval: 15000,
			refetchIntervalInBackground: false,
		}),
	order: (user: number | undefined, id: string) =>
		queryOptions({
			queryKey: ['commissions', user, 'order', id],
			queryFn: () => api.order(id),
			enabled: !!user && !!id,
			refetchInterval: 5000,
			refetchIntervalInBackground: false,
		}),
	reputation: (
		user: number | undefined,
		customer: number,
		enabled: boolean,
		page = 1
	) =>
		queryOptions({
			queryKey: ['commissions', user, 'reputation', customer, page],
			queryFn: () => api.reputation(customer, page),
			enabled: !!user && enabled,
		}),
	cases: (user: number | undefined, page: number) =>
		queryOptions({
			queryKey: ['commissions', user, 'cases', page],
			queryFn: () => api.cases(page),
			enabled: !!user,
			refetchInterval: 15000,
			refetchIntervalInBackground: false,
		}),
	case: (user: number | undefined, id: string) =>
		queryOptions({
			queryKey: ['commissions', user, 'case', id],
			queryFn: () => api.case(id),
			enabled: !!user && !!id,
			refetchInterval: 5000,
			refetchIntervalInBackground: false,
		}),
}
