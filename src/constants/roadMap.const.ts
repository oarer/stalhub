export interface RoadMap {
	name: string
	desc: string
	icon: string
	status: 'review' | 'inDev' | 'production' | 'cancel'
	subTask?: RoadMap[]
}

export const statusConfig = {
	review: {
		label: 'roadmap.status.review',
		icon: 'mdi:clock-outline',
		color: 'text-sky-600 dark:text-sky-300',
		border: 'ring-sky-200 dark:ring-sky-800',
		bgColor: 'bg-sky-50 dark:bg-sky-900/25',
	},
	inDev: {
		label: 'roadmap.status.inDev',
		icon: 'mdi:code-braces',
		color: 'text-orange-600 dark:text-orange-300',
		border: 'ring-orange-200 dark:ring-orange-800',
		bgColor: 'bg-orange-50 dark:bg-orange-900/25',
	},
	production: {
		label: 'roadmap.status.production',
		icon: 'mdi:check-circle',
		color: 'text-green-600 dark:text-green-300',
		border: 'ring-green-200 dark:ring-green-800',
		bgColor: 'bg-green-50 dark:bg-green-900/25',
	},
	cancel: {
		label: 'roadmap.status.cancel',
		icon: 'mdi:close-circle',
		color: 'text-red-600 dark:text-red-300',
		border: 'ring-red-200 dark:ring-red-800',
		bgColor: 'bg-red-50 dark:bg-red-900/25',
	},
}

