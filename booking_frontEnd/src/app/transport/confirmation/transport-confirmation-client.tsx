"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { loadBookingReceipt, type BookingReceipt } from "@/lib/booking-storage"
import { getMockTransportById } from "@/lib/mock-transport"
import { BadgeCheck, Download, PhoneCall, ShieldCheck, Star } from "lucide-react"

function fmtMoney(n: number) {
  return `$${Math.round(n)}`
}

function toWhatsAppLink(phone: string) {
  const digits = (phone || "").replace(/[^\d]/g, "")
  if (!digits) return ""
  return `https://wa.me/${digits}`
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function TransportConfirmationClient({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null)

  useEffect(() => {
    if (!bookingId) return
    setReceipt(loadBookingReceipt(bookingId))
  }, [bookingId])

  const transport = useMemo(() => {
    if (!receipt || receipt.kind !== "transport") return null
    return getMockTransportById(receipt.draft.transport.serviceId) ?? null
  }, [receipt])

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 px-4 pb-12">
          <div className="max-w-3xl mx-auto clean-card p-6">
            <div className="text-lg font-semibold">Missing booking ID</div>
            <div className="mt-2 text-sm text-muted-foreground">Please return to checkout to complete payment.</div>
            <div className="mt-6">
              <Button onClick={() => router.push("/transport/checkout")}>Go to checkout</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!receipt || receipt.kind !== "transport") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 px-4 pb-12">
          <div className="max-w-3xl mx-auto clean-card p-6">
            <div className="text-lg font-semibold">Booking not found</div>
            <div className="mt-2 text-sm text-muted-foreground">This confirmation is unavailable. Please complete checkout again.</div>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => router.push("/transport/checkout")}>Back to checkout</Button>
              <Button variant="outline" onClick={() => router.push("/transport")}>
                Back to transport
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const driverPhone = transport?.driver?.phone ?? receipt.contact.phone
  const driverWhatsapp = transport?.driver?.whatsapp ?? driverPhone

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="clean-card p-4 md:p-6">
            <div className="text-2xl font-bold">Booking confirmed</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Booking reference: <span className="font-mono text-foreground">{receipt.bookingId}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-background">
                <ShieldCheck className="h-3.5 w-3.5" /> Secure payment
              </span>
              {transport?.provider.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-background">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified provider
                </span>
              ) : null}
              {transport ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 bg-background">
                  <Star className="h-3.5 w-3.5 text-primary" /> {transport.rating.score.toFixed(1)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Vehicle & driver</h2>
                <div className="mt-4 border border-border rounded-xl p-4 bg-background">
                  <div className="font-medium">{transport?.title ?? "Your transport"}</div>
                  <div className="text-sm text-muted-foreground mt-1">{transport?.provider.name ?? "Provider"}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {receipt.draft.transport.search.passengers} passenger{receipt.draft.transport.search.passengers > 1 ? "s" : ""} •{" "}
                    {receipt.totals.unit === "per_day" ? `${receipt.totals.days ?? 1} day(s)` : "Per trip"}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!driverPhone) return
                      window.location.href = `tel:${driverPhone}`
                    }}
                  >
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Call driver
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = toWhatsAppLink(driverWhatsapp || "")
                      if (!link) return
                      window.open(link, "_blank", "noopener,noreferrer")
                    }}
                  >
                    WhatsApp driver
                  </Button>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  Pickup details and vehicle plate (placeholder) will be shared closer to the pickup time.
                </div>
              </div>

              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Passengers</h2>
                <div className="mt-4 space-y-2">
                  {receipt.passengers.map((p, idx) => (
                    <div key={idx} className="border border-border rounded-xl p-3 bg-background flex items-center justify-between gap-3">
                      <div className="font-medium">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{p.phone ?? ""}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="clean-card p-4 md:p-6">
                <h2 className="text-lg font-semibold">Manage booking</h2>
                <div className="mt-3 text-sm text-muted-foreground">
                  Need to change pickup details? Use “Manage booking” to review your selection (Phase 1 placeholder for full management tools).
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => router.push(`/transport/details/${encodeURIComponent(receipt.draft.transport.serviceId)}`)}>
                    Manage booking
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/transport")}>
                    Back to Transport
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="clean-card p-4 md:p-6 lg:sticky lg:top-[calc(var(--sticky-stack-h,120px)+16px)]">
                <h2 className="text-lg font-semibold">Receipt</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Base {receipt.totals.unit === "per_day" ? `(${receipt.totals.days ?? 1} day(s))` : "(per trip)"}
                    </span>
                    <span className="font-medium tabular-nums">{fmtMoney(receipt.totals.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fees</span>
                    <span className="font-medium tabular-nums">{fmtMoney(receipt.totals.fees)}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-semibold">Total paid</span>
                    <span className="font-semibold tabular-nums">{fmtMoney(receipt.totals.total)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Paid via {receipt.payment.method === "card" ? `Card •••• ${receipt.payment.last4 ?? "----"}` : "Mobile money"}.
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      const lines = [
                        `TravelPro — Transport receipt`,
                        ``,
                        `Booking reference: ${receipt.bookingId}`,
                        `Date: ${new Date(receipt.createdAt).toISOString()}`,
                        ``,
                        `Service: ${transport?.title ?? receipt.draft.transport.serviceId}`,
                        `Provider: ${transport?.provider.name ?? "—"}`,
                        ``,
                        `Passengers: ${receipt.passengers.map((p) => `${p.firstName} ${p.lastName}`.trim()).join(", ")}`,
                        ``,
                        `Base: ${fmtMoney(receipt.totals.amount)}`,
                        `Fees: ${fmtMoney(receipt.totals.fees)}`,
                        `Total paid: ${fmtMoney(receipt.totals.total)} ${receipt.totals.currency}`,
                        ``,
                        `Contact: ${receipt.contact.email} • ${receipt.contact.phone}`
                      ]
                      downloadText(`TravelPro-Transport-Receipt-${receipt.bookingId}.txt`, lines.join("\n"))
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download receipt
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

