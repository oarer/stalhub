import axios, { type AxiosAdapter, AxiosError, type AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/useAuth.store'
import { useBanStore } from '@/stores/useBan.store'

declare module 'axios' {
	interface AxiosRequestConfig {
		skipAuthRefresh?: boolean
		allowAuthRefresh?: boolean
		noServerCache?: boolean
	}
}

const isAuthRoute = () =>
	typeof window !== 'undefined' &&
	window.location.pathname.startsWith('/auth')

export const apiClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API,
	timeout: 10_000,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
})

const SSR_REVALIDATE_SECS = Number(process.env.SSR_REVALIDATE_SECS ?? 60)

const serverFetchAdapter: AxiosAdapter = async (config) => {
	const method = (config.method ?? 'get').toLowerCase()
	const url = axios.getUri(config)
	const timeout = config.timeout ?? 0

	let response: Response
	let timedOut = false
	const controller = new AbortController()
	const timer =
		timeout > 0
			? setTimeout(() => {
					timedOut = true
					controller.abort()
				}, timeout)
			: null

	try {
		const headers: Record<string, string> = {}
		const fromConfig = (
			config.headers as unknown as {
				toJSON?: () => Record<string, string>
			}
		).toJSON?.()
		for (const [key, value] of Object.entries(fromConfig ?? {})) {
			if (typeof value === 'string') headers[key] = value
		}

		const init: RequestInit & { next?: { revalidate: number } } = {
			method,
			headers,
			signal: controller.signal,
		}

		if (
			method === 'get' &&
			config.responseType !== 'arraybuffer' &&
			config.responseType !== 'blob'
		) {
			if (config.noServerCache) {
				init.cache = 'no-store'
			} else {
				init.next = { revalidate: SSR_REVALIDATE_SECS }
			}
		}

		response = await fetch(url, init)
	} catch (err) {
		if (timedOut) {
			throw new AxiosError(
				`timeout of ${timeout}ms exceeded`,
				'ECONNABORTED',
				config
			)
		}
		throw new AxiosError(
			err instanceof Error ? err.message : 'Network Error',
			'ERR_NETWORK',
			config
		)
	} finally {
		if (timer) clearTimeout(timer)
	}

	const text = await response.text()
	let data: unknown = text
	try {
		data = JSON.parse(text)
	} catch {
		// не JSON - оставляем
	}

	const responseHeaders: Record<string, string> = {}
	response.headers.forEach((value, key) => {
		responseHeaders[key] = value
	})

	const axiosResponse: AxiosResponse = {
		data,
		status: response.status,
		statusText: response.statusText,
		headers: responseHeaders,
		config,
		request: response,
	}

	const validateStatus =
		config.validateStatus ??
		((status: number) => status >= 200 && status < 300)

	if (validateStatus(response.status)) {
		return axiosResponse
	}

	throw new AxiosError(
		`Request failed with status code ${response.status}`,
		String(response.status),
		config,
		axiosResponse.request,
		axiosResponse
	)
}

if (typeof window === 'undefined') {
	apiClient.defaults.adapter = serverFetchAdapter

	axios.defaults.adapter = serverFetchAdapter
}

let isRefreshing = false

let failedQueue: Array<{
	resolve: () => void
	reject: (reason?: unknown) => void
}> = []

const processQueue = (error?: unknown) => {
	failedQueue.forEach(({ resolve, reject }) => {
		if (error) {
			reject(error)
		} else {
			resolve()
		}
	})

	failedQueue = []
}

apiClient.interceptors.response.use(
	(response) => response,

	async (error) => {
		const originalRequest = error.config

		if (
			error.response?.status === 403 &&
			error.response?.data?.error === 'Account banned'
		) {
			useBanStore
				.getState()
				.setBanned(
					true,
					error.response?.data?.reason,
					error.response?.data?.expire_in
				)

			return Promise.reject(error)
		}

		if (error.response?.status !== 401) {
			return Promise.reject(error)
		}

		if (originalRequest.url?.includes('/api/v1/auth/refresh')) {
			return Promise.reject(error)
		}

		if (originalRequest._retry) {
			return Promise.reject(error)
		}

		if (typeof window === 'undefined') {
			return Promise.reject(error)
		}

		// Some /me probes are intentionally unauthenticated. They must not start
		// refresh: the refresh token is HttpOnly and cannot be checked in JS.
		// Requests from /auth never refresh either, except ones that opt in via
		// allowAuthRefresh (e.g. desktop/issue needs a live session to hand off).
		if (
			originalRequest.skipAuthRefresh ||
			(isAuthRoute() && !originalRequest.allowAuthRefresh)
		) {
			return Promise.reject(error)
		}

		if (isRefreshing) {
			return new Promise<void>((resolve, reject) => {
				failedQueue.push({
					resolve,
					reject,
				})
			}).then(() => {
				return apiClient(originalRequest)
			})
		}

		originalRequest._retry = true
		isRefreshing = true

		try {
			await apiClient.post('/api/v1/auth/refresh', undefined, {
				skipAuthRefresh: true,
			})
			processQueue()

			return apiClient(originalRequest)
		} catch (refreshError) {
			processQueue(refreshError)

			useAuthStore.getState().setUser(null)

			return Promise.reject(refreshError)
		} finally {
			isRefreshing = false
		}
	}
)
