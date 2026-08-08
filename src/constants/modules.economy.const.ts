import type {
	ModuleEconomyConfig,
	ModuleRarity,
	RarityCostMultiplier,
} from '@/types/module.type'

const rarityCostMultiplier = {
	common: { craft: 1, category: 0.75, disassemble: 0.1, restore: 0.2 },
	uncommon: { craft: 2, category: 1, disassemble: 0.3, restore: 0.75 },
	special: { craft: 3, category: 1.25, disassemble: 0.7, restore: 2 },
	rare: { craft: 4, category: 3, disassemble: 1, restore: 2.7 },
	exclusive: { craft: 5, category: 4, disassemble: 1.2, restore: 3.3 },
	legendary: { craft: 6, category: 5, disassemble: 1.5, restore: 4 },
	unique: { craft: 7, category: 6, disassemble: 1.8, restore: 4.7 },
} satisfies Record<ModuleRarity, RarityCostMultiplier>

export const moduleEconomy: ModuleEconomyConfig = {
	rerollBaseCost: 100,
	craftExpression: '0',
	disassembleExpression: 'floor(1000 * k + 0.5)',
	restoreExpression: 'floor(1000 * k + 0.5)',
	categoryExpression: 'floor((1000 * k * 1.2^(N-1) / 5) + 0.5) * 5',
	rerollExpression: 'floor((100 * 1.3^(N-1) / 5) + 0.5) * 5',
	rarityCostMultiplier,
}
