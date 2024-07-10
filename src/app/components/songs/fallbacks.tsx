import { ShadowHeaderFallback } from '@/app/components/album/shadow-header'
import ListWrapper from '@/app/components/list-wrapper'
import { TableFallback } from '@/app/components/table/fallbacks'
import { Skeleton } from '@/app/components/ui/skeleton'

export function SongsListFallback() {
  return (
    <div className="w-full h-full">
      <ShadowHeaderFallback />

      <ListWrapper>
        <div className="max-w-xs h-10 mb-4 mt-6 bg-background border rounded flex items-center px-3">
          <Skeleton className="w-16 h-4" />
        </div>

        <TableFallback />
      </ListWrapper>
    </div>
  )
}
