"use client"

import { Shield, CreditCard, Headphones, RefreshCw, Star, Award } from "lucide-react"

const trustFeatures = [
  {
    icon: Shield,
    title: "Best Price Guarantee",
    description: "We monitor 500+ airlines daily. Find a lower price within 24 hours and we'll match it plus 5% off your next booking.",
    metric: "2.3M+ verified bookings"
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Your payment details are protected with bank-grade encryption. Pay with cards, mobile money, or installments.",
    metric: "256-bit SSL encryption"
  },
  {
    icon: Headphones,
    title: "24/7 Expert Support",
    description: "Real travel experts (not bots) available in English, French, and Swahili. Average response time: 2 minutes.",
    metric: "4.9/5 support rating"
  },
  {
    icon: RefreshCw,
    title: "Flexible Changes",
    description: "Life happens. Change or cancel most bookings online with transparent fees. No surprise charges.",
    metric: "Free changes on 80% of bookings"
  }
]

export function FlightTrustSignals() {
  return (
    <section className="py-20 section-background">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6 border border-primary/20">
              <Award className="h-4 w-4" />
              Trusted by African travelers since 2019
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Book with
              <span className="block bg-linear-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                complete confidence
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Every booking is protected by our comprehensive guarantees and 24/7 expert support
            </p>
          </div>

          {/* Features Grid - Asymmetric */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {trustFeatures.map((feature, index) => (
              <div
                key={index}
                className="clean-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Icon - Smaller, less dominant */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Metric - Green accent */}
                <div className="text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded-full inline-block">
                  {feature.metric}
                </div>
              </div>
            ))}
          </div>

          {/* Stats - Offset layout */}
          <div className="mt-20 grid gap-12 md:grid-cols-3 text-center">
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">523</div>
              <div className="text-sm text-muted-foreground">Airlines across 47 African countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">4.8</div>
              <div className="text-sm text-muted-foreground inline-flex items-center justify-center gap-2">
                <Star className="h-4 w-4 shrink-0 fill-yellow-400 text-yellow-400" />
                <span>Average rating from 52,000+ reviews</span>
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">2.3M</div>
              <div className="text-sm text-muted-foreground">Successful bookings since 2019</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}