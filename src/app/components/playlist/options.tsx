import { getDownloadUrl } from '@/api/httpClient'
import { OptionsButtons } from '@/app/components/options/buttons'
import {
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu'
import { useDownload } from '@/app/hooks/use-download'
import { subsonic } from '@/service/subsonic'
import { usePlayerActions } from '@/store/player.store'
import { usePlaylists } from '@/store/playlists.store'
import { Playlist, PlaylistWithEntries } from '@/types/responses/playlist'
import { ISong } from '@/types/responses/song'
import { isTauri } from '@/utils/tauriTools'

interface PlaylistOptionsProps {
  playlist: PlaylistWithEntries | Playlist
  onRemovePlaylist: () => void
  disablePlayNext?: boolean
  disableAddLast?: boolean
  disableDownload?: boolean
  disableEdit?: boolean
  disableDelete?: boolean
}

export function PlaylistOptions({
  playlist,
  onRemovePlaylist,
  disablePlayNext = false,
  disableAddLast = false,
  disableDownload = false,
  disableEdit = false,
  disableDelete = false,
}: PlaylistOptionsProps) {
  const { setPlaylistDialogState, setData } = usePlaylists()
  const { setNextOnQueue, setLastOnQueue } = usePlayerActions()
  const { downloadBrowser, downloadTauri } = useDownload()

  function handleEdit() {
    setData({
      id: playlist.id,
      name: playlist.name,
      comment: playlist.comment,
      public: playlist.public,
    })
    setPlaylistDialogState(true)
  }

  async function getSongsToQueue(callback: (songs: ISong[]) => void) {
    const playlistWithEntries = await subsonic.playlists.getOne(playlist.id)
    if (!playlistWithEntries) return

    callback(playlistWithEntries.entry)
  }

  async function handlePlayNext() {
    if ('entry' in playlist) {
      setNextOnQueue(playlist.entry)
    } else {
      await getSongsToQueue((songs) => setNextOnQueue(songs))
    }
  }

  async function handlePlayLast() {
    if ('entry' in playlist) {
      setLastOnQueue(playlist.entry)
    } else {
      await getSongsToQueue((songs) => setLastOnQueue(songs))
    }
  }

  async function handleDownload() {
    const url = getDownloadUrl(playlist.id)
    if (isTauri()) {
      downloadTauri(url, playlist.id)
    } else {
      downloadBrowser(url)
    }
  }

  return (
    <>
      <DropdownMenuGroup>
        <OptionsButtons.PlayNext
          disabled={disablePlayNext}
          onClick={() => handlePlayNext()}
        />
        <OptionsButtons.PlayLast
          disabled={disableAddLast}
          onClick={() => handlePlayLast()}
        />
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <OptionsButtons.Download
          disabled={disableDownload}
          onClick={() => handleDownload()}
        />
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <OptionsButtons.EditPlaylist
          onClick={() => handleEdit()}
          disabled={disableEdit}
        />
        <OptionsButtons.RemovePlaylist
          onClick={() => onRemovePlaylist()}
          disabled={disableDelete}
        />
      </DropdownMenuGroup>
    </>
  )
}
