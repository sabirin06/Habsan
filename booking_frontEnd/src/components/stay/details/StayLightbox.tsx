/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useMemo, useState } from "react"
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"

type Img = { url: string; alt: string }

export function StayLightbox({
  images,
  open,
  index,
  onClose,
  onIndexChange
}: {
  images: ReadonlyArray<Img>
  open: boolean
  index: number
  onClose: () => void
  onIndexChange: (next: number) => void
}) {
  const slides = useMemo(() => images.map((i) => ({ src: i.url, alt: i.alt })), [images])
  const [cur, setCur] = useState(index)

  useEffect(() => setCur(index), [index])

  if (!open) return null

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={cur}
      slides={slides}
      plugins={[Zoom]}
      carousel={{ finite: false }}
      // Keep default toolbar (includes Close) so user can exit reliably.
      on={{
        view: ({ index: next }) => {
          setCur(next)
          onIndexChange(next)
        }
      }}
    />
  )
}

