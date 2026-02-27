"use client"

import { useState, useEffect } from "react"
import { Plane, Hotel, Car, MapPin } from "lucide-react"
import { FlightsSearchForm } from "./FlightsSearchForm"
import { HotelsSearchForm } from "./HotelsSearchForm"
import { CarsSearchForm } from "./CarsSearchForm"
import { ExperiencesSearchForm } from "./ExperiencesSearchForm"

type TabId = "flights" | "hotels" | "cars" | "experiences"

const TABS = [
  { id: "flights" as const, label: "Flights", icon: Plane },
  { id: "hotels" as const, label: "Hotels", icon: Hotel },
  { id: "cars" as const, label: "Cars", icon: Car },
  { id: "experiences" as const, label: "Experiences", icon: MapPin }
]

const STORAGE_KEY = "travelpro_home_search_tab"

export function HomeSearch() {
  const [activeTab, setActiveTab] = useState<TabId>("flights")
  const [isSearching, setIsSearching] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Initialize from localStorage on client side only
  useEffect(() => {
    setIsClient(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && TABS.some((t) => t.id === stored)) {
      setActiveTab(stored as TabId)
    }
  }, [])

  // Save to localStorage when tab changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, activeTab)
    }
  }, [activeTab, isClient])

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId)
  }

  const handleSearch = () => {
    setIsSearching(true)
    // Reset after navigation starts
    setTimeout(() => setIsSearching(false), 1000)
  }

  return (
    <div className="relative animate-slide-up">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-2xl blur-3xl scale-105 animate-glow" />

      <div className="floating-card p-8 relative bg-card/95 dark:bg-card/90 backdrop-blur-2xl border-2 border-border/50 dark:border-border/30">
        {/* Card Header */}
        <div className="text-center mb-8">
          <h3 className="text-title mb-2">Find Your Perfect Trip</h3>
          <p className="text-muted-foreground">Compare prices across 500+ airlines and hotels</p>
        </div>

        {/* Premium Tab Navigation */}
        <div className="flex gap-1 mb-8 p-1 bg-muted/50 dark:bg-white/10 rounded-xl border border-border/50 dark:border-white/20">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex-1 justify-center group ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary border-2 border-primary/20 shadow-md scale-105"
                    : "text-foreground/60 hover:text-primary hover:bg-primary/5 hover:border-primary/10 hover:scale-105 border-2 border-transparent"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-transform duration-300 ${
                    activeTab === tab.id ? "scale-110" : "group-hover:scale-110"
                  }`}
                />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Dynamic Search Form Content with Fade Transition */}
        <div className="relative min-h-[400px]">
          {/* Flights Form */}
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              activeTab === "flights"
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            {activeTab === "flights" && <FlightsSearchForm onSearch={handleSearch} isSearching={isSearching} />}
          </div>

          {/* Hotels Form */}
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              activeTab === "hotels"
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            {activeTab === "hotels" && <HotelsSearchForm onSearch={handleSearch} isSearching={isSearching} />}
          </div>

          {/* Cars Form */}
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              activeTab === "cars"
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            {activeTab === "cars" && <CarsSearchForm onSearch={handleSearch} isSearching={isSearching} />}
          </div>

          {/* Experiences Form */}
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              activeTab === "experiences"
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            {activeTab === "experiences" && <ExperiencesSearchForm onSearch={handleSearch} isSearching={isSearching} />}
          </div>
        </div>

        {/* Premium Features */}
        <div className="flex items-center justify-center gap-6 pt-6 mt-6 border-t border-border/50 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Best Price Guarantee
          </span>
          <span className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Instant Confirmation
          </span>
          <span className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            24/7 Support
          </span>
        </div>
      </div>
    </div>
  )
}
