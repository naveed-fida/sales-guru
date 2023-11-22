import { Dialog } from '@headlessui/react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useNavigate } from 'react-router-dom'
import { BriefcaseIcon } from '@heroicons/react/20/solid'
import { areaSchema } from './area-schema'

interface AreaAddDialogProps {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
}

export default function AreaAddDialog({ isOpen, setOpen }: AreaAddDialogProps) {
  const navigate = useNavigate()

  return (
    <Dialog open={isOpen} onClose={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-slate-100 p-4 rounded-md w-[400px]">
          <Dialog.Title className="text-xl font-semibold text-slate-800">Add Area</Dialog.Title>

          <Formik
            initialValues={{
              name: '',
            }}
            onSubmit={(values) => {
              const castValues = areaSchema.cast(values)
              window.api.saveArea(castValues).then(() => {
                navigate(0)
              })
            }}
            validationSchema={areaSchema}
          >
            <Form>
              <div className="mt-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="mt-1">
                  <Field
                    name="name"
                    id="name"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                    placeholder="Korangi"
                  />
                </div>
                <div className="text-red-700">
                  <ErrorMessage name="name" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex items-center gap-3 px-4 py-2 bg-slate-800 text-slate-50 rounded-md shadow-md"
                >
                  <span>
                    <BriefcaseIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>Save</span>
                </button>
              </div>
            </Form>
          </Formik>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
