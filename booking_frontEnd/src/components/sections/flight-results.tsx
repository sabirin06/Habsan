"use client"

import { useState } from "react"
import { Plane, Clock, Wifi, Coffee, Star, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

const flights = [
  {
    id: 1,
    airline: "Kenya Airways",
    logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=60&h=60&fit=crop&crop=center",
    route: "Nairobi → Istanbul",
    departure: "06:00",
    arrival: "14:30",
    duration: "8h 30m",
    stops: "Non-stop",
    price: 850,
    originalPrice: 1200,
    rating: 4.5,
    reviews: 1250,
    amenities: ["wifi", "meals", "entertainment"],
    aircraft: "Boeing 787",
    baggage: "2 × 23kg"
  },
  {
    id: 2,
    airline: "Turkish Airlines",
    logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=60&h=60&fit=crop&crop=center",
    route: "Istanbul → Toronto",
    departure: "16:45",
    arrival: "22:15",
    duration: "11h 30m",
    stops: "Non-stop",
    price: 950,
    originalPrice: 1350,
    rating: 4.7,
    reviews: 2103,
    amenities: ["wifi", "meals", "entertainment", "lounge"],
    aircraft: "Airbus A350",
    baggage: "2 × 23kg"
  },
  {
    id: 3,
    airline: "Emirates",
    logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=60&h=60&fit=crop&crop=center",
    route: "Dubai → UAE",
    departure: "23:55",
    arrival: "06:45+1",
    duration: "13h 50m",
    stops: "1 Stop",
    price: 1200,
    originalPrice: 1600,
    rating: 4.8,
    reviews: 3489,
    amenities: ["wifi", "meals", "entertainment", "lounge", "shower"],
    aircraft: "Airbus A380",
    baggage: "2 × 30kg"
  }
]

const amenityIcons = {
  wifi: Wifi,
  meals: Coffee,
  entertainment: Star,
  lounge: Star,
  shower: Star
}

export function FlightResults() {
  const [selectedFlight, setSelectedFlight] = useState<number | null>(null)

  return (
    <section className="py-16 section-muted">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Popular Flights
              </h2>
              <p className="text-muted-foreground">
                Discover the most booked flights
              </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {["Best Price", "Fastest", "Best Rated"].map((filter) => (
                <button
                  key={filter}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-accent hover:scale-105 transition-all duration-200 text-sm font-medium"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Flight Cards */}
          <div className="space-y-6">
            {flights.map((flight) => (
              <div
                key={flight.id}
                className="clean-card p-6 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-out group cursor-pointer"
                onClick={() => setSelectedFlight(selectedFlight === flight.id ? null : flight.id)}
              >
                <div className="flex items-center justify-between">
                  {/* Flight Info */}
                  <div className="flex items-center gap-6 flex-1">
                    {/* Airline Logo */}
                    <div className="flex items-center gap-3">
                      <img
                        src={flight.logo}
                        alt={flight.airline}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-foreground">{flight.airline}</h3>
                        <p className="text-sm text-muted-foreground">{flight.aircraft}</p>
                      </div>
                    </div>

                    {/* Route & Time */}
                    <div className="flex items-center gap-8 flex-1">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{flight.departure}</p>
                        <p className="text-sm text-muted-foreground">Departure</p>
                      </div>

                      <div className="flex-1 relative">
                        <div className="flex items-center justify-center">
                          <div className="h-px bg-border flex-1"></div>
                          <div className="mx-4 p-2 rounded-full bg-primary/10">
                            <Plane className="h-4 w-4 text-primary" />
                          </div>
                          <div className="h-px bg-border flex-1"></div>
                        </div>
                        <div className="text-center mt-2">
                          <p className="text-sm font-medium text-foreground">{flight.duration}</p>
                          <p className="text-xs text-muted-foreground">{flight.stops}</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{flight.arrival}</p>
                        <p className="text-sm text-muted-foreground">Arrival</p>
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="text-right">
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground line-through">
                        ${flight.originalPrice}
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        ${flight.price}
                      </p>
                      <p className="text-sm text-muted-foreground">per person</p>
                    </div>

                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg border border-border hover:bg-accent hover:scale-110 transition-all duration-200">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary/90 hover:scale-105 hover:shadow-md transition-all duration-200"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedFlight === flight.id && (
                  <div className="mt-6 pt-6 border-t border-border dark:border-border/80">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Rating */}
                      <div>
                        <h4 className="font-semibold mb-2">Rating</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{flight.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({flight.reviews.toLocaleString()} reviews)
                          </span>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div>
                        <h4 className="font-semibold mb-2">Amenities</h4>
                        <div className="flex gap-2">
                          {flight.amenities.map((amenity) => {
                            const Icon = amenityIcons[amenity as keyof typeof amenityIcons]
                            return (
                              <div
                                key={amenity}
                                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                                title={amenity}
                              >
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Baggage */}
                      <div>
                        <h4 className="font-semibold mb-2">Baggage</h4>
                        <p className="text-sm text-muted-foreground">{flight.baggage}</p>
                        <p className="text-xs text-muted-foreground mt-1">Checked baggage included</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              size="lg" 
              className="hover:scale-105 hover:shadow-md hover:bg-accent transition-all duration-200"
            >
              More Flights
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}