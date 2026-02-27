/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Share2 } from "lucide-react"
import { toast } from "sonner"
import { useMediaQuery } from "@/lib/use-media-query"
import { Button } from "@/components/ui/button"

type Img = { url: string; alt: string }

async function shareLink(title: string, url: string) {
  try {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      await (navigator as any).share({
        title,
        text: "Check out this experience on TravelPro",
        url
      })
      return
    }
  } catch {
    // ignore and fallback
  }
  try {
    await navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
  } catch {
    toast.error("Could not copy link")
  }
}

export function ExperienceGalleryModal({
  open,
  onOpenChange,
  images,
  title
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  images: ReadonlyArray<Img>
  title: string
}) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const safe = useMemo(() => (images?.length ? images : [{ url: "", alt: title }]), [images, title])
  const [viewerOpen, setViewerOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const pageUrl = typeof window !== "undefined" ? window.location.href : ""

  const closeViewer = () => {
    setViewerOpen(false)
    setZoomed(false)
  }

  const openViewerAt = (i: number) => {
    setIndex(i)
    setZoomed(false)
    setViewerOpen(true)
  }

  const shareCurrent = async () => {
    await shareLink(title, pageUrl)
  }

  useEffect(() => {
    if (!viewerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer()
      if (e.key === "ArrowRight") setIndex((i) => Math.min(safe.length - 1, i + 1))
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [viewerOpen, safe.length])

  useEffect(() => {
    if (!viewerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [viewerOpen])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
        <DialogContent
          className={[
            isMobile ? "left-0 top-0 translate-x-0 translate-y-0 w-screen h-dvh rounded-none max-h-none" : "max-h-[85vh]"
          ].join(" ")}
        >
          <DialogHeader className={isMobile ? "sticky top-0 bg-background/95 backdrop-blur-sm" : ""}>
            <div className="flex items-center justify-between gap-3 pr-12">
              <DialogTitle>Photos</DialogTitle>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" className="h-9" onClick={shareCurrent}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className={isMobile ? "h-[calc(100dvh-64px)] overflow-auto" : "max-h-[calc(85vh-64px)] overflow-auto"}>
            <div className="p-4 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {safe.map((img, i) => (
                <button
                  key={img.url + i}
                  type="button"
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-muted/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  onClick={() => openViewerAt(i)}
                  aria-label={`Open photo ${i + 1}`}
                >
                  <div className="aspect-4/3 bg-muted/30">
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-linear-to-t from-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {viewerOpen ? (
        <div className="fixed inset-0 z-9999" role="dialog" aria-modal="true" aria-label="Photo viewer">
          <div className="absolute inset-0 bg-black/90" onClick={closeViewer} />

          <div className="relative z-10 h-full pointer-events-none">
            <div className="absolute inset-x-0 top-0 p-4 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-3">
                <div className="text-xs text-white/80">
                  {index + 1}/{safe.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm hover:bg-white/15 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      shareCurrent()
                    }}
                    aria-label="Share image"
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    className="h-10 px-3 rounded-lg cursor-pointer bg-white/10 border border-white/20 text-white text-sm hover:bg-white/15 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeViewer()
                    }}
                    aria-label="Close image viewer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center px-4 pt-16 pb-12 pointer-events-none">
              <div className="relative w-full max-w-[1100px] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <img
                  src={safe[index]?.url ?? ""}
                  alt={safe[index]?.alt ?? title}
                  className={[
                    "mx-auto max-h-[75dvh] w-auto select-none",
                    "transition-transform duration-200 ease-out",
                    zoomed ? "scale-[1.75] cursor-zoom-out" : "scale-100 cursor-zoom-in"
                  ].join(" ")}
                  onClick={() => setZoomed((z) => !z)}
                  onTouchStart={(e) => {
                    touchStartX.current = e.touches[0]?.clientX ?? null
                  }}
                  onTouchEnd={(e) => {
                    const start = touchStartX.current
                    const end = e.changedTouches[0]?.clientX ?? null
                    touchStartX.current = null
                    if (start == null || end == null) return
                    const dx = end - start
                    if (Math.abs(dx) < 40) return
                    if (dx < 0) setIndex((i) => Math.min(safe.length - 1, i + 1))
                    else setIndex((i) => Math.max(0, i - 1))
                  }}
                />

                <button
                  type="button"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/10 border border-white/20 text-white inline-flex items-center justify-center hover:bg-white/15 transition-colors"
                  aria-label="Previous"
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/10 border border-white/20 text-white inline-flex items-center justify-center hover:bg-white/15 transition-colors"
                  aria-label="Next"
                  onClick={() => setIndex((i) => Math.min(safe.length - 1, i + 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

