import ConfirmationClient from "./confirmationClient"

export default function ConfirmationPage({
  searchParams
}: {
  searchParams: { bookingId?: string | string[] }
}) {
  const bookingId = typeof searchParams.bookingId === "string" ? searchParams.bookingId : ""
  return <ConfirmationClient bookingId={bookingId} />
}

