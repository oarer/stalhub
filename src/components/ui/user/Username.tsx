'use client'

import { useQuery } from '@tanstack/react-query'
import { useReducedMotion } from 'motion/react'
import { type CSSProperties, type HTMLAttributes, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { userQueries } from '@/queries/user/user.queries'

export type UsernameRole = { name: string } | string

export const ROLE_USERNAME_CLASS: Record<string, string> = {
	admin: 'text-primary drop-shadow-[0_0_8px_var(--primary)]',
	editor: 'text-emerald-400',
	author: 'text-amber-500',
	media: 'text-fuchsia-400',
}

const ROLE_PRIORITY = ['admin', 'editor', 'author', 'media']

type FxKind = 'embers' | 'sparks' | 'stars' | 'bubbles'

interface RoleFx {
	kind: FxKind
	glow: string
	colors: string[]
	ambientCount: number
}

const ROLE_FX: Record<string, RoleFx> = {
	admin: {
		kind: 'embers',
		glow: 'color-mix(in oklch, var(--primary) 50%, transparent)',
		colors: [
			'var(--primary)',
			'color-mix(in oklch, var(--accent) 50%, transparent)',
			'#9b62f4',
		],
		ambientCount: 12,
	},
	editor: {
		kind: 'sparks',
		glow: 'rgba(52, 211, 153, 0.5)',
		colors: ['#6ee7b7', '#a7f3d0', '#d9f99d'],
		ambientCount: 6,
	},
	author: {
		kind: 'stars',
		glow: 'oklch(75% 0.183 55.934)',
		colors: [
			'oklch(76.9% 0.188 70.08)',
			'oklch(70.5% 0.213 47.604)',
			'oklch(90.1% 0.076 70.697)',
		],
		ambientCount: 6,
	},
	media: {
		kind: 'bubbles',
		glow: 'oklch(74% 0.238 322.16)',
		colors: [
			'oklch(38.1% 0.176 304.987)',
			'oklch(51.8% 0.253 323.949)',
			'oklch(83.3% 0.145 321.434)',
		],
		ambientCount: 5,
	},
}

export interface UsernameBadge {
	id: string | number
	name: string
	color: string
}

/** Палитра из одного цвета бейджа через color-mix. */
function badgePalette(color: string): { colors: string[]; glow: string } {
	return {
		colors: [
			color,
			`color-mix(in oklab, ${color} 55%, white)`,
			`color-mix(in oklab, ${color} 80%, white)`,
		],
		glow: `color-mix(in oklab, ${color} 55%, transparent)`,
	}
}

/**
 * Фолбэк-эффект от бейджа: берётся первый бейдж с цветом.
 * Вид — нейтральные искры, цвета — оттенки цвета бейджа.
 */
function resolveBadgeFx(
	badges?: UsernameBadge[] | null,
): { badge: UsernameBadge; fx: RoleFx } | undefined {
	const badge = badges?.find((b) => Boolean(b.color))
	if (!badge) return undefined
	const palette = badgePalette(badge.color)
	return {
		badge,
		fx: {
			kind: 'stars',
			colors: palette.colors,
			glow: palette.glow,
			ambientCount: 5,
		},
	}
}

const FX_CSS = `
@keyframes stalhub-fx-ember {
	0% { transform: translate3d(0, 6px, 0) scale(0.3); opacity: 0; }
	20% { opacity: 1; }
	60% { opacity: 0.9; }
	100% { transform: translate3d(var(--drift, 4px), -16px, 0) scale(1); opacity: 0; }
}
@keyframes stalhub-fx-rise {
	0% { transform: translate3d(0, 6px, 0) rotate(45deg); opacity: 0; }
	25% { opacity: 1; }
	100% { transform: translate3d(var(--drift, 3px), -18px, 0) rotate(45deg); opacity: 0; }
}
@keyframes stalhub-fx-twinkle {
	0%, 100% { opacity: 0; }
	35% { opacity: 1; }
	65% { opacity: 1; }
}
@keyframes stalhub-fx-bubble {
	0% { transform: translate3d(0, 5px, 0); opacity: 0; }
	20% { opacity: 0.9; }
	100% { transform: translate3d(var(--drift, -4px), -20px, 0); opacity: 0; }
}
.username-fx .stalhub-text {
	transition: filter 0.3s ease;
}
.username-fx:hover .stalhub-text {
	filter: brightness(1.18);
}
.username-fx .stalhub-scatter {
	opacity: 0;
	transition: opacity 0.35s ease;
}
.username-fx:hover .stalhub-scatter {
	opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
	.username-fx .stalhub-fx-anim { animation: none !important; }
	.username-fx .stalhub-ambient,
	.username-fx .stalhub-scatter { display: none; }
}
`

let fxStylesInjected = false

function ensureFxStyles() {
	if (typeof document === 'undefined' || fxStylesInjected) return
	if (document.getElementById('stalhub-username-fx')) {
		fxStylesInjected = true
		return
	}
	const el = document.createElement('style')
	el.id = 'stalhub-username-fx'
	el.textContent = FX_CSS
	document.head.appendChild(el)
	fxStylesInjected = true
}

function normalizeRole(role: UsernameRole): string {
	return (typeof role === 'string' ? role : role.name).toLowerCase()
}

function resolveRole(roles?: UsernameRole[] | null): string | undefined {
	if (!roles || roles.length === 0) return undefined
	const names = new Set(roles.map(normalizeRole))
	for (const key of ROLE_PRIORITY) {
		if (names.has(key)) return key
	}
	return undefined
}

export function getRoleUsernameClass(
	roles?: UsernameRole[] | null
): string | undefined {
	const role = resolveRole(roles)
	return role ? ROLE_USERNAME_CLASS[role] : undefined
}

function pseudo(i: number, salt: number, mod: number): number {
	return (i * 37 + salt * 13 + i * i * 7) % mod
}

const KIND_ANIMATION: Record<FxKind, string> = {
	embers: 'stalhub-fx-ember',
	sparks: 'stalhub-fx-rise',
	stars: 'stalhub-fx-twinkle',
	bubbles: 'stalhub-fx-bubble',
}

const STAR_SLOTS = [
	{ left: 4, bottom: 108 },
	{ left: 46, bottom: 124 },
	{ left: 86, bottom: 106 },
	{ left: -5, bottom: 42 },
	{ left: 98, bottom: 36 },
	{ left: 22, bottom: -32 },
	{ left: 68, bottom: -28 },
	{ left: 78, bottom: 64 },
]

function AmbientParticle({
	fx,
	role,
	index,
	scatter = false,
}: {
	fx: RoleFx
	role: string
	index: number
	scatter?: boolean
}) {
	const salt = role.length + index * (scatter ? 11 : 1)
	const color = fx.colors[index % fx.colors.length]
	const duration =
		fx.kind === 'sparks'
			? 1.2 + pseudo(index, salt, 7) / 10
			: fx.kind === 'stars'
				? 1.8 + pseudo(index, salt, 13) / 10
				: fx.kind === 'bubbles'
					? 2.4 + pseudo(index, salt, 11) / 10
					: 1.6 + pseudo(index, salt, 11) / 10
	const delay = pseudo(index, salt + 5, 22) / 10
	const base: CSSProperties = {
		position: 'absolute',
		bottom: scatter ? `${pseudo(index, salt + 7, 170) - 40}%` : '-2px',
		left: `${pseudo(index, salt, 100)}%`,
		opacity: 0,
		animation: `${KIND_ANIMATION[fx.kind]} ${duration}s linear ${delay}s infinite`,
		['--drift' as string]: `${pseudo(index, salt + 1, 13) - 6}px`,
	}

	if (fx.kind === 'stars') {
		const slot = STAR_SLOTS[(index + (scatter ? 4 : 0)) % STAR_SLOTS.length]
		const size = 6 + pseudo(index, salt + 2, 7)
		return (
			<span
				style={{
					position: 'absolute',
					left: `${slot.left}%`,
					bottom: `${slot.bottom}%`,
					width: size,
					height: size,
					color,
					opacity: 0,
					animation: `stalhub-fx-twinkle ${2.8 + pseudo(index, salt, 14) / 10}s ease-in-out ${pseudo(index, salt + 5, 32) / 10}s infinite`,
					filter: `drop-shadow(0 0 4px ${color})`,
				}}
			>
				<svg
					aria-hidden
					fill="currentColor"
					height="100%"
					viewBox="0 0 24 24"
					width="100%"
				>
					<path d="M12 1c.8 6.6 4.4 10.2 11 11-6.6.8-10.2 4.4-11 11-.8-6.6-4.4-10.2-11-11 6.6-.8 10.2-4.4 11-11Z" />
				</svg>
			</span>
		)
	}

	if (fx.kind === 'bubbles') {
		const size = 3 + pseudo(index, salt + 2, 4)
		return (
			<span
				style={{
					...base,
					width: size,
					height: size,
					borderRadius: 9999,
					border: `1px solid ${color}`,
					background: `${color}33`,
					boxShadow: `0 0 5px ${color}66`,
				}}
			/>
		)
	}

	if (fx.kind === 'sparks') {
		const size = 3 + pseudo(index, salt + 2, 2)
		return (
			<span
				style={{
					...base,
					width: size,
					height: size,
					background: color,
					boxShadow: `0 0 6px 1px ${color}`,
					borderRadius: 1,
				}}
			/>
		)
	}

	const size = 2 + pseudo(index, salt + 2, 3)
	return (
		<span
			style={{
				...base,
				width: size,
				height: size,
				borderRadius: 9999,
				background: color,
				boxShadow: `0 0 7px 2px ${color}`,
				filter: 'blur(0.6px)',
			}}
		/>
	)
}

function HoverScatter({
	fx,
	role,
	radius,
}: {
	fx: RoleFx
	role: string
	/** Насколько далеко за границы ника разлетается россыпь (px). */
	radius: number
}) {
	return (
		<span
			aria-hidden
			className="stalhub-scatter pointer-events-none absolute overflow-visible"
			style={{
				left: -radius,
				right: -radius,
				top: -radius,
				bottom: -radius,
			}}
		>
			{Array.from({ length: fx.ambientCount }).map((_, i) => (
				<AmbientParticle
					fx={fx}
					index={i}
					key={i}
					role={role}
					scatter
				/>
			))}
		</span>
	)
}

interface UsernameUser {
	username: string
	name?: string | null
	roles?: UsernameRole[] | null
	badges?: UsernameBadge[] | null
	color?: string | null
}

interface UsernameProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
	user?: UsernameUser | null
	username?: string
	name?: string | null
	roles?: UsernameRole[] | null
	badges?: UsernameBadge[] | null
	color?: string | null
	disableEffects?: boolean
	/**
	 * Выключить вообще всё: ни цветов ролей, ни партиклов —
	 * просто голый текст. Приоритетнее всех остальных настроек.
	 */
	plain?: boolean
	/**
	 * Радиус ховер-россыпи в px — насколько далеко за границы
	 * ника разлетаются партиклы. По умолчанию 16.
	 */
	scatterRadius?: number
	/**
	 * Подтянуть бейджи с бэка (закешированный getUserByUsername),
	 * если в переданных данных их нет. Роли бэк для чужих юзеров
	 * не отдаёт, так что дистанционно находятся только бейджи.
	 * По умолчанию выключено, чтобы не стрелять запросами из списков.
	 */
	withRemoteBadges?: boolean
}

