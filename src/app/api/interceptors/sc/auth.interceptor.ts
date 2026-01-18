import type { InternalAxiosRequestConfig, AxiosError } from 'axios'
import axios from 'axios'

import { TokenPool } from '@/lib/tokenPool'

const tokens = Array.from(
    { length: 15 },
    (_, i) => process.env[`EXBO_TOKEN_${i + 1}`]!
).filter(Boolean)

export const tokenPool = new TokenPool(tokens)

export const apiClient = axios.create({
    baseURL: 'https://eapi.stalcraft.net',
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const idx = tokenPool.acquire()
            const token = tokenPool.getToken(idx)

            const headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            } as InternalAxiosRequestConfig['headers']

            return {
                ...config,
                headers,
                _tokenIdx: idx,
            } as InternalAxiosRequestConfig & { _tokenIdx: number }
        } catch {
            throw new Error('All tokens are blocked')
        }
    }
)

apiClient.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const config =
            (error.config as InternalAxiosRequestConfig & {
                _tokenIdx?: number
                _retry?: boolean
            }) || undefined

        const idx = config?._tokenIdx

        const status = error.response?.status

        if (status === 429 && config && !config._retry) {
            if (idx !== undefined) tokenPool.block(idx, 60_000)

            config._retry = true
            delete config._tokenIdx

            try {
                return await apiClient(config)
            } catch (err) {
                return Promise.reject(err)
            }
        }

        return Promise.reject(error)
    }
)
