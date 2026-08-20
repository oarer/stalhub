import axios from 'axios'
import { useBanStore } from '@/stores/useBan.store'

export const apiClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API,
	timeout: 10_000,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
})

let isRefreshing = false
let hasSession = false

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
	(response) => {
		hasSession = true
		return response
	},

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

		if (!hasSession) {
			return Promise.reject(error)
		}

		if (originalRequest.url?.includes('/api/v1/auth/refresh')) {
			return Promise.reject(error)
		}

		if (originalRequest._retry) {
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
			await apiClient.post('/api/v1/auth/refresh')
			processQueue()

			return apiClient(originalRequest)
		} catch (refreshError) {
			processQueue(refreshError)

			return Promise.reject(refreshError)
		} finally {
			isRefreshing = false
		}
	}
)
