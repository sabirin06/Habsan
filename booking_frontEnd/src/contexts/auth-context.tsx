"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  loadAuth,
  saveAuth,
  signOut as authSignOut,
  signInEmail as authSignInEmail,
  createAccountEmail as authCreateAccountEmail,
  type AuthState,
  type TravelerProfile,
  type TransportPassengerProfile
} from "@/lib/auth-storage"

type AuthContextType = {
  auth: AuthState
  isLoggedIn: boolean
  user: { email?: string; phone?: string; firstName?: string } | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (firstName: string, lastName: string, email: string, password: string, phone?: string) => Promise<void>
  signOut: () => void
  updateProfile: (updates: { email?: string; phone?: string; firstName?: string; lastName?: string }) => void
  addTraveler: (profile: TravelerProfile) => void
  addTransportPassenger: (profile: TransportPassengerProfile) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => loadAuth())

  // Sync auth state with localStorage
  useEffect(() => {
    const stored = loadAuth()
    setAuth(stored)
  }, [])

  const signIn = async (email: string, password: string) => {
    // In production, this would call an API
    // For now, we'll just simulate a successful login
    await new Promise((resolve) => setTimeout(resolve, 500))
    authSignInEmail(email)
    const updated = loadAuth()
    setAuth(updated)
  }

  const signUp = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone?: string
  ) => {
    // In production, this would call an API
    await new Promise((resolve) => setTimeout(resolve, 500))
    authCreateAccountEmail(email, phone)
    const updated = loadAuth()
    // Store first name in localStorage for personalization
    if (typeof window !== "undefined") {
      localStorage.setItem("user:firstName", firstName)
      localStorage.setItem("user:lastName", lastName)
    }
    setAuth(updated)
  }

  const signOut = () => {
    authSignOut()
    if (typeof window !== "undefined") {
      localStorage.removeItem("user:firstName")
      localStorage.removeItem("user:lastName")
    }
    const updated = loadAuth()
    setAuth(updated)
  }

  const updateProfile = (updates: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
  }) => {
    const current = loadAuth()
    const updated = {
      ...current,
      email: updates.email ?? current.email,
      phone: updates.phone ?? current.phone
    }
    saveAuth(updated)
    if (typeof window !== "undefined") {
      if (updates.firstName) localStorage.setItem("user:firstName", updates.firstName)
      if (updates.lastName) localStorage.setItem("user:lastName", updates.lastName)
    }
    setAuth(updated)
  }

  const addTraveler = (profile: TravelerProfile) => {
    const current = loadAuth()
    const idx = current.travelers.findIndex((t) => t.id === profile.id)
    const travelers =
      idx >= 0 ? current.travelers.map((t, i) => (i === idx ? profile : t)) : [profile, ...current.travelers]
    const updated = { ...current, travelers }
    saveAuth(updated)
    setAuth(updated)
  }

  const addTransportPassenger = (profile: TransportPassengerProfile) => {
    const current = loadAuth()
    const list = current.transportPassengers ?? []
    const idx = list.findIndex((p) => p.id === profile.id)
    const transportPassengers = idx >= 0 ? list.map((p, i) => (i === idx ? profile : p)) : [profile, ...list]
    const updated = { ...current, transportPassengers }
    saveAuth(updated)
    setAuth(updated)
  }

  const user = auth.isLoggedIn
    ? {
        email: auth.email,
        phone: auth.phone,
        firstName: typeof window !== "undefined" ? localStorage.getItem("user:firstName") ?? undefined : undefined
      }
    : null

  return (
    <AuthContext.Provider
      value={{
        auth,
        isLoggedIn: auth.isLoggedIn,
        user,
        signIn,
        signUp,
        signOut,
        updateProfile,
        addTraveler,
        addTransportPassenger
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
