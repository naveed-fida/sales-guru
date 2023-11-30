import * as Yup from 'yup'

export const productSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name too short!')
    .max(100, 'Name too long!')
    .required('Name is required'),
  price: Yup.number().min(1, 'Price cannot be less than 1').required('Price is required'),
  inventory: Yup.number()
    .min(1, 'Quantity cannot be less than 1')
    .required('Inventory is required'),
})

export const inventoryRecordSchema = Yup.object().shape({
  quantity: Yup.number().min(1, 'Quantity cannot be less than 1').required('Quantity is required'),
  date: Yup.date().required('Date is required'),
})
