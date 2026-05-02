import {
	environmentManager,
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
				refetchOnWindowFocus: true,
			},
		},
	})
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
	if (environmentManager.isServer()) {
		return makeQueryClient()
	} else {
		if (!browserQueryClient) browserQueryClient = makeQueryClient()

		return browserQueryClient
	}
}

export default function QueryProvider({ children }: PropsWithChildren) {
	const queryClient = getQueryClient()

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	)
}
