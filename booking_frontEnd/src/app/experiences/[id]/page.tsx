import { use } from "react"
import ExperienceDetailsClient from "./experience-details-client"

export default function ExperienceDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <ExperienceDetailsClient id={id} />
}

