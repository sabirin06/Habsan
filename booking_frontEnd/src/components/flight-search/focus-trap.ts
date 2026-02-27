import * as React from "react"

function getFocusable(container: HTMLElement) {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ]
  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(","))).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  )
}

export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, enabled: boolean) {
  React.useEffect(() => {
    const container = containerRef.current
    if (!enabled || !container) return
    const el: HTMLElement = container

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return
      const focusable = getFocusable(el)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (e.shiftKey) {
        if (!active || active === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (!active || active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [containerRef, enabled])
}

