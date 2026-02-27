"use client"

import type { SearchData } from "@/components/sections/flight-search-compact"
import type { StayBookingDraftData } from "@/lib/stay-types"
import type { ExperienceBookingDraftData } from "@/lib/experience-types"
import type { TransportBookingDraftData } from "@/lib/transport-types"

export type FlightBookingDraft = {
  version: 2
  kind: "flight"
  createdAt: number
  returnUrl?: string
  searchData?: SearchData
  legs: Array<{ label: string; from: string; to: string }>
  selectedByLeg: Record<number, string | undefined>
}

export type StayBookingDraft = {
  version: 2
  kind: "stay"
  createdAt: number
  returnUrl?: string
  stay: StayBookingDraftData
}

export type ExperienceBookingDraft = {
  version: 2
  kind: "experience"
  createdAt: number
  returnUrl?: string
  experience: ExperienceBookingDraftData
}

export type TransportBookingDraft = {
  version: 2
  kind: "transport"
  createdAt: number
  returnUrl?: string
  transport: TransportBookingDraftData
}

export type BookingDraft = FlightBookingDraft | StayBookingDraft | ExperienceBookingDraft | TransportBookingDraft

type LegacyFlightDraftV1 = {
  version: 1
  createdAt: number
  returnUrl?: string
  searchData?: SearchData
  legs: Array<{ label: string; from: string; to: string }>
  selectedByLeg: Record<number, string | undefined>
}

export type FlightBookingReceipt = {
  version: 2
  kind: "flight"
  bookingId: string
  createdAt: number
  draft: FlightBookingDraft
  passengers: Array<{
    type: "adult" | "child" | "infant"
    firstName: string
    lastName: string
    dateOfBirth: string
    nationality: string
    passportNumber: string
    passportExpiry: string
    gender?: string
    frequentFlyer?: string
    age?: number
  }>
  contact: { email: string; phone: string }
  extras: { baggage: boolean; meals: boolean; seatSelection: boolean }
  payment: { method: "card" | "mobile_money"; last4?: string }
  totals: {
    perTraveler: number
    travelers: number
    extrasTotal: number
    total: number
  }
}

export type StayBookingReceipt = {
  version: 2
  kind: "stay"
  bookingId: string
  createdAt: number
  draft: StayBookingDraft
  guests: Array<{ firstName: string; lastName: string }>
  contact: { email: string; phone: string }
  payment: { method: "card" | "mobile_money"; last4?: string }
  totals: {
    nights: number
    pricePerNight: number
    fees: number
    discount: number
    total: number
    currency: "USD"
  }
}

export type ExperienceBookingReceipt = {
  version: 2
  kind: "experience"
  bookingId: string
  createdAt: number
  draft: ExperienceBookingDraft
  travelers: Array<{ firstName: string; lastName: string; dateOfBirth: string }>
  contact: { email: string; phone: string }
  payment: { method: "card" | "mobile_money"; last4?: string }
  totals: {
    pricePerPerson: number
    travelers: number
    fees: number
    total: number
    currency: "USD"
  }
}

export type TransportBookingReceipt = {
  version: 2
  kind: "transport"
  bookingId: string
  createdAt: number
  draft: TransportBookingDraft
  passengers: Array<{ firstName: string; lastName: string; phone?: string }>
  contact: { email: string; phone: string }
  payment: { method: "card" | "mobile_money"; last4?: string }
  totals: {
    amount: number
    unit: "per_trip" | "per_day"
    days?: number
    fees: number
    total: number
    currency: "USD"
  }
}

export type BookingReceipt = FlightBookingReceipt | StayBookingReceipt | ExperienceBookingReceipt | TransportBookingReceipt

type LegacyFlightReceiptV1 = {
  version: 1
  bookingId: string
  createdAt: number
  draft: LegacyFlightDraftV1
  passengers: FlightBookingReceipt["passengers"]
  contact: { email: string; phone: string }
  extras: { baggage: boolean; meals: boolean; seatSelection: boolean }
  payment: { method: "card" | "mobile_money"; last4?: string }
  totals: {
    perTraveler: number
    travelers: number
    extrasTotal: number
    total: number
  }
}

const DRAFT_KEY = "booking:draft:v1"
const RECEIPT_PREFIX = "booking:receipt:v1:"

function safeParse<T>(input: string | null): T | null {
  if (!input) return null
  try {
    return JSON.parse(input) as T
  } catch {
    return null
  }
}

export function saveBookingDraft(draft: BookingDraft) {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

export function loadBookingDraft(): BookingDraft | null {
  if (typeof window === "undefined") return null
  const raw = safeParse<any>(window.sessionStorage.getItem(DRAFT_KEY))
  if (!raw) return null
  if (raw.version === 2 && (raw.kind === "flight" || raw.kind === "stay" || raw.kind === "experience" || raw.kind === "transport"))
    return raw as BookingDraft
  if (raw.version === 1 && Array.isArray(raw.legs) && typeof raw.createdAt === "number") {
    const legacy = raw as LegacyFlightDraftV1
    const migrated: FlightBookingDraft = {
      version: 2,
      kind: "flight",
      createdAt: legacy.createdAt,
      returnUrl: legacy.returnUrl,
      searchData: legacy.searchData,
      legs: legacy.legs,
      selectedByLeg: legacy.selectedByLeg ?? {}
    }
    return migrated
  }
  return null
}

export function clearBookingDraft() {
  if (typeof window === "undefined") return
  window.sessionStorage.removeItem(DRAFT_KEY)
}

export function saveBookingReceipt(receipt: BookingReceipt) {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(`${RECEIPT_PREFIX}${receipt.bookingId}`, JSON.stringify(receipt))
}

export function loadBookingReceipt(bookingId: string): BookingReceipt | null {
  if (typeof window === "undefined") return null
  const raw = safeParse<any>(window.sessionStorage.getItem(`${RECEIPT_PREFIX}${bookingId}`))
  if (!raw) return null
  if (raw.version === 2 && (raw.kind === "flight" || raw.kind === "stay" || raw.kind === "experience" || raw.kind === "transport"))
    return raw as BookingReceipt
  if (raw.version === 1 && raw.draft?.version === 1) {
    const legacy = raw as LegacyFlightReceiptV1
    const migratedDraft: FlightBookingDraft = {
      version: 2,
      kind: "flight",
      createdAt: legacy.draft.createdAt,
      returnUrl: legacy.draft.returnUrl,
      searchData: legacy.draft.searchData,
      legs: legacy.draft.legs,
      selectedByLeg: legacy.draft.selectedByLeg ?? {}
    }
    const migrated: FlightBookingReceipt = {
      version: 2,
      kind: "flight",
      bookingId: legacy.bookingId,
      createdAt: legacy.createdAt,
      draft: migratedDraft,
      passengers: legacy.passengers,
      contact: legacy.contact,
      extras: legacy.extras,
      payment: legacy.payment,
      totals: legacy.totals
    }
    return migrated
  }
  return null
}

