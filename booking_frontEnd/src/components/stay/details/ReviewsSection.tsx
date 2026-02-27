/* eslint-disable @next/next/no-img-element */
"use client"

import type { Stay } from "@/lib/stay-types"
import { Star } from "lucide-react"

export function ReviewsSection({ stay }: { stay: Stay }) {
  const sampleReviews = [
    {
      name: "Asha M.",
      from: "Nairobi, Kenya",
      date: "Jan 2026",
      rating: 5,
      title: "Clean, calm, and exactly as described",
      body:
        "Check‑in was smooth and the place felt secure. Wi‑Fi was fast enough for work and the area was quiet at night. Would book again.",
      highlight: "Great for work trips"
    },
    {
      name: "Khalid A.",
      from: "Dakar, Senegal",
      date: "Dec 2025",
      rating: 4,
      title: "Excellent value and helpful staff",
      body:
        "The room was comfortable and the service was responsive. Location was convenient for getting around the city. Minor noise but still a solid stay.",
      highlight: "Best value"
    },
    {
      name: "Samira H.",
      from: "Hargeisa, Somaliland",
      date: "Nov 2025",
      rating: 5,
      title: "Felt premium and safe",
      body:
        "Loved the overall experience — clean amenities, easy booking, and clear pricing. The support team was quick when I had a question.",
      highlight: "Secure booking"
    }
  ] as const

  return (
    <section className="clean-card p-4 md:p-6 border border-border/60 bg-card" aria-label="Reviews">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold">Reviews</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Designed for real reviews once API is connected.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/50 p-4 min-w-[240px]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-3xl font-bold tabular-nums">{stay.guestRating.toFixed(1)}</div>
            <div className="text-right">
              <div className="flex justify-end">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={i < Math.round(stay.guestRating / 2) ? "h-4 w-4 fill-yellow-400 text-yellow-400" : "h-4 w-4 text-muted-foreground/35"}
                  />
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{stay.reviewsCount.toLocaleString()} reviews</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2">
              <span>Cleanliness</span>
              <span className="font-medium text-foreground">4.7</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2">
              <span>Location</span>
              <span className="font-medium text-foreground">4.6</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2">
              <span>Value</span>
              <span className="font-medium text-foreground">4.5</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2">
              <span>Service</span>
              <span className="font-medium text-foreground">4.8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sample review mock data */}
      <div className="mt-6 grid gap-3">
        {sampleReviews.map((r) => (
          <article key={r.name + r.date} className="rounded-2xl border border-border/60 bg-background/50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex items-start gap-3">
                <div className="h-10 w-10 rounded-full border border-border/60 bg-muted/30 flex items-center justify-center text-sm font-semibold text-foreground shrink-0">
                  {r.name
                    .split(" ")
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <div className="font-semibold truncate">{r.name}</div>
                    <span className="text-xs text-muted-foreground">• {r.from}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center gap-0.5" aria-label={`${r.rating} star review`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={i < r.rating ? "h-3.5 w-3.5 fill-yellow-400 text-yellow-400" : "h-3.5 w-3.5 text-muted-foreground/35"}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                    <span className="text-[11px] px-2 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary">
                      {r.highlight}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground shrink-0">
                Stayed at {stay.location.city}
              </div>
            </div>

            <div className="mt-3">
              <div className="font-semibold">{r.title}</div>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{r.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

