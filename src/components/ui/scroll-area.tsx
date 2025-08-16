// Placeholder UI component for scroll-area
import React from 'react'

export const ScrollArea = ({
  children,
  className = '',
  ...props
}: {
  children?: React.ReactNode
  className?: string
  [key: string]: any
}) => (
  <div className={`overflow-auto ${className}`} {...props}>
    {children}
  </div>
)
