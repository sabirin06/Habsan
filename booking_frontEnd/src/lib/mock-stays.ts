import type { Apartment, Hotel, Stay, StayAmenity } from "./stay-types"

const amenity = (...a: StayAmenity[]) => a

const COMMON_IMAGES = {
  hotel1: [
    {
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop&crop=center",
      alt: "Modern hotel lobby"
    },
    {
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=800&fit=crop&crop=center",
      alt: "Hotel room interior"
    },
    {
      url: "https://images.unsplash.com/photo-1551887373-6c5bd0f28f83?w=1200&h=800&fit=crop&crop=center",
      alt: "Hotel pool at sunset"
    }
  ],
  hotel2: [
    {
      url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=800&fit=crop&crop=center",
      alt: "Hotel exterior"
    },
    {
      url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&h=800&fit=crop&crop=center",
      alt: "Hotel bedroom"
    },
    {
      url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&h=800&fit=crop&crop=center",
      alt: "Breakfast buffet"
    }
  ],
  apt1: [
    {
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop&crop=center",
      alt: "Apartment living room"
    },
    {
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop&crop=center",
      alt: "Apartment bedroom"
    },
    {
      url: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1200&h=800&fit=crop&crop=center",
      alt: "Apartment kitchen"
    }
  ],
  apt2: [
    {
      url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop&crop=center",
      alt: "Cozy apartment"
    },
    {
      url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&h=800&fit=crop&crop=center",
      alt: "Apartment balcony view"
    },
    {
      url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&h=800&fit=crop&crop=center",
      alt: "Apartment bathroom"
    }
  ]
} as const

export const MOCK_HOTELS: Hotel[] = [
  {
    id: "hotel_mogadishu_seaview",
    type: "hotel",
    name: "SeaView Grand Hotel",
    location: { city: "Mogadishu", country: "Somalia", lat: 2.0469, lng: 45.3182 },
    images: COMMON_IMAGES.hotel1,
    pricePerNight: 145,
    guestRating: 8.9,
    reviewsCount: 1247,
    amenities: amenity("wifi", "pool", "gym", "breakfast", "restaurant", "ac", "parking"),
    distanceKm: 2.4,
    stars: 5,
    chain: "SeaView Collection",
    breakfastIncluded: true,
    freeCancellation: true,
    rooms: [
      { id: "r_deluxe_king", name: "Deluxe King", capacity: 2, refundable: true, breakfastIncluded: true, pricePerNight: 165 },
      { id: "r_family_suite", name: "Family Suite", capacity: 4, refundable: true, breakfastIncluded: true, pricePerNight: 220 }
    ],
    policies: { checkInFrom: "14:00", checkOutBy: "11:00", smokingAllowed: false, petsAllowed: false }
  },
  {
    id: "hotel_bosaso_harbor",
    type: "hotel",
    name: "Bosaso Harbor Hotel",
    location: { city: "Bosaso", country: "Somalia", lat: 11.2842, lng: 49.1816 },
    images: COMMON_IMAGES.hotel2,
    pricePerNight: 92,
    guestRating: 8.2,
    reviewsCount: 642,
    amenities: amenity("wifi", "breakfast", "parking", "ac", "workspace"),
    distanceKm: 1.1,
    stars: 4,
    chain: "Harbor Hotels",
    breakfastIncluded: true,
    freeCancellation: false,
    rooms: [
      { id: "r_standard", name: "Standard Room", capacity: 2, refundable: false, breakfastIncluded: true, pricePerNight: 92 },
      { id: "r_executive", name: "Executive Room", capacity: 2, refundable: true, breakfastIncluded: true, pricePerNight: 125 }
    ],
    policies: { checkInFrom: "15:00", checkOutBy: "11:00", smokingAllowed: false, petsAllowed: false }
  },
  {
    id: "hotel_hargeisa_city",
    type: "hotel",
    name: "Hargeisa City Suites",
    location: { city: "Hargeisa", country: "Somaliland", lat: 9.5624, lng: 44.0770 },
    images: COMMON_IMAGES.hotel1,
    pricePerNight: 78,
    guestRating: 7.9,
    reviewsCount: 511,
    amenities: amenity("wifi", "restaurant", "ac", "workspace"),
    distanceKm: 4.8,
    stars: 3,
    chain: "City Suites",
    breakfastIncluded: false,
    freeCancellation: true,
    rooms: [
      { id: "r_compact", name: "Compact Double", capacity: 2, refundable: true, breakfastIncluded: false, pricePerNight: 78 },
      { id: "r_twin", name: "Twin Room", capacity: 2, refundable: true, breakfastIncluded: false, pricePerNight: 84 }
    ],
    policies: { checkInFrom: "13:00", checkOutBy: "12:00", smokingAllowed: false, petsAllowed: false }
  }
]

export const MOCK_APARTMENTS: Apartment[] = [
  {
    id: "apt_mogadishu_ocean_loft",
    type: "apartment",
    name: "Ocean Loft Apartment",
    location: { city: "Mogadishu", country: "Somalia", lat: 2.0601, lng: 45.3303 },
    images: COMMON_IMAGES.apt1,
    pricePerNight: 68,
    guestRating: 9.1,
    reviewsCount: 312,
    amenities: amenity("wifi", "kitchen", "washer", "ac", "workspace", "parking"),
    distanceKm: 3.1,
    host: { name: "Ayaan", badge: "Superhost" },
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    entirePlace: true,
    cleaningFee: 18,
    longStayDiscountPct: 12,
    houseRules: ["No smoking", "Quiet hours after 10pm", "No parties"],
    spaceDescription: "A calm, light-filled loft with a full kitchen and fast Wi‑Fi. Perfect for work trips or relaxed weekends."
  },
  {
    id: "apt_bosaso_central_flat",
    type: "apartment",
    name: "Central Flat • Walkable",
    location: { city: "Bosaso", country: "Somalia", lat: 11.2882, lng: 49.1801 },
    images: COMMON_IMAGES.apt2,
    pricePerNight: 54,
    guestRating: 8.6,
    reviewsCount: 189,
    amenities: amenity("wifi", "kitchen", "ac"),
    distanceKm: 0.9,
    host: { name: "Hassan" },
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    entirePlace: false,
    cleaningFee: 12,
    longStayDiscountPct: 8,
    houseRules: ["No smoking", "No pets"],
    spaceDescription: "A practical 2‑bed flat near shops and cafes. Great value for families and longer stays."
  },
  {
    id: "apt_hargeisa_garden_suite",
    type: "apartment",
    name: "Garden Suite Apartment",
    location: { city: "Hargeisa", country: "Somaliland", lat: 9.5612, lng: 44.0742 },
    images: COMMON_IMAGES.apt1,
    pricePerNight: 61,
    guestRating: 8.8,
    reviewsCount: 241,
    amenities: amenity("wifi", "kitchen", "washer", "parking", "workspace"),
    distanceKm: 5.2,
    host: { name: "Sahal", badge: "Top Host" },
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    entirePlace: true,
    cleaningFee: 14,
    longStayDiscountPct: 10,
    houseRules: ["No parties", "Respect neighbors"],
    spaceDescription: "Comfortable suite with a garden view, washer, and desk setup — designed for 7+ night work stays."
  }
]

export const MOCK_STAYS: Stay[] = [...MOCK_HOTELS, ...MOCK_APARTMENTS]

export function getMockStayById(id: string): Stay | undefined {
  return MOCK_STAYS.find((s) => s.id === id)
}

