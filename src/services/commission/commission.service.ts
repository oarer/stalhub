import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	ArtistInput,
	ArtistProfile,
	CaseCommand,
	CommissionCase,
	CommissionCommand,
	CommissionCreate,
	CommissionFile,
	CommissionMessage,
	CommissionOrder,
	CommissionPage,
	CommissionReputation,
	CommissionSummary,
} from '@/types/commission.type'

const root = '/api/v1/commissions'
const privateRequest = { noServerCache: true }
export const commissionService = {
	async artists(page = 1, search = '') {
		return (
			await apiClient.get<CommissionPage<ArtistProfile>>(
				`${root}/artists`,
				{ params: { page, search } }
			)
		).data
	},
	async artist(username: string) {
		return (
			await apiClient.get<ArtistProfile>(
				`${root}/artists/${encodeURIComponent(username)}`
			)
		).data
	},
	async capabilities() {
		return (
			await apiClient.get<{ author: boolean; arbitrate: boolean }>(
				`${root}/capabilities`,
				privateRequest
			)
		).data
	},
	async profile() {
		return (
			await apiClient.get<ArtistProfile | null>(
				`${root}/profile`,
				privateRequest
			)
		).data
	},
	async saveProfile(input: ArtistInput) {
		return (await apiClient.put<ArtistProfile>(`${root}/profile`, input))
			.data
	},
	async create(input: CommissionCreate) {
		return (await apiClient.post<{ id: string }>(`${root}/orders`, input))
			.data
	},
	async orders(side: string, page: number, status = '') {
		return (
			await apiClient.get<CommissionPage<CommissionSummary>>(
				`${root}/orders`,
				{
					...privateRequest,
					params: { side, page, status: status || undefined },
				}
			)
		).data
	},
	async order(id: string) {
		return (
			await apiClient.get<CommissionOrder>(
				`${root}/orders/${id}`,
				privateRequest
			)
		).data
	},
	async command(id: string, input: CommissionCommand) {
		return (
			await apiClient.post<{ id: string }>(
				`${root}/orders/${id}/actions`,
				input
			)
		).data
	},
	async messages(
		id: string,
		cursor: { after?: number; before?: number } = {}
	) {
		return (
			await apiClient.get<{
				data: CommissionMessage[]
				has_more: boolean
			}>(`${root}/orders/${id}/messages`, {
				...privateRequest,
				params: cursor,
			})
		).data
	},
	async read(id: string, through: number) {
		await apiClient.post(`${root}/orders/${id}/read`, { through })
	},
	async reputation(customer: number, page = 1) {
		return (
			await apiClient.get<CommissionReputation>(
				`${root}/reputation/${customer}`,
				{ ...privateRequest, params: { page } }
			)
		).data
	},
	async cases(page = 1) {
		return (
			await apiClient.get<CommissionPage<CommissionCase>>(
				`${root}/cases`,
				{ ...privateRequest, params: { page } }
			)
		).data
	},
	async case(id: string) {
		return (
			await apiClient.get<CommissionCase>(
				`${root}/cases/${id}`,
				privateRequest
			)
		).data
	},
	async caseCommand(id: string, input: CaseCommand) {
		return (
			await apiClient.post<{ id: string }>(
				`${root}/cases/${id}/actions`,
				input
			)
		).data
	},
	async upload(file: File, onProgress: (value: number) => void) {
		const form = new FormData()
		form.append('file', file)
		return (
			await apiClient.post<CommissionFile>(`${root}/files`, form, {
				timeout: 120000,
				headers: { 'Content-Type': 'multipart/form-data' },
				onUploadProgress: (event) =>
					onProgress(
						event.total
							? Math.round((event.loaded / event.total) * 100)
							: 0
					),
			})
		).data
	},
	async removeFile(id: string) {
		await apiClient.delete(`${root}/files/${id}`)
	},
	async fileUrl(file: CommissionFile) {
		const response = await apiClient.get<Blob>(`${root}/files/${file.id}`, {
			...privateRequest,
			responseType: 'blob',
		})
		return URL.createObjectURL(response.data)
	},
	async download(file: CommissionFile) {
		const response = await apiClient.get<Blob>(`${root}/files/${file.id}`, {
			...privateRequest,
			responseType: 'blob',
		})
		const url = URL.createObjectURL(response.data)
		const link = document.createElement('a')
		link.href = url
		link.download = file.name
		link.click()
		setTimeout(() => URL.revokeObjectURL(url), 10000)
	},
}
