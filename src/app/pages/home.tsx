import { Fragment, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Await, useLoaderData } from 'react-router-dom'

import {
  HeaderFallback,
  PreviewListFallback,
} from '@/app/components/fallbacks/home-fallbacks'
import HomeHeader from '@/app/components/home/header'
import PreviewList from '@/app/components/home/preview-list'
import { ROUTES } from '@/routes/routesList'
import { AlbumsListData } from '@/types/responses/album'
import { ISong } from '@/types/responses/song'

interface HomeLoaderData {
  randomSongsPromise: Promise<ISong[]>
  newestAlbumsPromise: Promise<AlbumsListData>
  frequentAlbumsPromise: Promise<AlbumsListData>
  recentAlbumsPromise: Promise<AlbumsListData>
  randomAlbumsPromise: Promise<AlbumsListData>
}

export default function Home() {
  const {
    randomSongsPromise,
    newestAlbumsPromise,
    frequentAlbumsPromise,
    recentAlbumsPromise,
    randomAlbumsPromise,
  } = useLoaderData() as HomeLoaderData

  const { t } = useTranslation()

  const homeSections = [
    { title: t('home.recentlyPlayed'), promise: recentAlbumsPromise },
    { title: t('home.mostPlayed'), promise: frequentAlbumsPromise },
    { title: t('home.recentlyAdded'), promise: newestAlbumsPromise },
    { title: t('home.explore'), promise: randomAlbumsPromise },
  ]

  return (
    <div className="w-full px-8 py-6">
      <Suspense fallback={<HeaderFallback />}>
        <Await resolve={randomSongsPromise} errorElement={<></>}>
          {(randomSongs: ISong[]) => <HomeHeader songs={randomSongs} />}
        </Await>
      </Suspense>

      {homeSections.map((section) => (
        <Fragment key={section.title}>
          <Suspense fallback={<PreviewListFallback />}>
            <Await resolve={section.promise} errorElement={<></>}>
              {(data: AlbumsListData) => (
                <PreviewList
                  title={section.title}
                  moreRoute={ROUTES.LIBRARY.ALBUMS}
                  list={data.list}
                />
              )}
            </Await>
          </Suspense>
        </Fragment>
      ))}
    </div>
  )
}
