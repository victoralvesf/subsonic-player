import { AudioLines, Maximize2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ISong } from "@/types/responses/song";
import Image from "@/app/components/image";
import { getCoverArtUrl } from "@/api/httpClient";
import FullscreenMode from "@/app/components/fullscreen/page";
import { Button } from "@/app/components/ui/button";
import { SimpleTooltip } from "../ui/simple-tooltip";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes/routesList";
import { useTranslation } from "react-i18next";

export function TrackInfo({ song }: { song: ISong }) {
  const { t } = useTranslation()

  return song ? (
    <>
      <div className="group relative">
        <Image src={getCoverArtUrl(song.coverArt, "140")} width={70} className="rounded shadow-md" />
        <FullscreenMode>
          <Button variant="secondary" size="icon" className="cursor-pointer w-8 h-8 shadow-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity ease-in-out absolute top-1 right-1">
            <SimpleTooltip text={t('fullscreen.switchButton')}>
              <div className="w-full h-full flex items-center justify-center">
                <Maximize2 className="w-4 h-4" />
              </div>
            </SimpleTooltip>
          </Button>
        </FullscreenMode>
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-sm font-medium">{song.title}</span>
        <Link to={ROUTES.ARTIST.PAGE(song.artistId!)} className={cn("w-fit", !song.artistId && "pointer-events-none")}>
          <span
            className={cn("text-xs font-light text-muted-foreground", song.artistId && "hover:underline")}
          >
            {song.artist}
          </span>
        </Link>
      </div>
    </>
  ) : (
    <>
      <div className="w-[70px] h-[70px] flex justify-center items-center bg-muted rounded">
        <AudioLines />
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-sm font-medium">{t('player.noSongPlaying')}</span>
      </div>
    </>
  )
}