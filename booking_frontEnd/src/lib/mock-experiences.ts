/* eslint-disable @next/next/no-img-element */
import type { Experience } from "@/lib/experience-types"

const u = (id: string) =>
  // Consistent, high-quality Unsplash sources (production should replace with CDN-managed assets).
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`

export const MOCK_EXPERIENCES: Experience[] = [
  {
    id: "exp_som_mogadishu_oldtown",
    title: "Mogadishu Old Town & Oceanfront Walk",
    category: "city_tours",
    badges: ["popular"],
    location: { city: "Mogadishu", country: "Somalia", region: "Benadir" },
    operator: { id: "op_dalmarplus", name: "DalmarPlus", verified: true },
    durationDays: 1,
    durationLabel: "Full day",
    groupType: "shared",
    groupSizeMin: 1,
    groupSizeMax: 14,
    languages: ["English", "Somali"],
    rating: { score: 4.7, reviewsCount: 312 },
    pricePerPerson: 55,
    currency: "USD",
    images: [
      { url: u("photo-1500530855697-b586d89ba3ee"), alt: "City streets and warm light" },
      { url: u("photo-1469474968028-56623f02e42e"), alt: "Coastline at golden hour" },
      { url: u("photo-1501785888041-af3ef285b470"), alt: "Wide landscape view" },
      { url: u("photo-1489515217757-5fd1be406fef"), alt: "Local market textures" }
    ],
    overview: {
      description:
        "A calm, curated intro to Mogadishu: historic streets, local craft stops, and a breezy oceanfront walk. Designed for first-timers who want culture without rushing.",
      highlights: ["Old Town walk with a local guide", "Oceanfront photo stops", "Street food tasting (optional)", "Small-group pace"],
      whoItsFor: ["First-time visitors", "Culture lovers", "Solo travelers", "Friends & couples"]
    },
    included: ["Licensed local guide", "Bottled water", "Pickup within central Mogadishu"],
    excluded: ["Meals", "Tips", "Personal purchases"],
    itinerary: [
      { day: 1, title: "Old Town → Oceanfront", summary: "Guided walk, craft stops, and a relaxed coastal route.", stops: ["Old Town lanes", "Craft market", "Oceanfront promenade"] }
    ],
    cancellationPolicy: "Free cancellation up to 24 hours before start time.",
    meetingPoint: { label: "Central Mogadishu (details after booking)" },
    whereYoullStay: { note: "Day tour — no overnight stay required." }
  },
  {
    id: "exp_som_hargeisa_laasgeel",
    title: "Laas Geel Cave Paintings Day Trip",
    category: "cultural",
    badges: ["hot_deal"],
    location: { city: "Hargeisa", country: "Somalia", region: "Somaliland" },
    operator: { id: "op_hornheritage", name: "Horn Heritage Guides", verified: true },
    durationDays: 1,
    durationLabel: "8–10 hours",
    groupType: "private",
    groupSizeMin: 1,
    groupSizeMax: 6,
    languages: ["English", "Somali"],
    rating: { score: 4.9, reviewsCount: 128 },
    pricePerPerson: 85,
    currency: "USD",
    images: [
      { url: u("photo-1523413651479-597eb2da0ad6"), alt: "Ancient rock textures" },
      { url: u("photo-1452626038306-9aae5e071dd3"), alt: "Desert road and horizon" },
      { url: u("photo-1500530855697-b586d89ba3ee"), alt: "Warm light on stone" }
    ],
    overview: {
      description:
        "Visit one of the Horn of Africa’s most important heritage sites. Your guide brings the rock art to life with context, storytelling, and unhurried time on-site.",
      highlights: ["UNESCO-candidate heritage site", "Private vehicle & guide", "Best photo timing guidance"],
      whoItsFor: ["History & archaeology fans", "Photographers", "Private groups"]
    },
    included: ["Private transport", "Guide", "Entry coordination"],
    excluded: ["Meals", "Tips"],
    itinerary: [
      { day: 1, title: "Hargeisa → Laas Geel", summary: "Morning departure, guided heritage visit, return by evening." }
    ],
    cancellationPolicy: "Free cancellation up to 48 hours before start time.",
    meetingPoint: { label: "Hotel pickup in Hargeisa" },
    whereYoullStay: { note: "Day tour — pair it with a stay in Hargeisa." }
  },
  {
    id: "exp_som_berbera_beach",
    title: "Berbera Beach Escape & Snorkel (Seasonal)",
    category: "beach",
    badges: ["new"],
    location: { city: "Berbera", country: "Somalia", region: "Somaliland" },
    operator: { id: "op_redsea", name: "Red Sea Adventures", verified: true },
    durationDays: 2,
    durationLabel: "2 days • 1 night",
    groupType: "shared",
    groupSizeMin: 2,
    groupSizeMax: 12,
    languages: ["English", "Somali", "Arabic"],
    rating: { score: 4.6, reviewsCount: 76 },
    pricePerPerson: 140,
    currency: "USD",
    images: [
      { url: u("photo-1500375592092-40eb2168fd21"), alt: "Turquoise shoreline" },
      { url: u("photo-1526481280695-3c687fd643ed"), alt: "Snorkeling and reef water" },
      { url: u("photo-1523413651479-597eb2da0ad6"), alt: "Coastal rock formations" }
    ],
    overview: {
      description:
        "A soft-adventure coastal reset: beach time, optional snorkel, and a comfortable overnight. Built for families and friends who want a premium, relaxed pace.",
      highlights: ["Beach picnic setup", "Optional snorkel session", "Sunset + stargazing"],
      whoItsFor: ["Families", "Friends", "Beach lovers"]
    },
    included: ["Transport", "Guide", "Beach picnic setup"],
    excluded: ["Accommodation (can be added at checkout)", "Snorkel gear rental (if needed)"],
    itinerary: [
      { day: 1, title: "Arrival + beach time", summary: "Settle in, ocean time, sunset." },
      { day: 2, title: "Snorkel + return", summary: "Optional snorkel, relaxed brunch, return." }
    ],
    cancellationPolicy: "Flexible cancellation up to 72 hours before departure.",
    meetingPoint: { label: "Berbera city center pickup" },
    whereYoullStay: { note: "We’ll recommend partner stays near the coast." }
  },
  {
    id: "exp_som_kismayo_nature",
    title: "Kismayo Mangroves & Nature Walk",
    category: "nature",
    badges: ["popular"],
    location: { city: "Kismayo", country: "Somalia", region: "Jubaland" },
    operator: { id: "op_jubagreen", name: "Juba Green Trails", verified: true },
    durationDays: 1,
    durationLabel: "Half day",
    groupType: "shared",
    groupSizeMin: 1,
    groupSizeMax: 10,
    languages: ["English", "Somali"],
    rating: { score: 4.5, reviewsCount: 54 },
    pricePerPerson: 45,
    currency: "USD",
    images: [
      { url: u("photo-1441974231531-c6227db76b6e"), alt: "Green forest path" },
      { url: u("photo-1500530855697-b586d89ba3ee"), alt: "Warm nature light" }
    ],
    overview: {
      description:
        "A low-effort nature reset through mangrove edges and calm walking trails. Expect birds, shade, and a guide who keeps the pace comfortable.",
      highlights: ["Nature-first pace", "Birdwatching-friendly stops", "Small group"],
      whoItsFor: ["Nature lovers", "Families", "Light walkers"]
    },
    included: ["Guide", "Water", "Local transport coordination"],
    excluded: ["Meals"],
    itinerary: [{ day: 1, title: "Mangrove walk", summary: "Easy trail with guide + scenic breaks." }],
    cancellationPolicy: "Free cancellation up to 24 hours before start time.",
    meetingPoint: { label: "Kismayo meeting point (details after booking)" }
  },
  // A few Africa-wide teasers (still aligned with the Experiences module vision)
  {
    id: "exp_tza_zanzibar_spice",
    title: "Zanzibar Spice Farm & Stone Town Heritage",
    category: "cultural",
    badges: ["popular"],
    location: { city: "Zanzibar", country: "Tanzania" },
    operator: { id: "op_islandroots", name: "Island Roots Co.", verified: true },
    durationDays: 1,
    durationLabel: "Full day",
    groupType: "shared",
    groupSizeMin: 1,
    groupSizeMax: 16,
    languages: ["English", "Swahili"],
    rating: { score: 4.8, reviewsCount: 904 },
    pricePerPerson: 62,
    currency: "USD",
    images: [
      { url: u("photo-1523413651479-597eb2da0ad6"), alt: "Heritage walls and textures" },
      { url: u("photo-1470071459604-3b5ec3a7fe05"), alt: "Tropical greenery" }
    ],
    overview: {
      description:
        "A classic Zanzibar day: guided spice farm visit, then a calm, story-rich walk through Stone Town’s heritage lanes.",
      highlights: ["Spice tasting + farm tour", "Stone Town heritage walk", "Operator-vetted guides"],
      whoItsFor: ["Culture lovers", "First-time Zanzibar visitors"]
    },
    included: ["Guide", "Entry coordination"],
    excluded: ["Meals", "Tips"],
    itinerary: [{ day: 1, title: "Spice farm → Stone Town", summary: "Tastes, stories, and heritage streets." }],
    cancellationPolicy: "Free cancellation up to 24 hours before start time.",
    meetingPoint: { label: "Stone Town pickup zone" }
  }
]

export function getMockExperienceById(id: string) {
  return MOCK_EXPERIENCES.find((e) => e.id === id) ?? null
}

