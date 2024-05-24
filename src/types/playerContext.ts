import { ISong } from "./responses/song";

export interface IPlayerContext {
  shuffledSongList: ISong[]
  currentSongList: ISong[]
  currentSongIndex: number
  originalSongIndex: number
  isPlaying: boolean
  isLoopActive: boolean
  isShuffleActive: boolean
  isPlayingOneSong: boolean
  playSong: (song: ISong) => void
  setPlayingState: (state: boolean) => void
  setSongList: (songlist: ISong[], index: number, shuffle?: boolean) => void
  togglePlayPause: () => void
  toggleLoop: () => void
  toggleShuffle: () => void
  checkActiveSong: (id: string) => boolean
  playNextSong: () => void
  playPrevSong: () => void
  clearPlayerState: () => void
  hasNextSong: boolean
  hasPrevSong: boolean
}