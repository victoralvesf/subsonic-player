import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { SubsonicJsonResponse } from '@/types/responses/subsonicResponse'
import { appName } from '@/utils/appName'
import { saltWord } from '@/utils/salt'
import { isTauri } from '@/utils/tauriTools'

export async function pingServer(url: string, user: string, token: string) {
  try {
    const query = {
      u: user,
      t: token,
      s: saltWord,
      v: '1.16.0',
      c: appName,
      f: 'json',
    }

    const queries = new URLSearchParams(query).toString()
    let response: Response | null = null

    if (isTauri()) {
      response = await tauriFetch(`${url}/rest/ping.view?${queries}`, {
        method: 'GET',
      })
    } else {
      response = await fetch(`${url}/rest/ping.view?${queries}`, {
        method: 'GET',
      })
    }

    const data = (await response.json()) as SubsonicJsonResponse

    return data['subsonic-response'].status === 'ok'
  } catch (_) {
    return false
  }
}
