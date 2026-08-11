'use client'

import type { ReactNode } from 'react'
import { ArsenalView } from '@/views/calcs/arsenal/ArsenalView'
import { BPView } from '@/views/calcs/bp/BPView'
import BuildsLiteView from '@/views/calcs/builds/lite/BuildsLite'
import { DPIView } from '@/views/calcs/dpi/DPIView'
import { HideoutView } from '@/views/calcs/hideout/HideoutView'
import { ModulesView } from '@/views/calcs/modules/ModulesView'
import { TTKView } from '@/views/calcs/ttk/TTKView'
import ClanAbsenceView from '@/views/clan/ClanAbsenceView'
import ClanDashboardView from '@/views/clan/ClanDashboardView'
import ClanGoldView from '@/views/clan/ClanGoldView'
import ClanGrenadesView from '@/views/clan/ClanGrenadesView'
import ClanMembersView from '@/views/clan/ClanMembersView'
import ClanSessionsView from '@/views/clan/ClanSessionsView'
import ClanSquadsView from '@/views/clan/ClanSquadsView'
import ClanStatsView from '@/views/clan/ClanStatsView'
import MeArticlesView from '@/views/me/MeArticlesView'
import MeBuildsView from '@/views/me/MeBuildsView'
import MeHomeView from '@/views/me/MeHomeView'
import MeNotificationsView from '@/views/me/MeNotificationsView'
import MeStarsView from '@/views/me/MeStarsView'

export type WidgetCategory = 'calculators' | 'account'

export type WidgetDef = {
	id: string
	category: WidgetCategory
	titleKey: string
	icon: string
	requiresAuth: boolean
	defaultWidth: number
	defaultHeight: number
	minWidth: number
	minHeight: number
	fullPath: string
	scrollable?: boolean
	render: () => ReactNode
}

