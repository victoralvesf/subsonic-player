import { PlusIcon } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ShadowHeader } from '@/app/components/album/shadow-header'
import { HeaderTitle } from '@/app/components/header-title'
import ListWrapper from '@/app/components/list-wrapper'
import { RadioFormDialog } from '@/app/components/radios/form-dialog'
import { RemoveRadioDialog } from '@/app/components/radios/remove-dialog'
import { Button } from '@/app/components/ui/button'
import { DataTable } from '@/app/components/ui/data-table'
import { radiosColumns } from '@/app/tables/radios-columns'
import { usePlayerActions } from '@/store/player.store'
import { useRadios } from '@/store/radios.store'
import { Radio } from '@/types/responses/radios'

export default function Radios() {
  const { radios, setDialogState, setData, fetchRadios } = useRadios()
  const { t } = useTranslation()

  const columns = radiosColumns()
  const memoizedRadios = useMemo(() => radios, [radios])
  const { setPlayRadio } = usePlayerActions()

  function handleAddRadio() {
    setData({} as Radio)
    setDialogState(true)
  }

  useEffect(() => {
    fetchRadios()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="w-full h-full">
      <ShadowHeader>
        <div className="w-full flex items-center justify-between">
          <HeaderTitle title={t('sidebar.radios')} count={radios.length} />

          <Button
            size="sm"
            variant="default"
            className="px-4"
            onClick={handleAddRadio}
          >
            <PlusIcon className="w-5 h-5 -ml-[3px]" />
            <span className="ml-2">{t('radios.addRadio')}</span>
          </Button>
        </div>
      </ShadowHeader>

      <ListWrapper className="pt-[--shadow-header-distance]">
        <DataTable
          columns={columns}
          data={memoizedRadios}
          handlePlaySong={(row) => setPlayRadio(memoizedRadios, row.index)}
          showPagination={true}
          showSearch={true}
          searchColumn="name"
          allowRowSelection={false}
        />
      </ListWrapper>

      <RadioFormDialog />
      <RemoveRadioDialog />
    </div>
  )
}
