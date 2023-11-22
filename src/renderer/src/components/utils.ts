export const classNames = (...names: string[]) => {
  return names.filter(Boolean).join(' ')
}
