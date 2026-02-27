import { Suspense } from "react"
import TransportSearchPageClient from "./transport-search-page-client"

export default function TransportSearchPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <TransportSearchPageClient initialSearchParams={searchParams} />
    </Suspense>
  )
}

