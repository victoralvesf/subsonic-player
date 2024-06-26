import { clsx } from 'clsx'
import {
  Heart,
  ListVideo,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume,
  Volume1,
  Volume2,
} from 'lucide-react'
import { useEffect, useRef, useCallback, memo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { getSongStreamUrl } from '@/api/httpClient'
import { RadioInfo } from '@/app/components/player/radio-info'
import { TrackInfo } from '@/app/components/player/track-info'
import { Button } from '@/app/components/ui/button'
import { Slider } from '@/app/components/ui/slider'
import { usePlayer } from '@/app/contexts/player-context'
import { convertSecondsToTime } from '@/utils/convertSecondsToTime'

let isSeeking = false

const MemoizedTrackInfo = memo(TrackInfo)
const MemoizedRadioInfo = memo(RadioInfo)

export function Player() {
  const player = usePlayer()
  const audioRef = useRef<HTMLAudioElement>(null)

  const song = player.currentSongList[player.currentSongIndex]
  const radio = player.radioList[player.currentSongIndex]

  useHotkeys(
    'space',
    () => {
      if (player.currentSongList.length > 0) {
        player.togglePlayPause()
      }
    },
    { preventDefault: true },
  )

  useEffect(() => {
    if (player.mediaType !== 'song' && !song) return

    if (player.audioPlayerRef === null) player.setAudioPlayerRef(audioRef)
  }, [audioRef, player, song])

  useEffect(() => {
    if (!audioRef.current) return

    if (player.mediaType === 'radio') {
      if (player.isPlaying) {
        audioRef.current.src = ''
        audioRef.current.src = radio.streamUrl
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }

    if (player.mediaType === 'song') {
      player.isPlaying ? audioRef.current.play() : audioRef.current.pause()
    }
  }, [player.isPlaying, player.mediaType, radio])

  useEffect(() => {
    if (!audioRef.current) return

    audioRef.current.volume = player.volume / 100
  }, [player.volume])

  const setupProgressListener = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    const audioDuration = Math.floor(audio.duration)

    if (player.currentDuration !== audioDuration) {
      player.setCurrentDuration(audioDuration)
    }

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        player.setProgress(Math.floor(audio.currentTime))
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [player])

  const handleSongEnded = useCallback(() => {
    if (player.hasNextSong) {
      player.playNextSong()
      audioRef.current?.play()
    } else {
      player.clearPlayerState()
    }
  }, [player])

  const handleStartedSeeking = useCallback(() => {
    isSeeking = true
  }, [])

  const handleSeeking = useCallback(
    (amount: number) => {
      isSeeking = true
      player.setProgress(amount)
    },
    [player],
  )

  const handleSeeked = useCallback(
    (amount: number) => {
      isSeeking = false
      if (audioRef.current) {
        audioRef.current.currentTime = amount
        player.setProgress(amount)
      }
    },
    [player],
  )

  return (
    <div className="border-t h-[100px] w-full flex items-center">
      <div className="w-full h-full grid grid-cols-player gap-2 px-4">
        {/* Track Info */}
        <div className="flex items-center gap-2">
          {player.mediaType === 'song' && <MemoizedTrackInfo song={song} />}
          {player.mediaType === 'radio' && <MemoizedRadioInfo radio={radio} />}
        </div>
        {/* Main Controls */}
        <div className="col-span-2 flex flex-col justify-center items-center px-4 gap-1">
          <div className="flex w-full gap-1 justify-center items-center mb-1">
            {player.mediaType === 'song' && (
              <Button
                variant="ghost"
                className={clsx(
                  'relative rounded-full w-10 h-10 p-3',
                  player.isShuffleActive && 'player-button-active',
                )}
                disabled={!song || player.isPlayingOneSong}
                onClick={player.toggleShuffle}
              >
                <Shuffle
                  className={clsx(
                    'w-10 h-10',
                    player.isShuffleActive && 'text-primary',
                  )}
                />
              </Button>
            )}

            <Button
              variant="ghost"
              className="rounded-full w-10 h-10 p-3"
              disabled={(!song && !radio) || !player.hasPrevSong}
              onClick={player.playPrevSong}
            >
              <SkipBack className="w-10 h-10 fill-secondary-foreground" />
            </Button>

            <Button
              className="rounded-full w-10 h-10 p-3"
              disabled={!song && !radio}
              onClick={player.togglePlayPause}
            >
              {player.isPlaying ? (
                <Pause className="w-10 h-10 fill-slate-50 text-slate-50" />
              ) : (
                <Play className="w-10 h-10 fill-slate-50 text-slate-50" />
              )}
            </Button>

            <Button
              variant="ghost"
              className="rounded-full w-10 h-10 p-3"
              disabled={(!song && !radio) || !player.hasNextSong}
              onClick={player.playNextSong}
            >
              <SkipForward className="w-10 h-10 fill-secondary-foreground" />
            </Button>

            {player.mediaType === 'song' && (
              <Button
                variant="ghost"
                className={clsx(
                  'relative rounded-full w-10 h-10 p-3',
                  player.isLoopActive && 'player-button-active',
                )}
                disabled={!song}
                onClick={player.toggleLoop}
              >
                <Repeat
                  className={clsx(
                    'w-10 h-10',
                    player.isLoopActive && 'text-primary',
                  )}
                />
              </Button>
            )}
          </div>

          {player.mediaType === 'song' && (
            <div className="flex w-full gap-2 justify-center items-center">
              <small className="text-xs text-muted-foreground w-10 text-center">
                {convertSecondsToTime(player.progress)}
              </small>
              {song ? (
                <Slider
                  defaultValue={[0]}
                  value={[player.progress]}
                  max={player.currentDuration}
                  step={1}
                  className="cursor-pointer w-[32rem]"
                  thumbMouseDown={() => handleStartedSeeking()}
                  onValueChange={([value]) => handleSeeking(value)}
                  onValueCommit={([value]) => handleSeeked(value)}
                />
              ) : (
                <Slider
                  defaultValue={[0]}
                  max={100}
                  step={1}
                  showThumb={false}
                  className="cursor-pointer w-[32rem] pointer-events-none"
                />
              )}
              <small className="text-xs text-muted-foreground w-10 text-center">
                {convertSecondsToTime(player.currentDuration ?? 0)}
              </small>
            </div>
          )}
        </div>
        {/* Remain Controls and Volume */}
        <div className="flex items-center w-full justify-end">
          <div className="flex items-center gap-1">
            {player.mediaType === 'song' && (
              <Button
                variant="ghost"
                className="rounded-full w-10 h-10 p-3"
                disabled={!song}
                onClick={player.starCurrentSong}
              >
                <Heart
                  className={clsx(
                    'w-5 h-5',
                    player.isSongStarred && 'text-red-500 fill-red-500',
                  )}
                />
              </Button>
            )}

            {player.mediaType === 'song' && (
              <Button
                variant="ghost"
                className="rounded-full w-10 h-10 p-2"
                disabled={!song}
              >
                <ListVideo className="w-4 h-4" />
              </Button>
            )}

            <div className="flex gap-2 ml-2">
              <div className={clsx(!song && !radio && 'opacity-50')}>
                {player.volume >= 50 && <Volume2 className="w-4 h-4" />}
                {player.volume > 0 && player.volume < 50 && (
                  <Volume1 className="w-4 h-4" />
                )}
                {player.volume === 0 && <Volume className="w-4 h-4" />}
              </div>
              <Slider
                defaultValue={[100]}
                value={[player.volume]}
                max={100}
                step={1}
                disabled={!song && !radio}
                className={clsx(
                  'cursor-pointer',
                  'w-[8rem]',
                  !song && !radio && 'pointer-events-none opacity-50',
                )}
                onValueChange={([value]) => player.setVolume(value)}
              />
            </div>
          </div>
        </div>
      </div>

      {player.mediaType === 'song' && song && (
        <audio
          src={getSongStreamUrl(song.id)}
          autoPlay={true}
          ref={audioRef}
          loop={player.isLoopActive}
          onPlay={() => player.setPlayingState(true)}
          onPause={() => player.setPlayingState(false)}
          onLoadedMetadata={setupProgressListener}
          onEnded={handleSongEnded}
        />
      )}

      {player.mediaType === 'radio' && radio && (
        <audio
          src={radio.streamUrl}
          autoPlay={true}
          ref={audioRef}
          onPlay={() => player.setPlayingState(true)}
          onPause={() => player.setPlayingState(false)}
        />
      )}
    </div>
  )
}
