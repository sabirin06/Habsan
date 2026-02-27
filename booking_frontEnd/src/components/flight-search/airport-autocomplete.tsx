"use client"

import * as React from "react"
import type { Airport } from "@/lib/airports"
import { AIRPORTS } from "@/lib/airports"
import { searchAirports } from "@/lib/airport-search"

type Props = {
  id: string
  label: string
  placeholder?: string
  value: Airport | null
  onChange: (next: Airport | null) => void
  excludeCodes?: string[]
  required?: boolean
  describedBy?: string
  error?: string
  onBlur?: () => void
}

export function AirportAutocomplete({
  id,
  label,
  placeholder,
  value,
  onChange,
  excludeCodes,
  required,
  describedBy,
  error,
  onBlur
}: Props) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const listId = `${id}-listbox`

  const [query, setQuery] = React.useState<string>(value ? `${value.city} (${value.code})` : "")
  const [open, setOpen] = React.useState(false)
  const [highlighted, setHighlighted] = React.useState(0)

  const results = React.useMemo(() => {
    if (!open) return []
    return searchAirports(AIRPORTS, query, { excludeCodes, limit: 8 })
  }, [excludeCodes, open, query])

  // Keep display string in sync when selection changes externally.
  React.useEffect(() => {
    if (open) return
    setQuery(value ? `${value.city} (${value.code})` : "")
  }, [open, value])

  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current) return
      if (e.target instanceof Node && rootRef.current.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [])

  const activeOptionId = open && results[highlighted] ? `${id}-opt-${results[highlighted].code}` : undefined

  const commit = React.useCallback(
    (a: Airport) => {
      onChange(a)
      setOpen(false)
      setTimeout(() => inputRef.current?.focus(), 0)
    },
    [onChange]
  )

  return (
    <div ref={rootRef} className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground flex items-center gap-2">
        {label}
        {required ? <span className="text-muted-foreground">*</span> : null}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setHighlighted(0)
            if (value) onChange(null)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            onBlur?.()
            // Close only if focus moved outside this component.
            window.setTimeout(() => {
              const root = rootRef.current
              if (!root) return
              const active = document.activeElement
              if (active instanceof Node && root.contains(active)) return
              setOpen(false)
            }, 0)
          }}
          placeholder={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={activeOptionId}
          aria-invalid={!!error}
          aria-describedby={[describedBy, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined}
          className={[
            "clean-input",
            "dark:bg-input dark:text-foreground",
            error ? "border-destructive/60 focus-visible:ring-destructive/20" : ""
          ].join(" ")}
          onKeyDown={(e) => {
            if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
              setOpen(true)
              return
            }

            if (e.key === "Escape") {
              setOpen(false)
              setQuery(value ? `${value.city} (${value.code})` : "")
              return
            }

            if (!open) return

            if (e.key === "ArrowDown") {
              e.preventDefault()
              setHighlighted((h) => Math.min(h + 1, Math.max(0, results.length - 1)))
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setHighlighted((h) => Math.max(h - 1, 0))
            } else if (e.key === "Enter") {
              const pick = results[highlighted]
              if (pick) {
                e.preventDefault()
                commit(pick)
              }
            }
          }}
        />

        {open && results.length > 0 ? (
          <div
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg"
            role="presentation"
          >
            <ul id={listId} role="listbox" className="max-h-72 overflow-auto py-1">
              {results.map((r, idx) => (
                <li
                  key={r.code}
                  id={`${id}-opt-${r.code}`}
                  role="option"
                  aria-selected={idx === highlighted}
                  className={[
                    "px-3 py-2 cursor-pointer select-none",
                    idx === highlighted ? "bg-accent" : "hover:bg-accent/60"
                  ].join(" ")}
                  onMouseEnter={() => setHighlighted(idx)}
                  onMouseDown={(e) => {
                    // prevent input blur before selection
                    e.preventDefault()
                    commit(r)
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {r.city}, {r.country}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{r.airport}</div>
                    </div>
                    <div className="shrink-0 text-xs font-semibold text-foreground/90 rounded-md border border-border px-2 py-0.5">
                      {r.code}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive leading-relaxed">
          {error}
        </p>
      ) : null}
    </div>
  )
}

