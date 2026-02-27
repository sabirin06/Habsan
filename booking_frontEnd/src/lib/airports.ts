export type Airport = {
  code: string
  city: string
  country: string
  airport: string
}

/**
 * Curated, lightweight airport list.
 * - Good enough for production UI + demo environments.
 * - Swap to API-backed search later without changing UI contracts.
 */
export const AIRPORTS: Airport[] = [
  // East Africa
  { code: "NBO", city: "Nairobi", country: "Kenya", airport: "Jomo Kenyatta International" },
  { code: "MBA", city: "Mombasa", country: "Kenya", airport: "Moi International" },
  { code: "KIS", city: "Kisumu", country: "Kenya", airport: "Kisumu International" },
  { code: "EBB", city: "Entebbe", country: "Uganda", airport: "Entebbe International" },
  { code: "KGL", city: "Kigali", country: "Rwanda", airport: "Kigali International" },
  { code: "DAR", city: "Dar es Salaam", country: "Tanzania", airport: "Julius Nyerere International" },
  { code: "JRO", city: "Kilimanjaro", country: "Tanzania", airport: "Kilimanjaro International" },
  { code: "ZNZ", city: "Zanzibar", country: "Tanzania", airport: "Abeid Amani Karume International" },
  { code: "ADD", city: "Addis Ababa", country: "Ethiopia", airport: "Bole International" },
  // Southern Africa
  { code: "JNB", city: "Johannesburg", country: "South Africa", airport: "O. R. Tambo International" },
  { code: "CPT", city: "Cape Town", country: "South Africa", airport: "Cape Town International" },
  { code: "DUR", city: "Durban", country: "South Africa", airport: "King Shaka International" },
  { code: "HRE", city: "Harare", country: "Zimbabwe", airport: "Robert Gabriel Mugabe International" },
  { code: "LUN", city: "Lusaka", country: "Zambia", airport: "Kenneth Kaunda International" },
  { code: "GBE", city: "Gaborone", country: "Botswana", airport: "Sir Seretse Khama International" },
  // West Africa
  { code: "LOS", city: "Lagos", country: "Nigeria", airport: "Murtala Muhammed International" },
  { code: "ABV", city: "Abuja", country: "Nigeria", airport: "Nnamdi Azikiwe International" },
  { code: "ACC", city: "Accra", country: "Ghana", airport: "Kotoka International" },
  { code: "DKR", city: "Dakar", country: "Senegal", airport: "Blaise Diagne International" },
  { code: "ABJ", city: "Abidjan", country: "Côte d’Ivoire", airport: "Félix Houphouët-Boigny International" },
  { code: "CMN", city: "Casablanca", country: "Morocco", airport: "Mohammed V International" },
  // North Africa / Middle East hubs
  { code: "CAI", city: "Cairo", country: "Egypt", airport: "Cairo International" },
  { code: "HRG", city: "Hurghada", country: "Egypt", airport: "Hurghada International" },
  { code: "TUN", city: "Tunis", country: "Tunisia", airport: "Tunis–Carthage International" },
  { code: "ALG", city: "Algiers", country: "Algeria", airport: "Houari Boumediene" },
  { code: "DOH", city: "Doha", country: "Qatar", airport: "Hamad International" },
  { code: "DXB", city: "Dubai", country: "United Arab Emirates", airport: "Dubai International" },
  { code: "AUH", city: "Abu Dhabi", country: "United Arab Emirates", airport: "Zayed International" },
  { code: "RUH", city: "Riyadh", country: "Saudi Arabia", airport: "King Khalid International" },
  { code: "JED", city: "Jeddah", country: "Saudi Arabia", airport: "King Abdulaziz International" },
  { code: "IST", city: "Istanbul", country: "Türkiye", airport: "Istanbul Airport" },
  { code: "SAW", city: "Istanbul", country: "Türkiye", airport: "Sabiha Gökçen International" },
  // Europe
  { code: "LHR", city: "London", country: "United Kingdom", airport: "Heathrow" },
  { code: "LGW", city: "London", country: "United Kingdom", airport: "Gatwick" },
  { code: "CDG", city: "Paris", country: "France", airport: "Charles de Gaulle" },
  { code: "ORY", city: "Paris", country: "France", airport: "Orly" },
  { code: "AMS", city: "Amsterdam", country: "Netherlands", airport: "Schiphol" },
  { code: "FRA", city: "Frankfurt", country: "Germany", airport: "Frankfurt Airport" },
  { code: "MUC", city: "Munich", country: "Germany", airport: "Munich Airport" },
  { code: "MAD", city: "Madrid", country: "Spain", airport: "Adolfo Suárez Madrid–Barajas" },
  { code: "BCN", city: "Barcelona", country: "Spain", airport: "Barcelona–El Prat" },
  { code: "FCO", city: "Rome", country: "Italy", airport: "Leonardo da Vinci–Fiumicino" },
  { code: "MXP", city: "Milan", country: "Italy", airport: "Malpensa" },
  { code: "ZRH", city: "Zurich", country: "Switzerland", airport: "Zurich Airport" },
  { code: "VIE", city: "Vienna", country: "Austria", airport: "Vienna International" },
  { code: "BRU", city: "Brussels", country: "Belgium", airport: "Brussels Airport" },
  // Asia
  { code: "DEL", city: "Delhi", country: "India", airport: "Indira Gandhi International" },
  { code: "BOM", city: "Mumbai", country: "India", airport: "Chhatrapati Shivaji Maharaj International" },
  { code: "BLR", city: "Bengaluru", country: "India", airport: "Kempegowda International" },
  { code: "BKK", city: "Bangkok", country: "Thailand", airport: "Suvarnabhumi" },
  { code: "HKT", city: "Phuket", country: "Thailand", airport: "Phuket International" },
  { code: "SIN", city: "Singapore", country: "Singapore", airport: "Changi" },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", airport: "Kuala Lumpur International" },
  { code: "HKG", city: "Hong Kong", country: "Hong Kong", airport: "Hong Kong International" },
  { code: "ICN", city: "Seoul", country: "South Korea", airport: "Incheon International" },
  { code: "NRT", city: "Tokyo", country: "Japan", airport: "Narita International" },
  { code: "HND", city: "Tokyo", country: "Japan", airport: "Haneda" },
  { code: "PEK", city: "Beijing", country: "China", airport: "Beijing Capital International" },
  { code: "PVG", city: "Shanghai", country: "China", airport: "Shanghai Pudong International" },
  // Americas
  { code: "JFK", city: "New York", country: "United States", airport: "John F. Kennedy International" },
  { code: "LGA", city: "New York", country: "United States", airport: "LaGuardia" },
  { code: "EWR", city: "Newark", country: "United States", airport: "Newark Liberty International" },
  { code: "BOS", city: "Boston", country: "United States", airport: "Logan International" },
  { code: "IAD", city: "Washington, D.C.", country: "United States", airport: "Dulles International" },
  { code: "ATL", city: "Atlanta", country: "United States", airport: "Hartsfield–Jackson Atlanta International" },
  { code: "ORD", city: "Chicago", country: "United States", airport: "O'Hare International" },
  { code: "DFW", city: "Dallas", country: "United States", airport: "Dallas/Fort Worth International" },
  { code: "DEN", city: "Denver", country: "United States", airport: "Denver International" },
  { code: "LAX", city: "Los Angeles", country: "United States", airport: "Los Angeles International" },
  { code: "SFO", city: "San Francisco", country: "United States", airport: "San Francisco International" },
  { code: "SEA", city: "Seattle", country: "United States", airport: "Seattle–Tacoma International" },
  { code: "MIA", city: "Miami", country: "United States", airport: "Miami International" },
  { code: "YYZ", city: "Toronto", country: "Canada", airport: "Toronto Pearson International" },
  { code: "YUL", city: "Montreal", country: "Canada", airport: "Montréal–Trudeau International" },
  { code: "GRU", city: "São Paulo", country: "Brazil", airport: "São Paulo/Guarulhos International" },
  { code: "EZE", city: "Buenos Aires", country: "Argentina", airport: "Ministro Pistarini International" },
  // Oceania
  { code: "SYD", city: "Sydney", country: "Australia", airport: "Sydney Kingsford Smith" },
  { code: "MEL", city: "Melbourne", country: "Australia", airport: "Melbourne Airport" },
  { code: "AKL", city: "Auckland", country: "New Zealand", airport: "Auckland Airport" }
]

