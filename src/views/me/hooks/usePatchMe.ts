'use client'

import { useMutation } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { userService } from '@/services/user/user.service'
import type { UpdateUserSettingsDto } from '@/types/user.type'

export function usePatchMe() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (data: UpdateUserSettingsDto) => userService.patchMe(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user'] })
		},
	})
}
