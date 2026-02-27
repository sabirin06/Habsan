"use client"

import type { Flight } from "@/lib/flight-types"

// Shared mock flights dataset used by results + checkout.
export const MOCK_FLIGHTS: Flight[] = [
  {
    id: "1",
    airline: "Emirates",
    flightNumber: "EK 203",
    logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=60&h=60&fit=crop&crop=center",
    departure: {
      time: "14:30",
      airport: "John F. Kennedy International Airport",
      code: "JFK",
      terminal: "4",
      gate: "A12"
    },
    arrival: {
      time: "06:45",
      airport: "Dubai International Airport",
      code: "DXB",
      terminal: "3",
      nextDay: true
    },
    duration: "12h 15m",
    stops: 0,
    aircraft: "Airbus A380",
    price: 1299,
    originalPrice: 1599,
    rating: 4.8,
    reviews: 3489,
    amenities: ["wifi", "meals", "entertainment", "lounge", "shower"],
    baggage: {
      carry: "7kg",
      checked: "30kg"
    },
    cabinClass: "Economy",
    cancellation: "Free cancellation up to 24h before departure",
    changes: "Changes allowed with $150 fee"
  },
  {
    id: "2",
    airline: "Turkish Airlines",
    flightNumber: "TK 001",
    logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=60&h=60&fit=crop&crop=center",
    departure: {
      time: "16:45",
      airport: "John F. Kennedy International Airport",
      code: "JFK",
      terminal: "1"
    },
    arrival: {
      time: "22:15",
      airport: "Istanbul Airport",
      code: "IST",
      terminal: "1",
      nextDay: true
    },
    duration: "11h 30m",
    stops: 0,
    aircraft: "Boeing 777-300ER",
    price: 950,
    originalPrice: 1350,
    rating: 4.7,
    reviews: 2103,
    amenities: ["wifi", "meals", "entertainment", "lounge"],
    baggage: {
      carry: "8kg",
      checked: "23kg"
    },
    cabinClass: "Economy",
    cancellation: "Free cancellation up to 24h before departure",
    changes: "Changes allowed with $100 fee"
  },
  {
    id: "3",
    airline: "Lufthansa",
    flightNumber: "LH 441",
    logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=60&h=60&fit=crop&crop=center",
    departure: {
      time: "18:20",
      airport: "John F. Kennedy International Airport",
      code: "JFK",
      terminal: "1"
    },
    arrival: {
      time: "08:15",
      airport: "Frankfurt Airport",
      code: "FRA",
      terminal: "1",
      nextDay: true
    },
    duration: "7h 55m",
    stops: 0,
    aircraft: "Airbus A340-600",
    price: 1150,
    rating: 4.6,
    reviews: 1876,
    amenities: ["wifi", "meals", "entertainment"],
    baggage: {
      carry: "8kg",
      checked: "23kg"
    },
    cabinClass: "Economy",
    cancellation: "Cancellation fee $200",
    changes: "Changes allowed with $150 fee"
  },
  {
    id: "4",
    airline: "British Airways",
    flightNumber: "BA 177",
    logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=60&h=60&fit=crop&crop=center",
    departure: {
      time: "21:30",
      airport: "John F. Kennedy International Airport",
      code: "JFK",
      terminal: "7"
    },
    arrival: {
      time: "09:45",
      airport: "London Heathrow Airport",
      code: "LHR",
      terminal: "5",
      nextDay: true
    },
    duration: "7h 15m",
    stops: 0,
    aircraft: "Boeing 787-9",
    price: 1075,
    rating: 4.5,
    reviews: 2341,
    amenities: ["wifi", "meals", "entertainment"],
    baggage: {
      carry: "6kg",
      checked: "23kg"
    },
    cabinClass: "Economy",
    cancellation: "Cancellation fee $250",
    changes: "Changes allowed with $175 fee"
  },
  {
    id: "5",
    airline: "Air France",
    flightNumber: "AF 007",
    logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=60&h=60&fit=crop&crop=center",
    departure: {
      time: "23:55",
      airport: "John F. Kennedy International Airport",
      code: "JFK",
      terminal: "1"
    },
    arrival: {
      time: "14:20",
      airport: "Charles de Gaulle Airport",
      code: "CDG",
      terminal: "2E",
      nextDay: true
    },
    duration: "8h 25m",
    stops: 0,
    aircraft: "Airbus A350-900",
    price: 1225,
    rating: 4.4,
    reviews: 1654,
    amenities: ["wifi", "meals", "entertainment", "lounge"],
    baggage: {
      carry: "12kg",
      checked: "23kg"
    },
    cabinClass: "Economy",
    cancellation: "Cancellation fee $200",
    changes: "Changes allowed with $125 fee"
  }
]

export function getMockFlightById(id: string): Flight | undefined {
  return MOCK_FLIGHTS.find((f) => f.id === id)
}

