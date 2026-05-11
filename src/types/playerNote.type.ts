import type { VariantProps } from 'class-variance-authority'
import type { badgeVariants } from '@/components/ui/Badge'
import { Role } from './player.type'

export type RoleMeta = {
	title: string
	variant: VariantProps<typeof badgeVariants>['variant']
	icon: string
}

export const ROLE_META: Record<Role, RoleMeta> = {
	[Role.EXBO]: {
		title: 'player.note.exbo',
		variant: 'exbo',
		icon: 'lucide:shield-check',
	},
	[Role.SCAMMER]: {
		title: 'player.note.scammer',
		variant: 'danger',
		icon: 'lucide:ban',
	},
	[Role.MEDIA]: {
		title: 'player.note.media',
		variant: 'media',
		icon: 'lucide:radio',
	},
	[Role.STALHUB]: {
		title: 'player.note.stalhub',
		variant: 'stalhub',
		icon: 'lucide:shield-half',
	},
}
