/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Heart, Share2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/lib/use-media-query"

type Img = { url: string; alt: string }

export function HotelGallery({
  images,
  title
}: {
  images: ReadonlyArray<Img>
  title: string
}) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [open, setOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(0)

  const safeImages = useMemo(() => (images?.length ? images : [{ url: "", alt: title }]), [images, title])

  useEffect(() => {
    if (!isMobile) return
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const w = el.clientWidth || 1
      const idx = Math.round(el.scrollLeft / w)
      setActive(Math.max(0, Math.min(safeImages.length - 1, idx)))
    }
    el.addEventListener("scroll", onScroll, { passive: true } as any)
    return () => el.removeEventListener("scroll", onScroll as any)
  }, [isMobile, safeImages.length])

  return (
    <>
      <div className="clean-card overflow-hidden border border-border/60 bg-card">
        <div className="relative">
          {/* Desktop gallery grid */}
          <div className="hidden sm:grid grid-cols-12 gap-2 p-2">
            <div className="col-span-8 overflow-hidden rounded-2xl">
              <img
                src={safeImages[0]?.url ?? ""}
                alt={safeImages[0]?.alt ?? title}
                className="w-full h-[420px] object-cover"
              />
            </div>
            <div className="col-span-4 grid grid-rows-2 gap-2">
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={safeImages[1]?.url ?? safeImages[0]?.url ?? ""}
                  alt={safeImages[1]?.alt ?? title}
                  className="w-full h-[206px] object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={safeImages[2]?.url ?? safeImages[0]?.url ?? ""}
                  alt={safeImages[2]?.alt ?? title}
                  className="w-full h-[206px] object-cover"
                />
              </div>
            </div>
          </div>

          {/* Mobile carousel */}
          <div className="sm:hidden">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
              aria-label="Photo gallery"
            >
              {safeImages.map((img) => (
                <div key={img.url} className="snap-start shrink-0 w-full">
                  <img src={img.url} alt={img.alt} className="w-full h-[260px] object-cover" />
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
              {safeImages.slice(0, 6).map((_, i) => (
                <span
                  key={i}
                  className={[
                    "h-1.5 rounded-full transition-all duration-200",
                    i === active ? "w-6 bg-background/90" : "w-1.5 bg-background/50"
                  ].join(" ")}
                  aria-hidden="true"
                />
              ))}
            </div>

            <div className="absolute bottom-3 left-3 text-[11px] px-2 py-1 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 text-muted-foreground">
              Swipe gallery
            </div>
          </div>

          {/* Overlay controls */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black/35 to-transparent" />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              className="h-10 w-10 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 hover:bg-background transition-colors inline-flex items-center justify-center"
              aria-label="Save"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              type="button"
              className="h-10 w-10 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 hover:bg-background transition-colors inline-flex items-center justify-center"
              aria-label="Share"
              onClick={(e) => e.preventDefault()}
            >
              <Share2 className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="absolute bottom-3 right-3">
            <Button
              type="button"
              variant="secondary"
              className="h-9 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 hover:bg-background"
              onClick={() => setOpen(true)}
            >
              View all photos
            </Button>
          </div>
        </div>
      </div>

      {/* View-all modal */}
      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="All photos">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-0 overflow-auto">
            <div className="container py-8">
              <div className="max-w-5xl mx-auto clean-card border border-border/60 bg-background/95 backdrop-blur-sm overflow-hidden">
                <div className="p-4 border-b border-border/60 flex items-center justify-between gap-3">
                  <div className="font-semibold">Photos</div>
                  <button
                    type="button"
                    className="h-9 w-9 rounded-lg border border-border/60 hover:bg-accent inline-flex items-center justify-center"
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 grid gap-3 sm:grid-cols-2">
                  {safeImages.map((img) => (
                    <div key={img.url} className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
                      <img src={img.url} alt={img.alt} className="w-full h-56 object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