export const WIDGETS: WidgetDef[] = [
	{
		id: 'buildsLite',
		category: 'calculators',
		titleKey: 'dashboard.widgets.buildsLite.title',
		icon: 'lucide:panel-top',
		requiresAuth: false,
		defaultWidth: 620,
		defaultHeight: 460,
		minWidth: 440,
		minHeight: 320,
		fullPath: '/calcs/builds/lite',
		render: () => <BuildsLiteView variant="widget" />,
	},
	{
		id: 'ttk',
		category: 'calculators',
		titleKey: 'dashboard.widgets.ttk.title',
		icon: 'lucide:timer-reset',
		requiresAuth: false,
		defaultWidth: 480,
		defaultHeight: 420,
		minWidth: 380,
		minHeight: 280,
		fullPath: '/calcs/ttk',
		render: () => <TTKView variant="widget" />,
	},
	{
		id: 'arsenal',
		category: 'calculators',
		titleKey: 'dashboard.widgets.arsenal.title',
		icon: 'lucide:table-properties',
		requiresAuth: false,
		defaultWidth: 480,
		defaultHeight: 420,
		minWidth: 380,
		minHeight: 280,
		fullPath: '/calcs/arsenal',
		render: () => <ArsenalView variant="widget" />,
	},
	{
		id: 'modules',
		category: 'calculators',
		titleKey: 'dashboard.widgets.modules.title',
		icon: 'lucide:box',
		requiresAuth: false,
		defaultWidth: 480,
		defaultHeight: 420,
		minWidth: 380,
		minHeight: 280,
		fullPath: '/calcs/modules',
		render: () => <ModulesView variant="widget" />,
	},
	{
		id: 'hideout',
		category: 'calculators',
		titleKey: 'dashboard.widgets.hideout.title',
		icon: 'lucide:house',
		requiresAuth: false,
		defaultWidth: 640,
		defaultHeight: 480,
		minWidth: 440,
		minHeight: 320,
		fullPath: '/calcs/hideout',
		scrollable: false,
		render: () => <HideoutView variant="widget" />,
	},
	{
		id: 'bp',
		category: 'calculators',
		titleKey: 'dashboard.widgets.bp.title',
		icon: 'lucide:ticket',
		requiresAuth: false,
		defaultWidth: 420,
		defaultHeight: 360,
		minWidth: 340,
		minHeight: 260,
		fullPath: '/calcs/bp',
		render: () => <BPView variant="widget" />,
	},
	{
		id: 'dpi',
		category: 'calculators',
		titleKey: 'dashboard.widgets.dpi.title',
		icon: 'lucide:mouse',
		requiresAuth: false,
		defaultWidth: 420,
		defaultHeight: 320,
		minWidth: 320,
		minHeight: 240,
		fullPath: '/calcs/dpi',
		render: () => <DPIView variant="widget" />,
	},
	{
		id: 'meHome',
		category: 'account',
		titleKey: 'dashboard.widgets.meHome.title',
		icon: 'lucide:layout-dashboard',
		requiresAuth: true,
		defaultWidth: 480,
		defaultHeight: 420,
		minWidth: 380,
		minHeight: 280,
		fullPath: '/me',
		render: () => <MeHomeView />,
	},
	{
		id: 'meBuilds',
		category: 'account',
		titleKey: 'dashboard.widgets.meBuilds.title',
		icon: 'lucide:package',
		requiresAuth: true,
		defaultWidth: 480,
		defaultHeight: 420,
		minWidth: 380,
		minHeight: 280,
		fullPath: '/me/builds',
		render: () => <MeBuildsView />,
	},
	{
		id: 'meArticles',
		category: 'account',
		titleKey: 'dashboard.widgets.meArticles.title',
		icon: 'lucide:file-text',
		requiresAuth: true,
		defaultWidth: 480,
		defaultHeight: 420,
		minWidth: 380,
		minHeight: 280,
		fullPath: '/me/articles',
		render: () => <MeArticlesView />,
	},
	{
		id: 'meNotifications',
		category: 'account',
		titleKey: 'dashboard.widgets.meNotifications.title',
		icon: 'lucide:bell',
		requiresAuth: true,
		defaultWidth: 480,
		defaultHeight: 420,
		minWidth: 380,
		minHeight: 280,
		fullPath: '/me/notifications',
		render: () => <MeNotificationsView />,
	},
	{
		id: 'meStars',
		category: 'account',
		titleKey: 'dashboard.widgets.meStars.title',
		icon: 'lucide:star',
		requiresAuth: true,
		defaultWidth: 480,
		defaultHeight: 420,
		minWidth: 380,
		minHeight: 280,
		fullPath: '/me/stars',
		render: () => <MeStarsView />,
	},
	{
		id: 'clan',
		category: 'account',
		titleKey: 'dashboard.widgets.clan.title',
		icon: 'lucide:users',
		requiresAuth: true,
		defaultWidth: 480,
		defaultHeight: 420,
		minWidth: 380,
		minHeight: 280,
		fullPath: '/me/clan',
		render: () => <ClanDashboardView />,
	},
	{
		id: 'clanMembers',
		category: 'account',
		titleKey: 'dashboard.widgets.clanMembers.title',
		icon: 'lucide:users-round',
		requiresAuth: true,
		defaultWidth: 440,
		defaultHeight: 380,
		minWidth: 340,
		minHeight: 260,
		fullPath: '/me/clan/members',
		render: () => <ClanMembersView />,
	},
	{
		id: 'clanSessions',
		category: 'account',
		titleKey: 'dashboard.widgets.clanSessions.title',
		icon: 'lucide:history',
		requiresAuth: true,
		defaultWidth: 480,
		defaultHeight: 420,
		minWidth: 380,
		minHeight: 280,
		fullPath: '/me/clan/sessions',
		render: () => <ClanSessionsView />,
	},
	{
		id: 'clanAbsences',
		category: 'account',
		titleKey: 'dashboard.widgets.clanAbsences.title',
		icon: 'lucide:calendar-x',
		requiresAuth: true,
		defaultWidth: 440,
		defaultHeight: 380,
		minWidth: 340,
		minHeight: 260,
		fullPath: '/me/clan/absences',
		render: () => <ClanAbsenceView />,
	},
	{
		id: 'clanGold',
		category: 'account',
		titleKey: 'dashboard.widgets.clanGold.title',
		icon: 'lucide:coins',
		requiresAuth: true,
		defaultWidth: 440,
		defaultHeight: 380,
		minWidth: 340,
		minHeight: 260,
		fullPath: '/me/clan/gold',
		render: () => <ClanGoldView />,
	},
	{
		id: 'clanGrenades',
		category: 'account',
		titleKey: 'dashboard.widgets.clanGrenades.title',
		icon: 'lucide:bomb',
		requiresAuth: true,
		defaultWidth: 440,
		defaultHeight: 380,
		minWidth: 340,
		minHeight: 260,
		fullPath: '/me/clan/grenades',
		render: () => <ClanGrenadesView />,
	},
	{
		id: 'clanSquads',
		category: 'account',
		titleKey: 'dashboard.widgets.clanSquads.title',
		icon: 'lucide:shield',
		requiresAuth: true,
		defaultWidth: 480,
		defaultHeight: 420,
		minWidth: 380,
		minHeight: 280,
		fullPath: '/me/clan/squads',
		render: () => <ClanSquadsView />,
	},
	{
		id: 'clanStats',
		category: 'account',
		titleKey: 'dashboard.widgets.clanStats.title',
		icon: 'lucide:bar-chart-3',
		requiresAuth: true,
		defaultWidth: 440,
		defaultHeight: 380,
		minWidth: 340,
		minHeight: 260,
		fullPath: '/me/clan/stats',
		render: () => <ClanStatsView />,
	},
]

export const getWidgetDef = (id: string): WidgetDef | undefined =>
	WIDGETS.find((widget) => widget.id === id)
