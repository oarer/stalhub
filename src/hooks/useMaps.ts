'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import type { MapConfig } from '@/types/map.type'

const fetchMaps = async (): Promise<MapConfig[]> => {
	// TODO Change url
	// TODO Move and rename maps.json to cdn
	const { data } = await axios.get('/maps.json')
	return data.maps
}

export const useMaps = () => {
	const { data, isLoading, error } = useQuery({
		queryKey: ['maps'],
		queryFn: fetchMaps,
		staleTime: 1000 * 60 * 5,
	})

	return {
		maps: data ?? [],
		loading: isLoading,
		error: error || null,
	}
}