// by @Art3mLapa
export const roadMap: RoadMap[] = [
	{
		name: 'roadmap.items.home.name',
		desc: 'roadmap.items.home.desc',
		icon: 'lucide:home',
		status: 'production',
		subTask: [
			{
				name: 'roadmap.items.home.subTasks.design.name',
				desc: 'roadmap.items.home.subTasks.design.desc',
				icon: 'lucide:palette',
				status: 'production',
			},
			{
				name: 'roadmap.items.home.subTasks.ui_library.name',
				desc: 'roadmap.items.home.subTasks.ui_library.desc',
				icon: 'lucide:layout',
				status: 'production',
			},
		],
	},
	{
		name: 'roadmap.items.interactive_map.name',
		desc: 'roadmap.items.interactive_map.desc',
		icon: 'lucide:map',
		status: 'inDev',
		subTask: [
			{
				name: 'roadmap.items.interactive_map.subTasks.all_locations_maps.name',
				desc: 'roadmap.items.interactive_map.subTasks.all_locations_maps.desc',
				icon: 'lucide:map-pin',
				status: 'inDev',
			},
			{
				name: 'roadmap.items.interactive_map.subTasks.event_marks.name',
				desc: 'roadmap.items.interactive_map.subTasks.event_marks.desc',
				icon: 'lucide:flag',
				status: 'inDev',
			},
			{
				name: 'roadmap.items.interactive_map.subTasks.export_marks.name',
				desc: 'roadmap.items.interactive_map.subTasks.export_marks.desc',
				icon: 'lucide:download',
				status: 'review',
			},
		],
	},
	{
		name: 'roadmap.items.auction.name',
		desc: 'roadmap.items.auction.desc',
		icon: 'lucide:gavel',
		status: 'review',
		subTask: [
			{
				name: 'roadmap.items.auction.subTasks.latest_lots.name',
				desc: 'roadmap.items.auction.subTasks.latest_lots.desc',
				icon: 'lucide:list',
				status: 'review',
			},
			{
				name: 'roadmap.items.auction.subTasks.price_tracking.name',
				desc: 'roadmap.items.auction.subTasks.price_tracking.desc',
				icon: 'lucide:trending-up',
				status: 'review',
			},
			{
				name: 'roadmap.items.auction.subTasks.good_deals.name',
				desc: 'roadmap.items.auction.subTasks.good_deals.desc',
				icon: 'lucide:tag',
				status: 'review',
			},
		],
	},
	{
		name: 'roadmap.items.player_search.name',
		desc: 'roadmap.items.player_search.desc',
		icon: 'lucide:users',
		status: 'review',
		subTask: [
			{
				name: 'roadmap.items.player_search.subTasks.players_page.name',
				desc: 'roadmap.items.player_search.subTasks.players_page.desc',
				icon: 'lucide:user',
				status: 'review',
			},
		],
	},
	{
		name: 'roadmap.items.models_view.name',
		desc: 'roadmap.items.models_view.desc',
		icon: 'lucide:package',
		status: 'review',
		subTask: [
			{
				name: 'roadmap.items.models_view.subTasks.base_items_guide.name',
				desc: 'roadmap.items.models_view.subTasks.base_items_guide.desc',
				icon: 'lucide:book',
				status: 'review',
			},
			{
				name: 'roadmap.items.models_view.subTasks.missing_items_guide.name',
				desc: 'roadmap.items.models_view.subTasks.missing_items_guide.desc',
				icon: 'lucide:book-plus',
				status: 'review',
			},
			{
				name: 'roadmap.items.models_view.subTasks.preview_3d.name',
				desc: 'roadmap.items.models_view.subTasks.preview_3d.desc',
				icon: 'lucide:view',
				status: 'review',
			},
		],
	},
	{
		name: 'roadmap.items.build_calculator.name',
		desc: 'roadmap.items.build_calculator.desc',
		icon: 'lucide:calculator',
		status: 'inDev',
		subTask: [
			{
				name: 'roadmap.items.build_calculator.subTasks.save_builds.name',
				desc: 'roadmap.items.build_calculator.subTasks.save_builds.desc',
				icon: 'lucide:save',
				status: 'inDev',
			},
		],
	},
	{
		name: 'roadmap.items.localization.name',
		desc: 'roadmap.items.localization.desc',
		icon: 'lucide:languages',
		status: 'inDev',
	},
	{
		name: 'roadmap.items.ttk_calculator.name',
		desc: 'roadmap.items.ttk_calculator.desc',
		icon: 'lucide:clock',
		status: 'inDev',
	},
	{
		name: 'roadmap.items.exchange_coins.name',
		desc: 'roadmap.items.exchange_coins.desc',
		icon: 'lucide:coins',
		status: 'inDev',
	},
	{
		name: 'roadmap.items.season_pass.name',
		desc: 'roadmap.items.season_pass.desc',
		icon: 'lucide:ticket',
		status: 'inDev',
	},
	{
		name: 'roadmap.items.sensitivity.name',
		desc: 'roadmap.items.sensitivity.desc',
		icon: 'lucide:sliders',
		status: 'inDev',
	},
	{
		name: 'roadmap.items.kv_maps.name',
		desc: 'roadmap.items.kv_maps.desc',
		icon: 'lucide:map',
		status: 'cancel',
		subTask: [
			{
				name: 'roadmap.items.kv_maps.subTasks.drawing_canvas.name',
				desc: 'roadmap.items.kv_maps.subTasks.drawing_canvas.desc',
				icon: 'lucide:brush',
				status: 'cancel',
			},
			{
				name: 'roadmap.items.kv_maps.subTasks.save_tactics.name',
				desc: 'roadmap.items.kv_maps.subTasks.save_tactics.desc',
				icon: 'lucide:save',
				status: 'cancel',
			},
		],
	},
	{
		name: 'roadmap.items.squad_builder.name',
		desc: 'roadmap.items.squad_builder.desc',
		icon: 'lucide:users',
		status: 'cancel',
	},
	{
		name: 'roadmap.items.clan_ratings.name',
		desc: 'roadmap.items.clan_ratings.desc',
		icon: 'lucide:bar-chart',
		status: 'inDev',
		subTask: [
			{
				name: 'roadmap.items.clan_ratings.subTasks.rating_tracking.name',
				desc: 'roadmap.items.clan_ratings.subTasks.rating_tracking.desc',
				icon: 'lucide:refresh-cw',
				status: 'inDev',
			},
		],
	},
]
