import type { Airport } from "./airports"

export type AirportSearchResult = Airport & {
  /** Preformatted for UI list rendering */
  label: string
  /** Used for ranking / highlighting */
  _score: number
}

function normalize(q: string) {
  return q.trim().toLowerCase()
}

function scoreAirport(a: Airport, qRaw: string): number {
  const q = normalize(qRaw)
  if (!q) return 0

  const code = a.code.toLowerCase()
  const city = a.city.toLowerCase()
  const country = a.country.toLowerCase()
  const airport = a.airport.toLowerCase()

  // Strong signals
  if (code === q) return 1000
  if (code.startsWith(q)) return 900

  // Medium signals
  if (city === q) return 750
  if (city.startsWith(q)) return 650
  if (airport.startsWith(q)) return 600

  // Weak signals
  let s = 0
  if (city.includes(q)) s += 250
  if (airport.includes(q)) s += 200
  if (country.includes(q)) s += 120

  // Prefer exact word matches
  const tokens = q.split(/\s+/).filter(Boolean)
  for (const t of tokens) {
    if (code === t) s += 400
    if (city.split(/\s+/).includes(t)) s += 120
    if (airport.split(/\s+/).includes(t)) s += 100
  }

  return s
}

export function formatAirportLabel(a: Airport) {
  return `${a.city}, ${a.country} • ${a.airport} (${a.code})`
}

export function searchAirports(
  airports: Airport[],
  query: string,
  opts?: {
    limit?: number
    excludeCodes?: string[]
  }
): AirportSearchResult[] {
  const q = normalize(query)
  const limit = opts?.limit ?? 10
  const exclude = new Set((opts?.excludeCodes ?? []).map((c) => c.toUpperCase()))

  if (!q) return []

  const results: AirportSearchResult[] = []
  for (const a of airports) {
    if (exclude.has(a.code.toUpperCase())) continue
    const _score = scoreAirport(a, q)
    if (_score <= 0) continue
    results.push({ ...a, label: formatAirportLabel(a), _score })
  }

  results.sort((x, y) => {
    if (y._score !== x._score) return y._score - x._score
    // stable tie-breakers
    if (x.city !== y.city) return x.city.localeCompare(y.city)
    return x.code.localeCompare(y.code)
  })

  return results.slice(0, limit)
}

