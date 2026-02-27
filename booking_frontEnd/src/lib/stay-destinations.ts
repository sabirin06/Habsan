export type StayDestination = {
  city: string
  country: string
  imageUrl: string
  avgPricePerNight: number
  propertyCount: number
}

export const AFRICA_STAY_DESTINATIONS: StayDestination[] = [
  {
    city: "Mogadishu",
    country: "Somalia",
    imageUrl: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&h=800&fit=crop&crop=center",
    avgPricePerNight: 88,
    propertyCount: 124
  },
  {
    city: "Hargeisa",
    country: "Somaliland",
    imageUrl: "https://images.unsplash.com/photo-1544986581-efac024faf62?w=1200&h=800&fit=crop&crop=center",
    avgPricePerNight: 72,
    propertyCount: 87
  },
  {
    city: "Nairobi",
    country: "Kenya",
    imageUrl: "https://images.unsplash.com/photo-1557862921-37829c790f19?w=1200&h=800&fit=crop&crop=center",
    avgPricePerNight: 112,
    propertyCount: 318
  },
  {
    city: "Addis Ababa",
    country: "Ethiopia",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=800&fit=crop&crop=center",
    avgPricePerNight: 96,
    propertyCount: 205
  },
  {
    city: "Zanzibar",
    country: "Tanzania",
    imageUrl: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=1200&h=800&fit=crop&crop=center",
    avgPricePerNight: 138,
    propertyCount: 276
  },
  {
    city: "Dakar",
    country: "Senegal",
    imageUrl: "https://images.unsplash.com/photo-1467320424268-f91a16cf7c77?w=1200&h=800&fit=crop&crop=center",
    avgPricePerNight: 104,
    propertyCount: 194
  }
]

export function fmtDestinationLabel(d: Pick<StayDestination, "city" | "country">) {
  return `${d.city}, ${d.country}`
}

