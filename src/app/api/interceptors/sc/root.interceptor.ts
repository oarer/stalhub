import type { CreateAxiosDefaults } from 'axios'
import axios from 'axios'

const options: CreateAxiosDefaults = {
    baseURL: 'https://eapi.stalcraft.net',
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' },
}

export const axiosClient = axios.create(options)
