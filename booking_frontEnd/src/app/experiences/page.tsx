import { Suspense } from "react"
import ExperiencesLanding from "@/components/experiences/ExperiencesLanding"

export default function ExperiencesPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ExperiencesLanding initialSearchParams={searchParams} />
    </Suspense>
  )
}

