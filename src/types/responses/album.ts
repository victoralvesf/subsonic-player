import { IReplayGain, ISong } from './song'
import { SubsonicResponse } from './subsonicResponse'

export interface Genre {
  name: string
}

export interface DiscTitle {
  disc: number
}

export interface OriginalReleaseDate {}

export interface Albums {
  id: string
  parent: string
  isDir: boolean
  title: string
  name: string
  album: string
  artist: string
  year: number
  genre?: string
  coverArt: string
  duration: number
  playCount?: number
  created: string
  starred?: string
  artistId: string
  songCount: number
  isVideo: boolean
  played?: string
  bpm: number
  comment: string
  sortName: string
  mediaType: string
  musicBrainzId: string
  genres: Genre[]
  replayGain: IReplayGain
}

export interface SingleAlbum {
  id: string
  name: string
  artist: string
  artistId: string
  coverArt: string
  songCount: number
  duration: number
  playCount?: number
  created: string
  starred?: string
  year: number
  genre: string
  played?: string
  userRating: number
  genres: Genre[]
  musicBrainzId: string
  isCompilation: boolean
  sortName: string
  discTitles: DiscTitle[]
  originalReleaseDate: OriginalReleaseDate
  song: ISong[]
}

export interface AlbumList {
  album: Albums[]
}

export interface AlbumListResponse
  extends SubsonicResponse<{ albumList: AlbumList }> {}

export interface GetAlbumResponse
  extends SubsonicResponse<{ album: SingleAlbum }> {}

export interface IArtistAlbum extends Albums {
  starred?: string
}

export interface IAlbumInfo {
  notes?: string
  lastFmUrl?: string
  smallImageUrl?: string
  mediumImageUrl?: string
  largeImageUrl?: string
}

export interface AlbumInfoResponse
  extends SubsonicResponse<{ albumInfo: IAlbumInfo }> {}

export type AlbumListType =
  | 'random'
  | 'newest'
  | 'highest'
  | 'frequent'
  | 'recent'
  | 'byGenre'
  | 'alphabeticalByName'
  | 'alphabeticalByArtist'
  | 'starred'
  | 'byYear'

export interface AlbumsListData {
  albumsCount: number
  list: Albums[]
}
