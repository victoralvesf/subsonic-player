import { ReactNode, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getCoverArtUrl } from '@/api/httpClient'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from '@/app/components/ui/drawer'

import { usePlayer } from '@/app/contexts/player-context'

import { subsonic } from '@/service/subsonic'
import FullscreenBackdrop from './backdrop'
import { CloseFullscreenButton, SwitchThemeButton } from './buttons'
import { FullscreenPlayer } from './player'
import { FullscreenTabs } from './tabs'

interface FullscreenModeProps {
  children: ReactNode
}

export default function FullscreenMode({ children }: FullscreenModeProps) {
  const { t } = useTranslation()

  const noLyricsFound = t('fullscreen.noLyrics')

  const [currentLyrics, setCurrentLyrics] = useState(noLyricsFound)
  const { currentSongList, currentSongIndex } = usePlayer()

  const song = currentSongList[currentSongIndex]

  const getLyrics = useCallback(async () => {
    const response = await subsonic.songs.getLyrics(song.artist, song.title)

    if (response) {
      setCurrentLyrics(response.value || noLyricsFound)
    }
  }, [song, noLyricsFound])

  useEffect(() => {
    if (song) getLyrics()
  }, [song, getLyrics])

  if (!song) return <></>

  const songCoverArtUrl = getCoverArtUrl(song.coverArt, '1000')

  return (
    <Drawer
      fixed
      dismissible={false}
      handleOnly={true}
      disablePreventScroll={true}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        className="h-screen w-screen rounded-t-none border-none select-none cursor-default"
        showHandle={false}
      >
        <FullscreenBackdrop imageUrl={songCoverArtUrl}>
          <div className="flex flex-col p-8 w-screen h-screen gap-4">
            {/* First Row */}
            <div className="flex justify-between items-center w-full h-[40px]">
              <DrawerClose>
                <CloseFullscreenButton />
              </DrawerClose>

              <SwitchThemeButton />
            </div>

            {/* Second Row */}
            <div className="w-full max-h-[calc(100%-220px)] min-h-[calc(100%-220px)] px-16">
              <div className="min-h-[300px] h-full max-h-full">
                <FullscreenTabs lyrics={currentLyrics} />
              </div>
            </div>

            {/* Third Row */}
            <div className="h-[150px] min-h-[150px] px-16 py-2">
              <div className="flex items-center">
                <FullscreenPlayer />
              </div>
            </div>
          </div>
        </FullscreenBackdrop>
      </DrawerContent>
    </Drawer>
  )
}
