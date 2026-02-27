"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Plane, Hotel, Car, MapPin, Download, FileText, X, Calendar, Clock, MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type BookingType = "flight" | "hotel" | "transport" | "experience"
type BookingStatus = "upcoming" | "completed" | "cancelled"

type Booking = {
  id: string
  type: BookingType
  provider: string
  title: string
  route?: string
  location?: string
  date: string
  status: BookingStatus
  price: number
  bookingRef: string
}

export default function BookingsPage() {
  const [filter, setFilter] = useState<"all" | BookingType>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const bookings: Booking[] = [
    {
      id: "FL-2024-001",
      type: "flight",
      provider: "Ethiopian Airlines",
      title: "Mogadishu → Nairobi",
      route: "MGQ → NBO",
      date: "Mar 15, 2024 • 10:30 AM",
      status: "upcoming",
      price: 450,
      bookingRef: "ETH-MGQ-2024-001"
    },
    {
      id: "HT-2024-002",
      type: "hotel",
      provider: "Safari Lodge",
      title: "Safari Lodge Nairobi",
      location: "Nairobi, Kenya",
      date: "Mar 15 - Mar 20, 2024 • 5 nights",
      status: "upcoming",
      price: 850,
      bookingRef: "SFL-NBO-2024-002"
    },
    {
      id: "TR-2024-003",
      type: "transport",
      provider: "Premium Car Rentals",
      title: "Airport Pickup Service",
      location: "Jomo Kenyatta Airport",
      date: "Mar 15, 2024 • 10:00 AM",
      status: "upcoming",
      price: 75,
      bookingRef: "PCR-NBO-2024-003"
    },
    {
      id: "EX-2024-004",
      type: "experience",
      provider: "Maasai Tours",
      title: "Maasai Mara Safari Tour",
      location: "Maasai Mara, Kenya",
      date: "Mar 17, 2024 • Full day",
      status: "upcoming",
      price: 320,
      bookingRef: "MST-MAR-2024-004"
    },
    {
      id: "FL-2024-005",
      type: "flight",
      provider: "Kenya Airways",
      title: "Nairobi → Mogadishu",
      route: "NBO → MGQ",
      date: "Feb 10, 2024 • 2:45 PM",
      status: "completed",
      price: 420,
      bookingRef: "KEN-NBO-2024-005"
    },
    {
      id: "HT-2024-006",
      type: "hotel",
      provider: "Liido Beach Resort",
      title: "Liido Beach Resort",
      location: "Mogadishu, Somalia",
      date: "Jan 20 - Jan 25, 2024 • 5 nights",
      status: "completed",
      price: 650,
      bookingRef: "LBR-MGQ-2024-006"
    }
  ]

  const filteredBookings = bookings.filter((booking) => {
    const matchesType = filter === "all" || booking.type === filter
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    return matchesType && matchesStatus
  })

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "upcoming":
        return "text-primary bg-primary/10 border-primary/20"
      case "completed":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20"
      case "cancelled":
        return "text-destructive bg-destructive/10 border-destructive/20"
    }
  }

  const getIcon = (type: BookingType) => {
    switch (type) {
      case "flight":
        return <Plane className="h-6 w-6 text-blue-500" />
      case "hotel":
        return <Hotel className="h-6 w-6 text-primary" />
      case "transport":
        return <Car className="h-6 w-6 text-purple-500" />
      case "experience":
        return <MapPin className="h-6 w-6 text-orange-500" />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground mt-1">View and manage all your travel bookings</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className="rounded-xl shrink-0"
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filter === "flight" ? "default" : "outline"}
              onClick={() => setFilter("flight")}
              className="rounded-xl shrink-0"
              size="sm"
            >
              <Plane className="h-4 w-4 mr-2" />
              Flights
            </Button>
            <Button
              variant={filter === "hotel" ? "default" : "outline"}
              onClick={() => setFilter("hotel")}
              className="rounded-xl shrink-0"
              size="sm"
            >
              <Hotel className="h-4 w-4 mr-2" />
              Hotels
            </Button>
            <Button
              variant={filter === "transport" ? "default" : "outline"}
              onClick={() => setFilter("transport")}
              className="rounded-xl shrink-0"
              size="sm"
            >
              <Car className="h-4 w-4 mr-2" />
              Transport
            </Button>
            <Button
              variant={filter === "experience" ? "default" : "outline"}
              onClick={() => setFilter("experience")}
              className="rounded-xl shrink-0"
              size="sm"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Experiences
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className="rounded-xl"
              size="sm"
            >
              All
            </Button>
            <Button
              variant={statusFilter === "upcoming" ? "default" : "outline"}
              onClick={() => setStatusFilter("upcoming")}
              className="rounded-xl"
              size="sm"
            >
              Upcoming
            </Button>
            <Button
              variant={statusFilter === "completed" ? "default" : "outline"}
              onClick={() => setStatusFilter("completed")}
              className="rounded-xl"
              size="sm"
            >
              Completed
            </Button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="clean-card border border-border/60 p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No bookings found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or book your next trip
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="clean-card border border-border/60 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                      {getIcon(booking.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{booking.title}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{booking.provider}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {booking.route && (
                          <span className="inline-flex items-center gap-1">
                            <Plane className="h-3.5 w-3.5" />
                            {booking.route}
                          </span>
                        )}
                        {booking.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            {booking.location}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {booking.date}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Ref: {booking.bookingRef}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                    <div className="text-right">
                      <p className="text-2xl font-bold">${booking.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedBooking(booking)}
                        className="premium-button-primary text-sm"
                        size="sm"
                      >
                        View Details
                      </Button>
                      <Button variant="outline" className="rounded-xl text-sm" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="clean-card border border-border/60 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border/60 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-xl bg-muted/50 flex items-center justify-center">
                  {getIcon(selectedBooking.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">{selectedBooking.title}</h3>
                  <p className="text-muted-foreground">{selectedBooking.provider}</p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedBooking.status)}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Booking Reference</p>
                  <p className="font-semibold">{selectedBooking.bookingRef}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold text-2xl">${selectedBooking.price}</p>
                </div>
                {selectedBooking.route && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Route</p>
                    <p className="font-semibold">{selectedBooking.route}</p>
                  </div>
                )}
                {selectedBooking.location && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{selectedBooking.location}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-semibold">{selectedBooking.date}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border/60">
                <Button className="premium-button-primary">
                  <Download className="h-4 w-4 mr-2" />
                  Download Ticket
                </Button>
                <Button variant="outline" className="rounded-xl">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                {selectedBooking.status === "upcoming" && (
                  <>
                    <Button variant="outline" className="rounded-xl">
                      Modify Booking
                    </Button>
                    <Button variant="outline" className="rounded-xl text-destructive border-destructive">
                      Cancel Booking
                    </Button>
                  </>
                )}
              </div>

              {/* Cancellation Policy */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
                <h4 className="font-semibold mb-2">Cancellation Policy</h4>
                <p className="text-sm text-muted-foreground">
                  Free cancellation up to 24 hours before departure. After that, a cancellation fee may apply.
                  Contact support for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
