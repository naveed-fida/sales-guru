import * as Yup from 'yup'

export const areaSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name too short!')
    .max(100, 'Name too long!')
    .required('Name is required'),
})
