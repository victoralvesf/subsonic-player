import { invoke } from '@tauri-apps/api/core'
import { once } from '@tauri-apps/api/event'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { isTauri } from '@/utils/tauriTools'

export function useDownload() {
  const { t } = useTranslation()

  const started = useCallback(() => {
    toast(t('downloads.started'), {
      autoClose: false,
      type: 'default',
      isLoading: true,
      toastId: 'download',
    })
  }, [t])

  const completed = useCallback(() => {
    toast.update('download', {
      render: t('downloads.completed'),
      type: 'success',
      autoClose: 5000,
      isLoading: false,
    })
  }, [t])

  const failed = useCallback(() => {
    toast.update('download', {
      render: t('downloads.failed'),
      type: 'error',
      autoClose: 5000,
      isLoading: false,
    })
  }, [t])

  useEffect(() => {
    const setupListeners = async () => {
      if (isTauri()) {
        await once('DOWNLOAD_FINISHED', () => {
          completed()
        })
      }
    }

    setupListeners()
  }, [completed])

  function downloadBrowser(url: string) {
    window.location.href = url
    toast.success(t('downloads.started'))
  }

  async function downloadTauri(url: string, id: string) {
    try {
      started()

      await invoke('download_file', { url, fileId: id })
    } catch (_) {
      failed()
    }
  }

  return {
    downloadBrowser,
    downloadTauri,
  }
}
