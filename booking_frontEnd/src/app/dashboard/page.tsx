"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Plane, Hotel, Car, MapPin, Calendar, TrendingUp, Heart, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    { label: "Total Bookings", value: "12", icon: Calendar, color: "text-blue-500" },
    { label: "Upcoming Trips", value: "3", icon: Clock, color: "text-primary" },
    { label: "Saved Items", value: "8", icon: Heart, color: "text-pink-500" },
    { label: "Travel Points", value: "1,250", icon: TrendingUp, color: "text-yellow-500" }
  ]

  const quickActions = [
    {
      title: "Book a Flight",
      description: "Search and book flights to your next destination",
      icon: Plane,
      href: "/flights",
      color: "from-blue-500/10 to-blue-600/10",
      iconColor: "text-blue-500"
    },
    {
      title: "Book a Stay",
      description: "Find hotels and apartments for your trip",
      icon: Hotel,
      href: "/stay",
      color: "from-primary/10 to-emerald-600/10",
      iconColor: "text-primary"
    },
    {
      title: "Book Transport",
      description: "Airport pickup or car rental services",
      icon: Car,
      href: "/transport",
      color: "from-purple-500/10 to-purple-600/10",
      iconColor: "text-purple-500"
    },
    {
      title: "Explore Experiences",
      description: "Discover tours and local experiences",
      icon: MapPin,
      href: "/experiences",
      color: "from-orange-500/10 to-orange-600/10",
      iconColor: "text-orange-500"
    }
  ]

  const recentBookings = [
    {
      id: "FL-2024-001",
      type: "flight",
      title: "Mogadishu → Nairobi",
      date: "Mar 15, 2024",
      status: "Upcoming",
      statusColor: "text-primary bg-primary/10"
    },
    {
      id: "HT-2024-002",
      type: "hotel",
      title: "Safari Lodge, Nairobi",
      date: "Mar 15 - Mar 20, 2024",
      status: "Confirmed",
      statusColor: "text-blue-500 bg-blue-500/10"
    },
    {
      id: "EX-2024-003",
      type: "experience",
      title: "Maasai Mara Safari Tour",
      date: "Mar 17, 2024",
      status: "Upcoming",
      statusColor: "text-primary bg-primary/10"
    }
  ]

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, {user?.firstName || "Traveler"}!</h1>
          <p className="text-muted-foreground">Manage your bookings and plan your next adventure</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="clean-card border border-border/60 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="clean-card border border-border/60 p-6 hover:shadow-xl transition-all group"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${action.iconColor}`} />
                  </div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Bookings</h2>
            <Link href="/dashboard/bookings">
              <Button variant="ghost" className="rounded-xl text-sm">
                View all
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/dashboard/bookings/${booking.id}`}
                className="clean-card border border-border/60 p-5 flex items-center justify-between hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center">
                    {booking.type === "flight" && <Plane className="h-6 w-6 text-blue-500" />}
                    {booking.type === "hotel" && <Hotel className="h-6 w-6 text-primary" />}
                    {booking.type === "experience" && <MapPin className="h-6 w-6 text-orange-500" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{booking.title}</h3>
                    <p className="text-sm text-muted-foreground">{booking.date}</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${booking.statusColor}`}>
                  {booking.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Saved Items Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Saved for Later</h2>
            <Link href="/dashboard/saved">
              <Button variant="ghost" className="rounded-xl text-sm">
                View all
              </Button>
            </Link>
          </div>
          <div className="clean-card border border-border/60 p-8 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Save your favorites</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click the heart icon on any hotel or experience to save it for later
            </p>
            <Link href="/experiences">
              <Button className="premium-button-primary text-sm">
                Explore Experiences
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
