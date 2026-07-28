import axios from 'axios'
import { useBanStore } from '@/stores/useBan.store'

export const apiClient = axios.create({
	baseURL: 'http://localhost:3001',
	timeout: 10_000,
	headers: { 'Content-Type': 'application/json' },
	withCredentials: true,
})

let isRefreshing = false
let failedQueue: Array<{
	resolve: (value?: unknown) => void
	reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown) => {
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

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject })
				})
					.then(() => apiClient(originalRequest))
					.catch((err) => Promise.reject(err))
			}

			originalRequest._retry = true
			isRefreshing = true

			try {
				await apiClient.post('/api/v1/auth/refresh')
				processQueue(null)
				return apiClient(originalRequest)
			} catch (refreshError) {
				processQueue(refreshError)
				window.location.href = '/auth'
				return Promise.reject(refreshError)
			} finally {
				isRefreshing = false
			}
		}

		return Promise.reject(error)
	}
)
