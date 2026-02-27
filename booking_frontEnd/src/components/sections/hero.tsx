"use client"

import { Sparkles, Globe, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HomeSearch } from "@/components/home-search/HomeSearch"

export function Hero() {

  return (
    <section className="relative min-h-screen flex items-center section-primary overflow-hidden pt-32">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,rgba(16,185,129,0.03)_50%,transparent_51%)] bg-[length:20px_20px]" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
      <div className="absolute top-40 right-20 w-3 h-3 bg-primary/30 rounded-full animate-pulse delay-1000" />
      <div className="absolute bottom-40 left-20 w-1 h-1 bg-primary/40 rounded-full animate-pulse delay-500" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT: Bold Content */}
          <div className="space-y-10 animate-fade-in">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-3 rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-2 text-sm font-medium text-primary border border-primary/20">
              <Shield className="h-4 w-4" />
              <span>Trusted by 50,000+ travelers across Africa</span>
              <Sparkles className="h-4 w-4" />
            </div>

            {/* Hero Headline */}
            <div className="space-y-6">
              <h1 className="text-display">
                <span className="block text-foreground">Premium Travel</span>
                <span className="block bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                  Made Simple
                </span>
                <span className="block text-foreground text-4xl sm:text-5xl lg:text-6xl font-normal">
                  for Modern Africa
                </span>
              </h1>

              <p className="text-body-large text-muted-foreground max-w-xl leading-relaxed">
                Experience seamless booking for flights, luxury hotels, and curated local experiences.
                <span className="text-foreground font-medium"> Built for the modern African traveler.</span>
              </p>
            </div>

            {/* Premium CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="premium-button-primary group">
                <Globe className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Start Your Journey
              </Button>
              <Button variant="ghost" className="premium-button-secondary group">
                <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">2M+</div>
                <div className="text-sm text-muted-foreground">Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Dynamic Premium Search Component */}
          <HomeSearch />
        </div>
      </div>
    </section>
  )
}