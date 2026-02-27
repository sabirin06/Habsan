"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { loadAuth } from "@/lib/auth-storage"
import { toast } from "sonner"

const KEY = "travelpro:favorites:transport"

function safeParse(input: string | null): string[] {
  if (!input) return []
  try {
    const v = JSON.parse(input) as unknown
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []
  } catch {
    return []
  }
}

function save(ids: string[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(ids))
}

export function useTransportFavorites(serviceId: string) {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return
    setIds(safeParse(window.localStorage.getItem(KEY)))
  }, [])

  const isFavorite = useMemo(() => ids.includes(serviceId), [ids, serviceId])

  const toggle = useCallback(async () => {
    const next = isFavorite ? ids.filter((x) => x !== serviceId) : Array.from(new Set([...ids, serviceId]))
    setIds(next)
    save(next)
    toast.success(isFavorite ? "Removed from wishlist" : "Saved to wishlist")

    // If logged in, best-effort API sync (won't break if endpoint doesn't exist yet).
    const auth = loadAuth()
    if (auth.isLoggedIn) {
      try {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transportId: serviceId, favorite: !isFavorite })
        })
      } catch {
        // ignore
      }
    }
  }, [ids, isFavorite, serviceId])

  return { isFavorite, toggleFavorite: toggle, favorites: ids }
}

