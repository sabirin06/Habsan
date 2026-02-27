"use client"

import { useState } from "react"
import { Plane, Calendar, Users, ArrowLeftRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchData {
    from: string
    to: string
    departDate: string
    returnDate?: string
    passengers: number
    tripType: "round-trip" | "one-way" | "multi-city"
}

interface FlightSearchProps {
    onSearch?: (data: SearchData) => void
}

export function FlightSearch({ onSearch }: FlightSearchProps) {
    const [tripType, setTripType] = useState<"round-trip" | "one-way" | "multi-city">("round-trip")
    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")
    const [departDate, setDepartDate] = useState("")
    const [returnDate, setReturnDate] = useState("")
    const [passengers, setPassengers] = useState(1)

    const handleSearch = () => {
        if (!from || !to || !departDate) {
            alert("Please fill in all required fields")
            return
        }

        const searchData: SearchData = {
            from,
            to,
            departDate,
            returnDate: tripType === "round-trip" ? returnDate : undefined,
            passengers,
            tripType
        }

        onSearch?.(searchData)
    }

    const handleSwapLocations = () => {
        const temp = from
        setFrom(to)
        setTo(temp)
    }

    return (
        <section className="pt-24 pb-12 section-background">
            <div className="container">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold tracking-tight mb-4">
                            Your Journey
                            <span className="text-primary"> Begins Here...</span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Compare prices, get best flight options and book with confidence.
                        </p>
                    </div>

                    {/* Search Card */}
                    <div className="clean-card p-8 border-2 dark:border-border/80 dark:bg-card/90 dark:backdrop-blur-xl">
                        {/* Trip Type Selection */}
                        <div className="flex gap-1 mb-8 p-1 bg-muted dark:bg-muted/80 rounded-lg border dark:border-border/60 w-fit">
                            {[
                                { id: "round-trip" as const, label: "Round Trip" },
                                { id: "one-way" as const, label: "One Way" },
                                { id: "multi-city" as const, label: "Multi City" }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setTripType(type.id)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${tripType === type.id
                                        ? "bg-background dark:bg-card text-foreground shadow-sm border dark:border-border/60"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50 dark:hover:bg-card/50"
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Form */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                            {/* From */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <Plane className="h-4 w-4 text-primary" />
                                    From
                                </label>
                                <input
                                    type="text"
                                    placeholder="Departure city"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="clean-input w-full dark:bg-input dark:border-border/80 dark:text-foreground dark:placeholder:text-muted-foreground"
                                />
                            </div>

                            {/* To */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <Plane className="h-4 w-4 text-primary rotate-90" />
                                    To
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Destination city"
                                        value={to}
                                        onChange={(e) => setTo(e.target.value)}
                                        className="clean-input pr-10 w-full dark:bg-input dark:border-border/80 dark:text-foreground dark:placeholder:text-muted-foreground"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSwapLocations}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-accent transition-colors"
                                        aria-label="Swap departure and destination"
                                    >
                                        <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>

                            {/* Departure Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Departure
                                </label>
                                <input
                                    type="date"
                                    value={departDate}
                                    onChange={(e) => setDepartDate(e.target.value)}
                                    className="clean-input w-full dark:bg-input dark:border-border/80 dark:text-foreground"
                                />
                            </div>

                            {/* Return Date */}
                            {tripType === "round-trip" && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        Return
                                    </label>
                                    <input
                                        type="date"
                                        value={returnDate}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                        className="clean-input w-full dark:bg-input dark:border-border/80 dark:text-foreground"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Passengers and Search */}
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" />
                                    Passengers
                                </label>
                                <select
                                    value={passengers}
                                    onChange={(e) => setPassengers(Number(e.target.value))}
                                    className="clean-input w-full dark:bg-input dark:border-border/80 dark:text-foreground"
                                >
                                    <option value={1}>1 Passenger</option>
                                    <option value={2}>2 Passengers</option>
                                    <option value={3}>3 Passengers</option>
                                    <option value={4}>4+ Passengers</option>
                                </select>
                            </div>

                            <Button
                                size="lg"
                                onClick={handleSearch}
                                className="bg-primary hover:bg-primary/90 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 group px-8"
                            >
                                <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                                Search Flights
                            </Button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-3 mt-6 justify-center">
                        {["Explore Flights", "Flight Status", "Check-in", "Manage Booking"].map((action) => (
                            <button
                                key={action}
                                className="px-4 py-2 rounded-full border border-border hover:bg-accent hover:scale-105 transition-all duration-200 text-sm font-medium"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}