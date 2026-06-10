import type { Root } from '@/types/hideout.type'

class HideoutService {
	async get() {
		const res = await fetch(
			'https://raw.githubusercontent.com/EXBO-Studio/stalcraft-database/refs/heads/main/ru/hideout_recipes.json'
		)
		return res.json() as Promise<Root>
	}
}

export const hideoutService = new HideoutService()
