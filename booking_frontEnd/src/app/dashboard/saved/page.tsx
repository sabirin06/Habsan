"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Hotel, MapPin, Car, Heart, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type SavedItemType = "hotel" | "experience" | "transport"

type SavedItem = {
  id: string
  type: SavedItemType
  title: string
  location: string
  price: number
  image: string
  rating: number
  reviews: number
  savedAt: string
  link: string
}

export default function SavedItemsPage() {
  const [filter, setFilter] = useState<"all" | SavedItemType>("all")

  // Mock saved items
  const savedItems: SavedItem[] = [
    {
      id: "S-001",
      type: "hotel",
      title: "Safari Lodge Nairobi",
      location: "Nairobi, Kenya",
      price: 170,
      image: "/placeholder.jpg",
      rating: 4.8,
      reviews: 342,
      savedAt: "2024-02-05",
      link: "/stay/safari-lodge"
    },
    {
      id: "S-002",
      type: "experience",
      title: "Maasai Mara Safari Tour",
      location: "Maasai Mara, Kenya",
      price: 320,
      image: "/placeholder.jpg",
      rating: 4.9,
      reviews: 567,
      savedAt: "2024-02-03",
      link: "/experiences/maasai-safari"
    },
    {
      id: "S-003",
      type: "hotel",
      title: "Liido Beach Resort",
      location: "Mogadishu, Somalia",
      price: 130,
      image: "/placeholder.jpg",
      rating: 4.6,
      reviews: 189,
      savedAt: "2024-01-28",
      link: "/stay/liido-beach"
    },
    {
      id: "S-004",
      type: "experience",
      title: "Djibouti City Tour",
      location: "Djibouti City, Djibouti",
      price: 85,
      image: "/placeholder.jpg",
      rating: 4.7,
      reviews: 234,
      savedAt: "2024-01-25",
      link: "/experiences/djibouti-tour"
    }
  ]

  const filteredItems = filter === "all" ? savedItems : savedItems.filter((item) => item.type === filter)

  const getIcon = (type: SavedItemType) => {
    switch (type) {
      case "hotel":
        return <Hotel className="h-6 w-6 text-primary" />
      case "experience":
        return <MapPin className="h-6 w-6 text-orange-500" />
      case "transport":
        return <Car className="h-6 w-6 text-purple-500" />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Saved Items</h1>
          <p className="text-muted-foreground mt-1">Hotels, experiences, and transport saved for later</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="rounded-xl shrink-0"
            size="sm"
          >
            All ({savedItems.length})
          </Button>
          <Button
            variant={filter === "hotel" ? "default" : "outline"}
            onClick={() => setFilter("hotel")}
            className="rounded-xl shrink-0"
            size="sm"
          >
            <Hotel className="h-4 w-4 mr-2" />
            Hotels ({savedItems.filter((i) => i.type === "hotel").length})
          </Button>
          <Button
            variant={filter === "experience" ? "default" : "outline"}
            onClick={() => setFilter("experience")}
            className="rounded-xl shrink-0"
            size="sm"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Experiences ({savedItems.filter((i) => i.type === "experience").length})
          </Button>
          <Button
            variant={filter === "transport" ? "default" : "outline"}
            onClick={() => setFilter("transport")}
            className="rounded-xl shrink-0"
            size="sm"
          >
            <Car className="h-4 w-4 mr-2" />
            Transport ({savedItems.filter((i) => i.type === "transport").length})
          </Button>
        </div>

        {/* Saved Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="clean-card border border-border/60 p-12 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No saved items</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Click the heart icon on any hotel or experience to save it for later
            </p>
            <Link href="/stay">
              <Button className="premium-button-primary">
                Browse Hotels
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="clean-card border border-border/60 overflow-hidden group">
                {/* Image */}
                <div className="relative aspect-video bg-muted/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-emerald-600/20" />
                  <button className="absolute top-3 right-3 h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-background transition-colors z-10">
                    <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{item.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{item.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">★ {item.rating}</span>
                    <span className="text-muted-foreground">({item.reviews} reviews)</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/60">
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-xl font-bold">${item.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={item.link}>
                        <Button className="premium-button-primary text-sm" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="rounded-xl text-destructive border-destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">Saved on {item.savedAt}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="clean-card border border-border/60 p-6 bg-muted/30">
          <h3 className="font-semibold mb-3">Tips for using saved items</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Save items while browsing to compare them later</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Share your saved list with travel companions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Prices may change - book soon to secure the best deals</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
