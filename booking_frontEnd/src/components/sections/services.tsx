import { Plane, Hotel, Car, MapPin, ArrowRight, Sparkles } from "lucide-react"

const services = [
  {
    icon: Plane,
    title: "Premium Flights",
    description: "Compare and book flights from 500+ airlines worldwide with our AI-powered search technology and exclusive deals.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=100&fit=crop&crop=center",
    gradient: "from-blue-500/10 to-cyan-500/10"
  },
  {
    icon: Hotel,
    title: "Luxury Hotels",
    description: "Discover and book from millions of accommodations, from luxury resorts to boutique hotels and unique local stays.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop&crop=center",
    gradient: "from-purple-500/10 to-pink-500/10"
  },
  {
    icon: Car,
    title: "Premium Rentals",
    description: "Rent vehicles from trusted providers at competitive rates. From economy cars to luxury vehicles for any journey.",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop&crop=center",
    gradient: "from-orange-500/10 to-red-500/10"
  },
  {
    icon: MapPin,
    title: "Curated Experiences",
    description: "Explore handpicked tours, activities, and unique experiences led by local experts in destinations worldwide.",
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=100&h=100&fit=crop&crop=center",
    gradient: "from-emerald-500/10 to-teal-500/10"
  }
]

export function Services() {
  return (
    <section className="py-24 section-elevated">
      <div className="container">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-8 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            Premium Services
          </div>
          <h2 className="text-headline mb-6">
            Everything You Need for
            <span className="block bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              Exceptional Travel
            </span>
          </h2>
          <p className="text-body-large text-muted-foreground max-w-3xl mx-auto">
            From flights to local experiences, we provide comprehensive travel solutions
            designed for the modern African traveler seeking premium quality and seamless experiences.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={index}
                className="group relative overflow-hidden premium-card hover:shadow-2xl hover:-translate-y-4 hover:scale-[1.02] transition-all duration-500 ease-out cursor-pointer"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative p-8">
                  {/* Icon Container */}
                  <div className="relative mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-all duration-300" />
                    </div>

                    {/* Floating Image */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 opacity-20 group-hover:opacity-40 rounded-lg overflow-hidden transition-opacity duration-300">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <h3 className="text-title mb-4 group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Learn More Link */}
                  <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-2">
                    <span>Learn More</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}