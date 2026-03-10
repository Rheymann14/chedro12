import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog'

interface CareerPostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: boolean
  children: React.ReactNode
  className?: string
}

export function CareerPostDialog({
  open,
  onOpenChange,
  editing,
  children,
  className = ''
}: CareerPostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`h-[85vh] w-full max-w-4xl overflow-y-auto ${className}`}>
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Edit Career Post' : 'Create Career Post'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {editing ? 'Edit an existing career post' : 'Create a new career post'}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
