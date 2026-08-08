import { GITHUB_RAW_BASE } from '@/constants/github.const'
import type { ModulesData } from '@/types/module.type'

const MODULES_URL = `${GITHUB_RAW_BASE}/modules.json`

class ModulesService {
	async getModules() {
		const res = await fetch(MODULES_URL)
		if (!res.ok) throw new Error(`Failed to fetch modules.json: ${res.status}`)
		return (await res.json()) as ModulesData
	}
}

export const modulesService = new ModulesService()
