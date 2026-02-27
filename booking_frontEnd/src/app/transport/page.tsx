import { Suspense } from "react"
import TransportLanding from "@/components/transport/TransportLanding"

export default function TransportPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <TransportLanding initialSearchParams={searchParams} />
    </Suspense>
  )
}

