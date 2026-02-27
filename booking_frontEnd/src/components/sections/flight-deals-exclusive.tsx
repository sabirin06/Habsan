"use client"

import { Percent, Clock, ArrowRight, Plane, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

const flightDeals = [
  {
    id: 1,
    route: "Lagos → London",
    airline: "British Airways",
    originalPrice: 1299,
    discountPrice: 899,
    discount: "31% OFF",
    validUntil: "3 days left",
    features: ["Direct flight", "Free baggage", "Flexible dates"],
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=200&fit=crop&crop=center"
  },
  {
    id: 2,
    route: "Nairobi → Dubai",
    airline: "Emirates",
    originalPrice: 899,
    discountPrice: 649,
    discount: "28% OFF",
    validUntil: "5 days left",
    features: ["Premium economy", "Lounge access", "Meals included"],
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=200&fit=crop&crop=center"
  },
  {
    id: 3,
    route: "Cairo → Paris",
    airline: "Air France",
    originalPrice: 799,
    discountPrice: 599,
    discount: "25% OFF",
    validUntil: "1 week left",
    features: ["Non-stop", "Free WiFi", "Entertainment"],
    image: "https://plus.unsplash.com/premium_photo-1718035557075-5111d9d906d2?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=400&h=200&fit=object-cover"
  }
]

export function FlightDealsExclusive() {
  return (
    <section className="py-16 section-muted">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6 border border-primary/20">
              <Percent className="h-4 w-4" />
              Exclusive Flight Deals
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Limited Time
              <span className="block bg-linear-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                Flight Offers
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Handpicked deals on popular African routes with premium airlines
            </p>
          </div>

          {/* Deals Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ">
            {flightDeals.map((deal) => (
              <div
                key={deal.id}
                className="clean-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group premium-card"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.route}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                  {/* Discount Badge */}
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {deal.discount}
                  </div>

                  {/* Route */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <MapPin className="h-4 w-4" />
                      {deal.route}
                    </div>
                    <div className="text-sm opacity-90">{deal.airline}</div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Pricing */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground line-through">
                        ${deal.originalPrice}
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        ${deal.discountPrice}
                      </div>
                      <div className="text-sm text-muted-foreground">per person</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-orange-600 font-medium">
                        <Clock className="h-3 w-3" />
                        {deal.validUntil}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {deal.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button className="w-full bg-primary hover:bg-primary/90 group">
                    Book This Deal
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform cursor-pointer !important" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* View All */}
          <div className="text-center mt-12 ">
            <Button variant="outline" size="lg" className="hover:bg-accent cursor-pointer !important">
              View All Flight Deals
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}