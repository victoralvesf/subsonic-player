import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { useAppStore } from '@/store/app.store'
import { HttpOptions } from '@/types/http/clientOptions'
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
  const sanitizedPath = path.startsWith('/') ? path.substring(1) : path
  let url = `${serverUrl}/rest/${sanitizedPath}`
  url += path.includes('?') ? `&${queries}` : `?${queries}`

  return url
}

export async function httpClient<T>(
  path: string,
  options: HttpOptions,
): Promise<{ count: number; data: T } | undefined> {
  try {
    const fullUrl = getUrl(path, options.query)

    let response: Response | null = null

    const requestOptions = {
      method: options.method,
      headers: options.headers,
      body: options.body,
    }

    if (isTauri()) {
      response = await tauriFetch(fullUrl, requestOptions)
    } else {
      response = await fetch(fullUrl, requestOptions)
    }

    if (response.ok) {
      const data = (await response.json()) as SubsonicJsonResponse
      return {
        count: parseInt(response.headers.get('x-total-count') || '0', 10),
        data: data['subsonic-response'] as T,
      }
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
