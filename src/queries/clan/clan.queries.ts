import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { clanService } from '@/services/clan/clan.service'
import type {
	Absence,
	AttendanceMonth,
	AttendanceSummary,
	BotGuild,
	ClanBoostOrdersResponse,
	ClanInfo,
	ClanInvite,
	ClanMember,
	ClanMemberNoteWithMember,
	ClanSchedule,
	ClanSettings,
	ClanSquad,
	ClanStats,
	ConsumableListingItem,
	GoldDrop,
	GrenadeAllTimeResponse,
	GrenadeBoxesResponse,
	GrenadeStagesResponse,
	ListingItem,
	MyClanProfile,
	PublicClan,
	StageSession,
	StageSessionDetail,
	UserClanProfile,
} from '@/types/clan/clan.type'
import type { AttendanceFilter } from '@/views/clan/components/charts/chart.utils'

class ClanQueries {
	getMe() {
		return queryOptions<UserClanProfile | null>({
			queryKey: ['clan', 'me'],
			queryFn: () => clanService.getMe(),
			staleTime: 1000 * 30,
			retry: false,
		})
	}

	getMyClans() {
		return queryOptions<MyClanProfile[]>({
			queryKey: ['clan', 'my-clans'],
			queryFn: () => clanService.getMyClans(),
			staleTime: 1000 * 30,
			retry: false,
		})
	}

	getClan(clanId: string) {
		return queryOptions<ClanInfo>({
			queryKey: ['clan', clanId],
			queryFn: () => clanService.getClan(clanId),
			staleTime: 1000 * 60,
		})
	}

	getMembers(clanId: string) {
		return queryOptions<ClanMember[]>({
			queryKey: ['clan', clanId, 'members'],
			queryFn: () => clanService.getMembers(clanId),
			staleTime: 1000 * 30,
		})
	}

	getSessions(clanId?: string) {
		return queryOptions<StageSession[]>({
			queryKey: ['clan', 'sessions', clanId],
			queryFn: () => clanService.getSessions(clanId),
			staleTime: 1000 * 30,
		})
	}

	getSession(id: number) {
		return queryOptions<StageSessionDetail>({
			queryKey: ['clan', 'sessions', id],
			queryFn: () => clanService.getSession(id),
			staleTime: 1000 * 30,
		})
	}

	getGrenadeStages(clanId: string) {
		return queryOptions<GrenadeStagesResponse>({
			queryKey: ['clan', clanId, 'grenades', 'stages'],
			queryFn: () => clanService.getGrenadeStages(clanId),
			staleTime: 1000 * 60 * 5,
		})
	}

	getGrenadeAllTime(clanId: string) {
		return queryOptions<GrenadeAllTimeResponse>({
			queryKey: ['clan', clanId, 'grenades', 'all-time'],
			queryFn: () => clanService.getGrenadeAllTime(clanId),
			staleTime: 1000 * 60 * 5,
		})
	}

	getSquads(clanId: string) {
		return queryOptions<ClanSquad[]>({
			queryKey: ['clan', clanId, 'squads'],
			queryFn: () => clanService.getSquads(clanId),
			staleTime: 1000 * 30,
		})
	}

	getStats(clanId: string) {
		return queryOptions<ClanStats>({
			queryKey: ['clan', clanId, 'stats'],
			queryFn: () => clanService.getStats(clanId),
			staleTime: 1000 * 30,
		})
	}

	getAttendanceSummary(
		clanId: string,
		type?: AttendanceFilter,
		from?: string
	) {
		return queryOptions<AttendanceSummary>({
			queryKey: [
				'clan',
				clanId,
				'attendance',
				type ?? 'ALL',
				from ?? 'all',
			],
			queryFn: () => clanService.getAttendanceSummary(clanId, type, from),
			placeholderData: keepPreviousData,
			staleTime: 1000 * 30,
		})
	}

