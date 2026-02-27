import { Percent, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const offers = [
  {
    id: 1,
    title: "20% OFF Flights to Istanbul",
    description: "Explore the vibrant culture and rich history of Istanbul. Book your next adventure now!",
    discount: "20% OFF",
    validUntil: "Hurry! Deal ends in 24 Hrs",
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=200&fit=crop&crop=center",
    cta: "Book Now"
  }
]

export function SpecialOffers() {
  return (
    <section className="py-16 section-background">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
              <Percent className="h-4 w-4" />
              Hot Deals
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-6">
              Get Special
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our best deals and book your next adventure
            </p>
          </div>

          {/* Offers Grid */}
          <div className="grid gap-8 md:grid-cols-1">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="clean-card overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.01] transition-all duration-500 ease-out group cursor-pointer"
              >
                <div className="md:flex">
                  {/* Image */}
                  <div className="md:w-1/2 relative overflow-hidden">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-64 md:h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                    
                    {/* Discount Badge */}
                    <div className="absolute top-6 left-6">
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                        {offer.discount}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                      {offer.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {offer.description}
                    </p>

                    <div className="flex items-center gap-2 mb-6 text-sm">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-orange-500 font-medium">{offer.validUntil}</span>
                    </div>

                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 hover:scale-105 hover:shadow-lg transition-all duration-200 group w-fit"
                    >
                      {offer.cta}
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Offers */}
          <div className="grid gap-6 md:grid-cols-3 mt-12">
            {[
              { title: "Early Bird Special", discount: "15% OFF", description: "Book 30 days in advance" },
              { title: "Group Booking", discount: "25% OFF", description: "5+ passengers" },
              { title: "Student Discount", discount: "10% OFF", description: "Valid student ID required" }
            ].map((offer, index) => (
              <div
                key={index}
                className="clean-card p-6 text-center hover:shadow-lg hover:-translate-y-1 hover:scale-105 transition-all duration-200 group cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-200">
                  <Percent className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{offer.title}</h4>
                <p className="text-2xl font-bold text-primary mb-2">{offer.discount}</p>
                <p className="text-sm text-muted-foreground">{offer.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}