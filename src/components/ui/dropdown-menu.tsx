// Placeholder UI component for dropdown-menu
import React, { useState } from 'react'

export const DropdownMenu = ({
  children,
  ...props
}: {
  children?: React.ReactNode
  [key: string]: any
}) => (
  <div className="relative inline-block" {...props}>
    {children}
  </div>
)

export const DropdownMenuTrigger = ({
  children,
  ...props
}: {
  children?: React.ReactNode
  [key: string]: any
}) => <button {...props}>{children}</button>

export const DropdownMenuContent = ({
  children,
  ...props
}: {
  children?: React.ReactNode
  [key: string]: any
}) => (
  <div
    className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
    {...props}
  >
    <div className="py-1">{children}</div>
  </div>
)

export const DropdownMenuItem = ({
  children,
  ...props
}: {
  children?: React.ReactNode
  [key: string]: any
}) => (
  <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" {...props}>
    {children}
  </div>
)

export const DropdownMenuSeparator = (props: any) => (
  <div className="my-1 h-px bg-gray-200" {...props} />
)