	getAttendanceMonth(clanId: string, month: string) {
		return queryOptions<AttendanceMonth>({
			queryKey: ['clan', clanId, 'attendance', 'month', month],
			queryFn: () => clanService.getAttendanceMonth(month),
			staleTime: 1000 * 30,
		})
	}

	getSettings() {
		return queryOptions<ClanSettings>({
			queryKey: ['clan', 'settings'],
			queryFn: () => clanService.getSettings(),
			staleTime: 1000 * 30,
		})
	}

	getBotGuilds() {
		return queryOptions<BotGuild[]>({
			queryKey: ['clan', 'bot', 'guilds'],
			queryFn: () => clanService.getBotGuilds(),
			staleTime: 1000 * 30,
		})
	}

	getInvites() {
		return queryOptions<ClanInvite[]>({
			queryKey: ['clan', 'invites'],
			queryFn: () => clanService.getInvites(),
			staleTime: 1000 * 30,
		})
	}

	updateSchedule(body: Partial<ClanSchedule>) {
		return queryOptions<ClanInfo>({
			queryKey: ['clan', 'schedule', 'update'],
			queryFn: () => clanService.updateSchedule(body),
		})
	}

	getAbsencesRange(clanId: string, from: string, to: string) {
		return queryOptions<Absence[]>({
			queryKey: ['clan', clanId, 'absences', 'range', from, to],
			queryFn: () => clanService.getAbsencesRange(clanId, from, to),
			staleTime: 1000 * 60,
		})
	}

	getGoldDrops(clanId: string) {
		return queryOptions<GoldDrop[]>({
			queryKey: ['clan', clanId, 'gold'],
			queryFn: () => clanService.getGoldDrops(clanId),
			staleTime: 1000 * 30,
		})
	}

	getAbsences(clanId: string, date: string) {
		return queryOptions<Absence[]>({
			queryKey: ['clan', clanId, 'absences', date],
			queryFn: () => clanService.getAbsences(clanId, date),
			staleTime: 1000 * 30,
		})
	}

	getPublicClans() {
		return queryOptions<PublicClan[]>({
			queryKey: ['clan', 'catalog'],
			queryFn: () => clanService.getPublicClans(),
			staleTime: 1000 * 60,
		})
	}

	getPublicClan(clanId: string) {
		return queryOptions<PublicClan | null>({
			queryKey: ['clan', 'public', clanId],
			queryFn: () => clanService.getPublicClan(clanId),
			staleTime: 1000 * 60,
			retry: false,
		})
	}

	getAllNotes() {
		return queryOptions<ClanMemberNoteWithMember[]>({
			queryKey: ['clan', 'notes'],
			queryFn: () => clanService.getAllNotes(),
			staleTime: 1000 * 30,
		})
	}

	getGrenadeBoxes(clanId: string) {
		return queryOptions<GrenadeBoxesResponse>({
			queryKey: ['clan', clanId, 'grenades', 'boxes'],
			queryFn: () => clanService.getGrenadeBoxes(clanId),
			staleTime: 1000 * 30,
		})
	}

	getGrenadeBoxListing() {
		return queryOptions<ListingItem[]>({
			queryKey: ['clan', 'listing', 'grenade-boxes'],
			queryFn: () => clanService.getGrenadeBoxListing(),
			staleTime: 1000 * 60 * 60,
		})
	}

	getConsumableListing() {
		return queryOptions<ConsumableListingItem[]>({
			queryKey: ['clan', 'listing', 'consumables'],
			queryFn: () => clanService.getConsumableListing(),
			staleTime: 1000 * 60 * 60,
		})
	}

	getBoostOrders() {
		return queryOptions<ClanBoostOrdersResponse>({
			queryKey: ['clan', 'boosts'],
			queryFn: () => clanService.getBoostOrders(),
			staleTime: 1000 * 30,
		})
	}
}

export const clanQueries = new ClanQueries()
