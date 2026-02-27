"use client"

import * as React from "react"
import { Users, Minus, Plus } from "lucide-react"
import { useFocusTrap } from "./focus-trap"

export type PassengerState = {
  adults: number
  infants: number
  childrenAges: number[] // each 2..17
}

type Props = {
  id: string
  label: string
  value: PassengerState
  onChange: (next: PassengerState) => void
  error?: string
  onBlur?: () => void
}

function clampPassengers(next: PassengerState): PassengerState {
  const adults = Math.max(1, Math.min(9, next.adults))
  const infants = Math.max(0, Math.min(adults, next.infants))
  const childrenAges = next.childrenAges.map((a) => Math.max(2, Math.min(17, a))).slice(0, 15)
  return { adults, infants, childrenAges }
}

function plural(n: number, one: string, many?: string) {
  if (n === 1) return `${n} ${one}`
  return `${n} ${many ?? `${one}s`}`
}

export function formatPassengerSummary(p: PassengerState) {
  const parts: string[] = []
  parts.push(plural(p.adults, "Adult"))
  if (p.childrenAges.length > 0) {
    const ages = p.childrenAges.slice(0, 3).map((a) => `${a}y`)
    const ageText =
      p.childrenAges.length === 1
        ? ` (${ages[0]})`
        : p.childrenAges.length <= 3
          ? ` (${ages.join(", ")})`
          : ""
    parts.push(`${plural(p.childrenAges.length, "Child", "Children")}${ageText}`)
  }
  if (p.infants > 0) parts.push(plural(p.infants, "Infant"))
  return parts.join(", ")
}

function Stepper({
  value,
  min,
  max,
  onChange
}: {
  value: number
  min: number
  max: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="h-9 w-9 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="w-8 text-center text-sm font-semibold tabular-nums">{value}</div>
      <button
        type="button"
        className="h-9 w-9 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

export function PassengerPicker({ id, label, value, onChange, error, onBlur }: Props) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)
  const [open, setOpen] = React.useState(false)
  const [placement, setPlacement] = React.useState<"bottom" | "top">("bottom")

  useFocusTrap(panelRef, open)

  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current) return
      if (e.target instanceof Node && rootRef.current.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [])

  React.useEffect(() => {
    if (!open) return
    const btn = buttonRef.current
    if (!btn) return

    const rect = btn.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    // heuristic: flip if we likely won't fit below
    const shouldFlip = spaceBelow < 420 && spaceAbove > spaceBelow
    setPlacement(shouldFlip ? "top" : "bottom")
  }, [open, value.childrenAges.length])

  const summary = formatPassengerSummary(value)

  return (
    <div ref={rootRef} className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        {label}
      </label>

      <div className="relative">
        <button
          ref={buttonRef}
          id={id}
          type="button"
          className={[
            "clean-input flex items-center justify-between gap-3 text-left",
            "dark:bg-input dark:text-foreground",
            error ? "border-destructive/60 focus-visible:ring-destructive/20" : ""
          ].join(" ")}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((o) => !o)}
          onBlur={() => onBlur?.()}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false)
            if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
              setOpen(true)
            }
          }}
        >
          <span className="truncate text-sm">{summary}</span>
          <span className="text-xs text-muted-foreground">Edit</span>
        </button>

        {open ? (
          <div
            ref={panelRef}
            id={`${id}-panel`}
            role="dialog"
            aria-label="Passenger selection"
            className={[
              "absolute z-50 w-full max-w-md rounded-xl border border-border bg-card shadow-lg",
              "max-h-[70vh] overflow-hidden flex flex-col",
              placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
            ].join(" ")}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false)
            }}
          >
            <div className="p-4 space-y-4 overflow-auto flex-1">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Adults</div>
                  <div className="text-xs text-muted-foreground">18+</div>
                </div>
                <Stepper
                  value={value.adults}
                  min={1}
                  max={9}
                  onChange={(n) => onChange(clampPassengers({ ...value, adults: n }))}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Children</div>
                  <div className="text-xs text-muted-foreground">2–17</div>
                </div>
                <Stepper
                  value={value.childrenAges.length}
                  min={0}
                  max={15}
                  onChange={(n) => {
                    const current = value.childrenAges
                    const next =
                      n > current.length
                        ? [...current, ...new Array(n - current.length).fill(5)]
                        : current.slice(0, n)
                    onChange(clampPassengers({ ...value, childrenAges: next }))
                  }}
                />
              </div>

              {value.childrenAges.length > 0 ? (
                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-3">
                  <div className="text-xs text-muted-foreground">
                    Select each child’s age (used for pricing & seat rules).
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {value.childrenAges.map((age, idx) => (
                      <div key={idx} className="min-w-0 flex flex-col gap-1">
                        <div className="text-xs font-medium text-foreground/90">Child {idx + 1}</div>
                        <select
                          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm dark:bg-input"
                          value={age}
                          onChange={(e) => {
                            const next = value.childrenAges.slice()
                            next[idx] = Number(e.target.value)
                            onChange(clampPassengers({ ...value, childrenAges: next }))
                          }}
                          aria-label={`Child ${idx + 1} age`}
                        >
                          {Array.from({ length: 16 }, (_, i) => i + 2).map((a) => (
                            <option key={a} value={a}>
                              {a} years
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Infants</div>
                  <div className="text-xs text-muted-foreground">0–1 (lap infant)</div>
                </div>
                <Stepper
                  value={value.infants}
                  min={0}
                  max={Math.min(9, value.adults)}
                  onChange={(n) => onChange(clampPassengers({ ...value, infants: n }))}
                />
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed">
                - At least 1 adult is required.
                <br />- Infants can’t exceed adults.
              </div>
            </div>

            {/* Sticky footer so Done never disappears */}
            <div className="p-3 border-t border-border bg-card/95 backdrop-blur-sm flex items-center justify-end">
              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-border hover:bg-accent text-sm"
                onClick={() => setOpen(false)}
                autoFocus
              >
                Done
              </button>
            </div>
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

