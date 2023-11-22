import * as Yup from 'yup'

export const customerSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name too short!')
    .max(100, 'Name too long!')
    .required('Name is required'),
  phone: Yup.string().nullable(),
  area: Yup.number().nullable(),
})
