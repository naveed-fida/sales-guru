import { useEffect, useState } from 'react'
import AreasTable from './AreasTable'
import AreaAddDialog from './AreaAddDialog'
import { Area } from '@prisma/client'
import { Pagination } from '@mui/material'

const AREAS_PER_PAGE = 10

export const AreasDisplay: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([])
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)
  const [currPage, setCurrPage] = useState<number>(1)
  const [areasCount, setAreasCount] = useState<number>(0)

  useEffect(() => {
    window.api
      .getAreas({
        skip: (currPage - 1) * AREAS_PER_PAGE,
        take: AREAS_PER_PAGE,
      })
      .then(({ areas, count }) => {
        setAreas(areas)
        setAreasCount(count)
      })
  }, [currPage])

  return (
    <div className="areas-display h-full">
      <div className="areas-display__header flex justify-between items-center">
        <h1 className="text-2xl">Areas</h1>
        <button
          onClick={() => setShowAddDialog(true)}
          className="text-base py-2 px-4 bg-slate-800 text-slate-50 rounded-md shadow-md"
        >
          Add Area
        </button>
      </div>
      <div className="areas-display__body mt-4 h-[calc(100%-120px)]">
        <AreasTable areas={areas} />
        {areas && areasCount > AREAS_PER_PAGE && (
          <div className="mt-8 mb-2">
            <Pagination
              count={Math.ceil(areasCount / AREAS_PER_PAGE)}
              onChange={(_, value) => {
                setCurrPage(value)
              }}
            />
          </div>
        )}
      </div>
      <AreaAddDialog isOpen={showAddDialog} setOpen={(open) => setShowAddDialog(open)} />
    </div>
  )
}
