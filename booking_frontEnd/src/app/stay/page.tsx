import { Suspense } from "react"
import StayLanding from "@/components/stay/StayLanding"

export default function StayPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <StayLanding initialSearchParams={searchParams} />
    </Suspense>
  )
}

