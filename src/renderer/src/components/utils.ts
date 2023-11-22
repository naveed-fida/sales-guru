export const classNames = (...names: string[]) => {
  return names.filter(Boolean).join(' ')
}

export const validDateRange = (dateRange: { from: Date; to: Date }) => {
  return dateRange.to && dateRange.from && dateRange.to > dateRange.from
}