export default function Username({
	user,
	username,
	name,
	roles,
	badges,
	color,
	className,
	style,
	children,
	disableEffects = false,
	scatterRadius = 16,
	plain = false,
	withRemoteBadges = false,
	...props
}: UsernameProps) {
	const display =
		children ?? name ?? user?.name ?? username ?? user?.username ?? null
	const resolvedRoles = roles ?? user?.roles
	const localBadges = badges ?? user?.badges
	const resolvedColor = color ?? user?.color
	const role = resolveRole(resolvedRoles)

	// Дистанционный поиск бейджей — только если поле вообще отсутствует
	// (новый бэк всегда возвращает массив, пусть и пустой).
	const lookupUsername = username ?? user?.username ?? null
	const needRemote =
		withRemoteBadges &&
		!plain &&
		!disableEffects &&
		!resolvedColor &&
		!role &&
		localBadges == null &&
		Boolean(lookupUsername)
	const { data: remoteUser } = useQuery({
		...userQueries.getUserByUsername(lookupUsername ?? ''),
		enabled: needRemote,
		staleTime: 5 * 60 * 1000,
		refetchInterval: false,
		retry: false,
	})
	const resolvedBadges = localBadges ?? remoteUser?.badges
	// Роль первая; если её нет — фолбэк на эффект от бейджа.
	const badgeFx = role ? undefined : resolveBadgeFx(resolvedBadges)
	const fx = (role ? ROLE_FX[role] : undefined) ?? badgeFx?.fx
	// Ключ для детерминированных позиций частиц (роль или бейдж).
	const fxKey = role ?? (badgeFx ? `badge:${badgeFx.badge.id}` : undefined)
	const reduceMotion = useReducedMotion()

	useEffect(ensureFxStyles, [])

	// plain выключает вообще всё: ни цветов ролей, ни эффектов.
	if (plain) {
		return (
			<span {...props} className={className} style={style}>
				{display}
			</span>
		)
	}

	// Кастомный цвет важнее ролевых эффектов — оставляем просто текст.
	if (disableEffects || reduceMotion || !fx || !fxKey || resolvedColor) {
		return (
			<span
				{...props}
				className={cn(getRoleUsernameClass(resolvedRoles), className)}
				style={
					resolvedColor ? { ...style, color: resolvedColor } : style
				}
			>
				{display}
			</span>
		)
	}

	return (
		<span
			{...props}
			className={cn(
				'username-fx relative inline-block font-medium',
				className
			)}
			style={style}
		>
			{/* сам ник: цвет роли, либо цвет бейджа при фолбэке */}
			<span
				className={cn(
					'stalhub-text relative z-10',
					role && ROLE_USERNAME_CLASS[role]
				)}
				style={{
					...(badgeFx && !role ? { color: badgeFx.badge.color } : null),
					filter: `drop-shadow(0 0 8px ${fx.glow})`,
				}}
			>
				{display}
			</span>

			{/* постоянные партиклы в стиле роли/бейджа */}
			<span
				aria-hidden
				className="stalhub-ambient pointer-events-none absolute -inset-x-2 inset-y-0 overflow-visible"
			>
				{Array.from({ length: fx.ambientCount }).map((_, i) => (
					<AmbientParticle fx={fx} index={i} key={i} role={fxKey} />
				))}
			</span>

			<HoverScatter fx={fx} radius={scatterRadius} role={fxKey} />
		</span>
	)
}
