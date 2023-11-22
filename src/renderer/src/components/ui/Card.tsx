interface CardProps {
  className?: string
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`card w-36 h-36 rounded-md shadow-md p-4 ${className || ''}`}>
      <div className="flex align-middle justify-center">{children}</div>
    </div>
  )
}
