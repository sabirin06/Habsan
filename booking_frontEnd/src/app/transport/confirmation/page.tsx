import TransportConfirmationClient from "./transport-confirmation-client"

export default function TransportConfirmationPage({
  searchParams
}: {
  searchParams: { bookingId?: string | string[] }
}) {
  const bookingId = typeof searchParams.bookingId === "string" ? searchParams.bookingId : ""
  return <TransportConfirmationClient bookingId={bookingId} />
}

