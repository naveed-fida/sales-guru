import { useEffect, useState } from 'react'
import AreasTable from './AreasTable'
import AreaAddDialog from './AreaAddDialog'
import { Area } from '@prisma/client'

export const AreasDisplay: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([])
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)

  useEffect(() => {
    window.api.getAreas().then((areas) => {
      setAreas(areas)
    })
  }, [])

  return (
    <div className="areas-display h-[90%]">
      <div className="areas-display__header flex justify-between items-center">
        <h1 className="text-2xl">Areas</h1>
        <button
          onClick={() => setShowAddDialog(true)}
          className="text-base py-2 px-4 bg-slate-800 text-slate-50 rounded-md shadow-md"
        >
          Add Area
        </button>
      </div>
      <div className="areas-display__body mt-4 h-[100%] overflow-scroll">
        <AreasTable areas={areas} />
      </div>
      <AreaAddDialog isOpen={showAddDialog} setOpen={(open) => setShowAddDialog(open)} />
    </div>
  )
}
