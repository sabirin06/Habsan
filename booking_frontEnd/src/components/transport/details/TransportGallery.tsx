/* eslint-disable @next/next/no-img-element */
"use client"

import { useMemo, useState } from "react"
import { Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/lib/use-media-query"
import { TransportGalleryModal } from "./TransportGalleryModal"
import { useTransportFavorites } from "./useTransportFavorites"
import { toast } from "sonner"

type Img = { url: string; alt: string }

async function shareLink(title: string) {
  const url = typeof window !== "undefined" ? window.location.href : ""
  try {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      await (navigator as any).share({
        title,
        text: "Check out this transport option on TravelPro",
        url
      })
      return
    }
  } catch {
    // ignore
  }
  try {
    await navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
  } catch {
    toast.error("Could not copy link")
  }
}

export function TransportGallery({
  serviceId,
  title,
  images
}: {
  serviceId: string
  title: string
  images: ReadonlyArray<Img>
}) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [open, setOpen] = useState(false)
  const safe = useMemo(() => (images?.length ? images : [{ url: "", alt: title }]), [images, title])
  const { isFavorite, toggleFavorite } = useTransportFavorites(serviceId)

  return (
    <>
      <div className="clean-card overflow-hidden border border-border/60 bg-card">
        <div className="relative">
          {/* Desktop: 1 + 2 */}
          <div className="hidden sm:grid grid-cols-12 gap-3 p-3">
            <button
              type="button"
              className="col-span-8 overflow-hidden rounded-2xl bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              onClick={() => setOpen(true)}
              aria-label="Open gallery"
            >
              <div className="aspect-16/10">
                <img src={safe[0]?.url ?? ""} alt={safe[0]?.alt ?? title} className="w-full h-full object-cover" />
              </div>
            </button>
            <div className="col-span-4 grid grid-rows-2 gap-3">
              {[1, 2].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  className="overflow-hidden rounded-2xl bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  onClick={() => setOpen(true)}
                  aria-label="Open gallery"
                >
                  <div className="aspect-16/10">
                    <img
                      src={(safe[idx]?.url ?? safe[0]?.url) || ""}
                      alt={(safe[idx]?.alt ?? safe[0]?.alt) || title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile carousel */}
          <div className="sm:hidden">
            <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar">
              {safe.map((img) => (
                <button
                  key={img.url}
                  type="button"
                  className="snap-start shrink-0 w-full"
                  onClick={() => setOpen(true)}
                  aria-label="Open gallery"
                >
                  <img src={img.url} alt={img.alt} className="w-full h-[280px] object-cover" />
                </button>
              ))}
            </div>
            <div className="absolute bottom-3 left-3 text-[11px] px-2 py-1 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 text-muted-foreground">
              Swipe gallery
            </div>
            <div className="absolute bottom-3 right-3">
              <Button
                type="button"
                variant="secondary"
                className="h-9 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 hover:bg-background"
                onClick={() => setOpen(true)}
              >
                View all
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black/35 to-transparent" />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              className="h-10 w-10 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 hover:bg-background transition-colors inline-flex items-center justify-center"
              aria-label={isFavorite ? "Remove from wishlist" : "Save to wishlist"}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleFavorite()
              }}
            >
              <Heart className={isFavorite ? "h-5 w-5 fill-primary text-primary" : "h-5 w-5 text-muted-foreground"} />
            </button>
            <button
              type="button"
              className="h-10 w-10 rounded-full bg-background/85 backdrop-blur-sm border border-border/60 hover:bg-background transition-colors inline-flex items-center justify-center"
              aria-label="Share"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                shareLink(title)
              }}
            >
              <Share2 className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {!isMobile ? (
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
          ) : null}
        </div>
      </div>

      <TransportGalleryModal open={open} onOpenChange={setOpen} images={safe} title={title} />
    </>
  )
}

