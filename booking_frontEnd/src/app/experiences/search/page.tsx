import { Suspense } from "react"
import ExperienceSearchPageClient from "./experience-search-page-client"

export default function ExperienceSearchPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ExperienceSearchPageClient initialSearchParams={searchParams} />
    </Suspense>
  )
}

