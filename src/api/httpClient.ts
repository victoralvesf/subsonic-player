import { FetchOptions, fetch as tauriFetch } from '@tauri-apps/api/http'
import omit from 'lodash/omit'
import { useAppStore } from '@/store/app.store'
import { SubsonicJsonResponse } from '@/types/responses/subsonicResponse'
import { appName } from '@/utils/appName'
import { saltWord } from '@/utils/salt'
import { isTauri } from '@/utils/tauriTools'

function queryParams() {
  const { username, password } = useAppStore.getState().data

  return {
    u: username ?? '',
    t: password ?? '',
    s: saltWord,
    v: '1.16.0',
    c: appName,
    f: 'json',
  }
}

function getUrl(path: string, options?: Record<string, string>) {
  const serverUrl = useAppStore.getState().data.url
  const params = new URLSearchParams(queryParams())

  if (options) {
    Object.keys(options).forEach((key) => {
      params.append(key, options[key])
    })
  }

  const queries = params.toString()
  const pathWithoutSlash = path.startsWith('/') ? path.substring(1) : path
  let url = `${serverUrl}/rest/${pathWithoutSlash}`
  url += path.includes('?') ? '&' : '?'
  url += queries

  return url
}

async function browserFetch<T>(
  url: string,
  options: RequestInit,
): Promise<{ count: number; data: T } | undefined> {
  try {
    const response = await fetch(url, options)

    if (response.ok) {
      const data = await response.json()
      return {
        count: parseInt(response.headers.get('x-total-count') || '0', 10),
        data: data['subsonic-response'] as T,
      }
    }
  } catch (error) {
    console.error('Error on browserFetch request', error)
    return undefined
  }
}

async function rustFetch<T>(
  url: string,
  options: FetchOptions,
): Promise<{ count: number; data: T } | undefined> {
  try {
    const response = await tauriFetch(url, {
      ...options,
      query: {
        ...options.query,
        ...queryParams(),
      },
      body: options.body || undefined,
    })

    if (response.ok) {
      const data = response.data as SubsonicJsonResponse

      return {
        count: parseInt(response.headers['x-total-count'] || '0', 10),
        data: data['subsonic-response'] as T,
      }
    }
  } catch (error) {
    console.error('Error on tauriFetch request', error)
    return undefined
  }
}

export async function httpClient<T>(
  path: string,
  options: FetchOptions,
): Promise<{ count: number; data: T } | undefined> {
  try {
    const url = getUrl(path, options.query)

    if (isTauri()) {
      const tauriOptions = omit(options, 'query')
      return await rustFetch(url, { ...tauriOptions })
    } else {
      return await browserFetch<T>(url, {
        method: options.method,
        headers: options.headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      })
    }
  } catch (error) {
    console.error('Error on httpClient request', error)
    return undefined
  }
}

export function getCoverArtUrl(id: string, size = '300') {
  return getUrl('getCoverArt', {
    id,
    size,
  })
}

export function getSongStreamUrl(id: string, maxBitRate = '0', format = 'raw') {
  return getUrl('stream', {
    id,
    maxBitRate,
    format,
    estimateContentLength: 'true',
  })
}

export function getDownloadUrl(id: string, maxBitRate = '0', format = 'raw') {
  return getUrl('download', {
    id,
    maxBitRate,
    format,
  })
}
