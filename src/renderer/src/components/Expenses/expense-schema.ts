import * as Yup from 'yup'

export const expenseSchema = Yup.object().shape({
  description: Yup.string()
    .min(3, 'Description too short!')
    .max(200, 'Description too long!')
    .required('Description is required'),
  amount: Yup.number().min(1, 'Amount cannot be less than 1').required('Amount is required'),
  date: Yup.date().required('Date is required'),
})
