'use server'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from './cache'

export async function invalidateProjectsCache() {
  revalidateTag(CACHE_TAGS.projects)
}

export async function invalidateCRMCache() {
  revalidateTag(CACHE_TAGS.crm)
}

export async function invalidateTeamCache() {
  revalidateTag(CACHE_TAGS.team)
}
