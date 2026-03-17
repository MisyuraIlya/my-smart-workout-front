'use client'

import { useState } from 'react'
import Image from 'next/image'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface Props {
  src: string
  alt: string
  /** thumbnail size class — defaults to size-12 */
  sizeClass?: string
}

export function ClickableExerciseImage({ src, alt, sizeClass = 'size-12' }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`relative ${sizeClass} shrink-0 overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
      >
        <Image src={src} alt={alt} fill className="object-cover" unoptimized />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm p-2">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <div className="relative aspect-square w-full overflow-hidden rounded-md">
            <Image src={src} alt={alt} fill className="object-contain" unoptimized />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
