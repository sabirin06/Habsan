import { Suspense } from "react"
import StaySearchPageClient from "./stay-search-page-client"

export default function StaySearchPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <StaySearchPageClient initialSearchParams={searchParams} />
    </Suspense>
  )
}

