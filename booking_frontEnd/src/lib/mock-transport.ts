/* eslint-disable @next/next/no-img-element */
import type { Airport } from "@/lib/airports"
import { AIRPORTS } from "@/lib/airports"
import type { TransportService } from "@/lib/transport-types"

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`

function pickAirports(codes: string[]): Array<Pick<Airport, "code" | "city" | "country" | "airport">> {
  const by = new Map(AIRPORTS.map((a) => [a.code, a]))
  return codes
    .map((c) => by.get(c))
    .filter(Boolean)
    .map((a) => ({ code: a!.code, city: a!.city, country: a!.country, airport: a!.airport }))
}

export const MOCK_TRANSPORT: TransportService[] = [
  // Airport pickup / taxi
  {
    id: "trp_pick_mog_mia_economy",
    kind: "airport_pickup",
    title: "Economy Airport Pickup • Mogadishu (MGQ)",
    vehicleType: "sedan",
    provider: { id: "prov_sahalrides", name: "Sahal Rides", verified: true },
    rating: { score: 4.7, reviewsCount: 892 },
    capacity: 3,
    driverModes: ["with_driver"],
    features: ["ac", "water", "meet_greet", "phone_charger"],
    freeCancellation: true,
    pricing: { amount: 22, unit: "per_trip", currency: "USD" },
    images: [
      { url: u("photo-1542362567-b07e54358753"), alt: "Sedan waiting at airport curb" },
      { url: u("photo-1517520287167-4bbf64a00d66"), alt: "Car interior" },
      { url: u("photo-1525609004556-c46c7d6cf023"), alt: "Night city pickup" }
    ],
    overview: {
      description:
        "A calm, reliable MGQ pickup with verified drivers and upfront pricing. Ideal for solo travelers and couples.",
      highlights: ["Meet & greet at arrivals", "AC + complimentary water", "Local driver support 24/7"]
    },
    whatsIncluded: ["One-way transfer", "Meet & greet", "60 minutes waiting time", "Bottled water"],
    cancellationPolicy: "Free cancellation up to 12 hours before pickup.",
    pickupInstructions:
      "Your driver will wait at arrivals with a name sign. You’ll receive car plate + contact details after booking.",
    pickup: {
      pickupType: "airport",
      airports: pickAirports(["MGQ"]),
      dropOffZones: ["Hodan", "Wadajir", "Shangani", "KM4", "Airport Road"],
      meetAndGreet: true
    },
    driver: {
      name: "Abdullahi",
      languages: ["Somali", "English"],
      verified: true,
      yearsExperience: 6,
      phone: "+252 61 000 0000",
      whatsapp: "+252 61 000 0000"
    },
    reviews: [
      {
        id: "r1",
        name: "Ayaan",
        rating: 5,
        dateISO: "2026-01-10",
        comment: "Driver was on time and the ride felt safe and smooth."
      },
      {
        id: "r2",
        name: "Khalid",
        rating: 4,
        dateISO: "2025-12-02",
        comment: "Simple pickup, good communication. Would book again."
      }
    ]
  },
  {
    id: "trp_pick_mog_suv_family",
    kind: "airport_pickup",
    title: "SUV Airport Transfer • Family-ready (MGQ)",
    vehicleType: "suv",
    provider: { id: "prov_dalmar", name: "Dalmar Mobility", verified: true },
    rating: { score: 4.8, reviewsCount: 514 },
    capacity: 5,
    driverModes: ["with_driver"],
    features: ["ac", "wifi", "child_seat", "meet_greet", "extra_luggage"],
    freeCancellation: true,
    pricing: { amount: 34, unit: "per_trip", currency: "USD" },
    images: [
      { url: u("photo-1511919884226-fd3cad34687c"), alt: "SUV at curb" },
      { url: u("photo-1525609004556-c46c7d6cf023"), alt: "Premium city transfer" },
      { url: u("photo-1523987355523-c7b5b84a2b2e"), alt: "Spacious back seats" }
    ],
    overview: {
      description:
        "More space, more comfort. Perfect for families and groups arriving with luggage — with optional child seat and Wi‑Fi.",
      highlights: ["Spacious SUV + luggage support", "Child seat (request)", "Verified local partner"]
    },
    whatsIncluded: ["One-way transfer", "Meet & greet", "Wi‑Fi (where available)", "Up to 2 standard suitcases"],
    cancellationPolicy: "Free cancellation up to 12 hours before pickup.",
    pickupInstructions:
      "Your driver will message you when you land. Head to arrivals; look for your name sign near the meeting point.",
    pickup: {
      pickupType: "airport",
      airports: pickAirports(["MGQ"]),
      dropOffZones: ["Hodan", "Abdiaziz", "Shibis", "KM4", "Lido Beach"],
      meetAndGreet: true
    },
    driver: {
      name: "Hassan",
      languages: ["Somali", "Arabic", "English"],
      verified: true,
      yearsExperience: 9,
      phone: "+252 61 000 0001",
      whatsapp: "+252 61 000 0001"
    },
    reviews: [
      { id: "r1", name: "Samira", rating: 5, dateISO: "2026-01-18", comment: "Great for our family. Car was clean and roomy." }
    ]
  },
  {
    id: "trp_pick_hrg_black_exec",
    kind: "airport_pickup",
    title: "Executive Black Car • Hargeisa (HGA)",
    vehicleType: "luxury",
    provider: { id: "prov_blacklane_horn", name: "Blacklane Horn", verified: true },
    rating: { score: 4.9, reviewsCount: 238 },
    capacity: 3,
    driverModes: ["with_driver"],
    features: ["ac", "wifi", "meet_greet", "water", "phone_charger"],
    freeCancellation: false,
    pricing: { amount: 48, unit: "per_trip", currency: "USD" },
    images: [
      { url: u("photo-1541899481282-d53bffe3c35d"), alt: "Executive black car" },
      { url: u("photo-1511919884226-fd3cad34687c"), alt: "Luxury vehicle" },
      { url: u("photo-1517520287167-4bbf64a00d66"), alt: "Premium interior" }
    ],
    overview: {
      description:
        "Premium executive pickup for business trips and VIP arrivals. Quiet ride, discreet service, and professional drivers.",
      highlights: ["Executive-grade comfort", "Professional verified driver", "Wi‑Fi + phone charging"]
    },
    whatsIncluded: ["One-way transfer", "Meet & greet", "45 minutes waiting time", "Premium water"],
    cancellationPolicy: "Cancellation fees may apply within 24 hours of pickup.",
    pickupInstructions:
      "Your driver will meet you at arrivals with your name. Vehicle details are shared after booking.",
    pickup: {
      pickupType: "airport",
      airports: pickAirports(["HGA"]),
      dropOffZones: ["Downtown Hargeisa", "New Hargeisa", "Airport Road"],
      meetAndGreet: true
    },
    driver: {
      name: "Mohamed",
      languages: ["Somali", "English"],
      verified: true,
      yearsExperience: 11,
      phone: "+252 63 000 0002",
      whatsapp: "+252 63 000 0002"
    },
    reviews: [
      { id: "r1", name: "Layla", rating: 5, dateISO: "2025-11-22", comment: "Very professional. Exactly what I needed for work." }
    ]
  },

  // Car rentals
  {
    id: "trp_rent_mog_sedan_selfdrive",
    kind: "car_rental",
    title: "Compact Sedan • Self-drive (Mogadishu)",
    vehicleType: "sedan",
    provider: { id: "prov_sahalrides", name: "Sahal Rides", verified: true },
    rating: { score: 4.6, reviewsCount: 312 },
    capacity: 5,
    driverModes: ["self_drive"],
    features: ["ac", "phone_charger"],
    freeCancellation: true,
    pricing: { amount: 29, unit: "per_day", currency: "USD", depositUsd: 120, includedKmPerDay: 200, extraKmRateUsd: 0.2 },
    images: [
      { url: u("photo-1511919884226-fd3cad34687c"), alt: "Sedan rental" },
      { url: u("photo-1483729558449-99ef09a8c325"), alt: "Car keys in hand" },
      { url: u("photo-1502877338535-766e1452684a"), alt: "City drive" }
    ],
    overview: {
      description:
        "Reliable daily sedan rental for city trips and errands. Transparent deposit and mileage so you can plan confidently.",
      highlights: ["Great value per day", "AC + phone charging", "Simple pickup process"]
    },
    whatsIncluded: ["Daily rental", "Basic insurance (placeholder)", "200 km/day included"],
    cancellationPolicy: "Free cancellation up to 24 hours before pickup.",
    pickupInstructions:
      "Pickup location and ID requirements are provided after booking. Bring a valid driver’s license and ID.",
    rental: {
      pickupLocations: ["Mogadishu Airport (MGQ)", "KM4", "Hodan"],
      minDays: 1,
      transmission: "automatic",
      fuelPolicy: "full_to_full",
      mileage: "limited",
      driverRequirement: "21_plus"
    },
    reviews: [
      { id: "r1", name: "Omar", rating: 5, dateISO: "2026-01-03", comment: "Easy pickup and good condition car." }
    ]
  },
  {
    id: "trp_rent_mog_suv_driver",
    kind: "car_rental",
    title: "SUV • With driver (Mogadishu)",
    vehicleType: "suv",
    provider: { id: "prov_dalmar", name: "Dalmar Mobility", verified: true },
    rating: { score: 4.8, reviewsCount: 401 },
    capacity: 6,
    driverModes: ["with_driver"],
    features: ["ac", "wifi", "water", "extra_luggage"],
    freeCancellation: true,
    pricing: { amount: 55, unit: "per_day", currency: "USD" },
    images: [
      { url: u("photo-1511919884226-fd3cad34687c"), alt: "SUV rental with driver" },
      { url: u("photo-1541899481282-d53bffe3c35d"), alt: "Premium transport" },
      { url: u("photo-1523987355523-c7b5b84a2b2e"), alt: "Spacious seats" }
    ],
    overview: {
      description:
        "A comfortable SUV with a vetted local driver — perfect for a smooth itinerary day with fewer logistics.",
      highlights: ["Driver included", "Wi‑Fi + water", "Luggage-friendly"]
    },
    whatsIncluded: ["Daily vehicle + driver", "8 hours service/day (placeholder)", "Wi‑Fi (where available)"],
    cancellationPolicy: "Free cancellation up to 24 hours before pickup.",
    pickupInstructions:
      "Your driver will meet you at your requested pickup spot within Mogadishu. Exact timing confirmed after booking.",
    rental: {
      pickupLocations: ["KM4", "Hodan", "Lido Beach", "Mogadishu Airport (MGQ)"],
      minDays: 1,
      transmission: "automatic",
      fuelPolicy: "prepaid",
      mileage: "limited",
      driverRequirement: "21_plus"
    },
    driver: {
      name: "Yusuf",
      languages: ["Somali", "English"],
      verified: true,
      yearsExperience: 8,
      phone: "+252 61 000 0003",
      whatsapp: "+252 61 000 0003"
    },
    reviews: [
      { id: "r1", name: "Farah", rating: 5, dateISO: "2025-12-12", comment: "Driver knew the city well. Very smooth day." }
    ]
  },
  {
    id: "trp_rent_hrg_van_group",
    kind: "car_rental",
    title: "Passenger Van • Group travel (Hargeisa)",
    vehicleType: "van",
    provider: { id: "prov_hornrentals", name: "Horn Rentals", verified: true },
    rating: { score: 4.5, reviewsCount: 188 },
    capacity: 10,
    driverModes: ["with_driver", "self_drive"],
    features: ["ac", "extra_luggage"],
    freeCancellation: false,
    pricing: { amount: 72, unit: "per_day", currency: "USD", depositUsd: 220 },
    images: [
      { url: u("photo-1525609004556-c46c7d6cf023"), alt: "Passenger van" },
      { url: u("photo-1523987355523-c7b5b84a2b2e"), alt: "Group seating" },
      { url: u("photo-1502877338535-766e1452684a"), alt: "Road trip" }
    ],
    overview: {
      description:
        "For teams and families: a high-capacity van with flexible driver options. Great for day trips and group airport runs.",
      highlights: ["Up to 10 passengers", "Flexible driver option", "Luggage-friendly"]
    },
    whatsIncluded: ["Daily rental", "Basic insurance (placeholder)"],
    cancellationPolicy: "Cancellation fees may apply within 48 hours of pickup.",
    pickupInstructions:
      "Pickup details and required documents are provided after booking. Driver option is confirmed at checkout.",
    rental: {
      pickupLocations: ["Hargeisa Airport (HGA)", "Downtown Hargeisa"],
      minDays: 2,
      transmission: "manual",
      fuelPolicy: "full_to_full",
      mileage: "limited",
      driverRequirement: "25_plus"
    },
    driver: {
      name: "Ismail",
      languages: ["Somali", "Arabic"],
      verified: true,
      yearsExperience: 10,
      phone: "+252 63 000 0004",
      whatsapp: "+252 63 000 0004"
    },
    reviews: [
      { id: "r1", name: "Nadia", rating: 4, dateISO: "2025-10-28", comment: "Good value for our group. Would use again." }
    ]
  }
]

export function getMockTransportById(id: string) {
  return MOCK_TRANSPORT.find((t) => t.id === id) ?? null
}

