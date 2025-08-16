// Placeholder UI component for avatar
import React from 'react'

export const Avatar = ({
  children,
  ...props
}: {
  children?: React.ReactNode
  [key: string]: any
}) => (
  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200" {...props}>
    {children}
  </div>
)

export const AvatarImage = ({
  src,
  alt,
  ...props
}: {
  src?: string
  alt?: string
  [key: string]: any
}) => <img className="h-full w-full rounded-full object-cover" src={src} alt={alt} {...props} />

export const AvatarFallback = ({
  children,
  ...props
}: {
  children?: React.ReactNode
  [key: string]: any
}) => (
  <span className="text-sm font-medium text-gray-600" {...props}>
    {children}
  </span>
)
