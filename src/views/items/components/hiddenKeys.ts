import type { InfoElement } from '@/types/item.type'

export const HIDDEN_KEYS = new Set([
	'core.quality.common',
	'stalker.tooltip.artefact.not_probed',
	'stalker.tooltip.artefact.info.freshness',
	'stalker.tooltip.artefact.info.durability',
	'stalker.tooltip.artefact.info.max_durability',
	'stalker.lore.armor_artefact.info.compatible_backpacks',
	'general.armor.compatibility.backpacks.superheavy',
	'stalker.lore.armor_artefact.info.compatible_containers',
	'general.armor.compatibility.containers.bulky',
	'item.att.temp_model_armor.additional_stats_tip',
	'core.tooltip.stat_name.damage_type.direct',
	'weapon.lore.attachment.all_suitable_targets',
	'core.tooltip.info.durability',
	'core.tooltip.info.max_durability',
])

export const getElementKeys = (el: InfoElement): string[] => {
	switch (el.type) {
		case 'key-value':
			return el.key.type === 'translation' ? [el.key.key] : []
		case 'item':
			return el.name.type === 'translation' ? [el.name.key] : []
		case 'text':
			return el.text.type === 'translation' ? [el.text.key] : []
		case 'numeric':
		case 'range':
		case 'threshold':
			return el.name.type === 'translation' ? [el.name.key] : []
		default:
			return []
	}
}
