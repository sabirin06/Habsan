import { Building, Hotel, MapPin, CreditCard, Users } from "lucide-react"

const partnerCategories = [
  {
    name: "Airline",
    icon: Building,
    description: "Leading airlines worldwide"
  },
  {
    name: "Hotel Chain", 
    icon: Hotel,
    description: "Premium hotel partners"
  },
  {
    name: "Tour Company",
    icon: MapPin,
    description: "Trusted tour operators"
  },
  {
    name: "Payment Provider",
    icon: CreditCard,
    description: "Secure payment solutions"
  },
  {
    name: "Local Sponsor",
    icon: Users,
    description: "Local service providers"
  }
]

export function TrustedPartners() {
  return (
    <section className="py-24 section-background">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
            Partners
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            Our Trusted Partners
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Supported by leading airlines, hotels, and service providers worldwide.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {partnerCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <div
                  key={index}
                  className="text-center p-6 clean-card hover:shadow-lg hover:-translate-y-1 hover:scale-105 transition-all duration-200 ease-out cursor-pointer group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 mx-auto mb-3 transition-all duration-200">
                    <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-all duration-200" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              )
            })}
          </div>

          {/* Partner logos placeholder */}
          <div className="mt-16 grid gap-8 md:grid-cols-4 lg:grid-cols-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-16 bg-muted rounded-lg flex items-center justify-center opacity-60"
              >
                <span className="text-xs text-muted-foreground font-medium">
                  Partner {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}