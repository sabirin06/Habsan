import { Search, Globe, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-24 section-muted">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="premium-card p-12 text-center">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-headline mb-4">
                Ready to Book Your
                <span className="block bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                  Next Adventure?
                </span>
              </h2>

              <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
                Find flights, luxury hotels, and curated experiences in just one search.
                Join thousands of satisfied travelers across Africa.
              </p>
            </div>

            {/* Search Form */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-3 p-2 bg-muted/50 rounded-xl border border-border/50">
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  className="flex-1 px-4 py-3 bg-transparent border-0 text-base placeholder:text-muted-foreground focus:outline-none"
                />
                <Button className="premium-button-primary">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Action Buttons with proper hierarchy */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button className="premium-button-primary">
                <Globe className="h-5 w-5 mr-2" />
                Start Planning Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button className="premium-button-secondary">
                Explore Destinations
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 pt-6 border-t border-border/50 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Free cancellation
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Best price guarantee
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                24/7 support
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}