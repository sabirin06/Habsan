"use client"

export type TravelerProfile = {
  id: string
  label: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  passportNumber: string
  passportExpiry: string
  gender?: string
  frequentFlyer?: string
}

export type TransportPassengerProfile = {
  id: string
  label: string
  firstName: string
  lastName: string
  phone?: string
}

export type AuthState = {
  version: 1
  isLoggedIn: boolean
  email?: string
  phone?: string
  travelers: TravelerProfile[]
  /** Transport passenger profiles (Phase 1). Kept optional for backward compatibility. */
  transportPassengers?: TransportPassengerProfile[]
}

const KEY = "auth:v1"

function safeParse<T>(input: string | null): T | null {
  if (!input) return null
  try {
    return JSON.parse(input) as T
  } catch {
    return null
  }
}

export function loadAuth(): AuthState {
  if (typeof window === "undefined") return { version: 1, isLoggedIn: false, travelers: [] }
  const existing = safeParse<AuthState>(window.localStorage.getItem(KEY))
  if (existing?.version === 1) return existing
  return { version: 1, isLoggedIn: false, travelers: [] }
}

export function saveAuth(next: AuthState) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(next))
}

export function signOut() {
  const a = loadAuth()
  saveAuth({ ...a, isLoggedIn: false })
}

export function signInEmail(email: string) {
  const a = loadAuth()
  saveAuth({
    ...a,
    isLoggedIn: true,
    email: email.trim() || a.email
  })
}

export function createAccountEmail(email: string, phone?: string) {
  const a = loadAuth()
  saveAuth({
    ...a,
    isLoggedIn: true,
    email: email.trim() || a.email,
    phone: phone?.trim() || a.phone
  })
}

export function upsertTraveler(profile: TravelerProfile) {
  const a = loadAuth()
  const idx = a.travelers.findIndex((t) => t.id === profile.id)
  const travelers = idx >= 0 ? a.travelers.map((t, i) => (i === idx ? profile : t)) : [profile, ...a.travelers]
  saveAuth({ ...a, travelers })
}

export function upsertTransportPassenger(profile: TransportPassengerProfile) {
  const a = loadAuth()
  const list = a.transportPassengers ?? []
  const idx = list.findIndex((p) => p.id === profile.id)
  const transportPassengers = idx >= 0 ? list.map((p, i) => (i === idx ? profile : p)) : [profile, ...list]
  saveAuth({ ...a, transportPassengers })
}

