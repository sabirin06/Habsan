import { Heart, MapPin, Star, ArrowRight, Calendar, Users, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const destinations = [
    {
        id: 1,
        name: "Barcelona",
        country: "Spain",
        rating: 4.8,
        reviews: 1256,
        description: "Architectural wonders meet vibrant culture in this Mediterranean gem with world-class cuisine.",
        price: "From $299",
        originalPrice: "$399",
        image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=500&h=400&fit=crop&crop=center",
        badge: "Most Popular",
        gradient: "from-orange-500/80 to-red-500/80"
    },
    {
        id: 2,
        name: "Santorini",
        country: "Greece",
        rating: 4.9,
        reviews: 2103,
        description: "Iconic white buildings and stunning sunsets over the Aegean Sea create unforgettable memories.",
        price: "From $449",
        originalPrice: "$599",
        image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=500&h=400&fit=crop&crop=center",
        badge: "Premium",
        gradient: "from-blue-500/80 to-cyan-500/80"
    },
    {
        id: 3,
        name: "Dubai",
        country: "UAE",
        rating: 4.7,
        reviews: 3489,
        description: "Luxury shopping, ultramodern architecture, and desert adventures in the heart of the Middle East.",
        price: "From $599",
        originalPrice: "$799",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&h=400&fit=crop&crop=center",
        badge: "Luxury",
        gradient: "from-purple-500/80 to-pink-500/80"
    }
]

export function PopularDestinations() {
    return (
        <section className="py-32 section-elevated relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />

            <div className="container relative">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-8 border border-primary/20">
                        <Sparkles className="h-4 w-4" />
                        Trending destinations this month
                    </div>

                    <h2 className="text-headline mb-6">
                        Discover
                        <span className="block bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                            Premium Destinations
                        </span>
                    </h2>

                    <p className="text-body-large text-muted-foreground max-w-4xl mx-auto">
                        Handpicked destinations offering the perfect blend of luxury, culture, and unforgettable experiences
                        curated specifically for the discerning African traveler.
                    </p>
                </div>

                <div className="grid gap-10 md:grid-cols-3 mb-20">
                    {destinations.map((destination) => (
                        <div
                            key={destination.id}
                            className="group relative overflow-hidden premium-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-out cursor-pointer"
                        >
                            {/* Image Container */}
                            <div className="relative h-64 overflow-hidden rounded-t-xl">
                                <img
                                    src={destination.image}
                                    alt={`${destination.name}, ${destination.country}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                                />

                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-t ${destination.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-250 ease-out`} />

                                {/* Badge */}
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg">
                                    {destination.badge}
                                </div>

                                {/* Heart Button */}
                                <button className="absolute top-4 right-4 p-3 rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-card hover:shadow-md transition-all duration-150 ease-out">
                                    <Heart className="h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors duration-200" />
                                </button>

                                {/* Floating Price */}
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out">
                                    <div className="bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
                                        <div className="text-xs text-muted-foreground line-through">{destination.originalPrice}</div>
                                        <div className="text-sm font-bold text-primary">{destination.price}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-title group-hover:text-primary transition-colors duration-200 ease-out">
                                            {destination.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <MapPin className="h-4 w-4" />
                                            <span>{destination.country}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 mb-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-semibold">{destination.rating}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">({destination.reviews.toLocaleString()})</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-muted-foreground leading-relaxed mb-6">
                                    {destination.description}
                                </p>

                                {/* Price and Actions */}
                                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-foreground">{destination.price}</span>
                                            <span className="text-sm text-muted-foreground line-through">{destination.originalPrice}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">per person</span>
                                    </div>

                                    <Button className="premium-button-primary">
                                        Book Now
                                    </Button>
                                </div>

                                {/* Quick Info */}
                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        Best for couples
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        7-14 days
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Premium View More Section */}
                <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-emerald-500/10 rounded-3xl blur-3xl scale-105" />

                    <div className="floating-card p-12 text-center relative bg-card/95 dark:bg-card/90 backdrop-blur-2xl">
                        <h3 className="text-title mb-4">
                            Explore 500+ Premium Destinations
                        </h3>
                        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                            From hidden gems to world-famous landmarks, discover your next adventure with our curated collection
                            of destinations perfect for African travelers.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button className="premium-button-primary">
                                View All Destinations
                                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-150 ease-out" />
                            </Button>
                            <Button className="premium-button-secondary">
                                <Sparkles className="h-5 w-5 mr-2" />
                                Browse by Region
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}