"use client"

import { Plane, Shield, Sparkles } from "lucide-react"

export function FlightHeader() {
  return (
    <section className="pt-24 pb-6 section-background">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full bg-primary/10 dark:bg-primary/20 px-3 py-1.5 text-sm font-medium text-primary border border-primary/20 mb-5">
            <Shield className="h-3.5 w-3.5" />
            <span className="text-primary/90">Price guarantee on</span>
            <span className="font-semibold whitespace-nowrap">2.3M+ verified bookings</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold tracking-tight mb-3">
            <span className="text-foreground">Flight booking</span>
            <span className="block bg-linear-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              made simple
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Search, compare, and book flights with confidence. 
            <span className="text-foreground font-medium"> No hidden fees.</span>
          </p>
        </div>
      </div>
    </section>
  )
}