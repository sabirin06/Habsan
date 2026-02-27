import { Shield, CreditCard, Headphones, Package, Star, Globe, Award } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
    {
        icon: Shield,
        title: "Best Price Guarantee",
        description: "AI-powered price comparison ensures you get the most competitive rates across all platforms with instant price matching.",
        badge: "Most Popular"
    },
    {
        icon: CreditCard,
        title: "Secure Payments",
        description: "Bank-grade security with flexible payment options including installments, crypto, and mobile money across Africa.",
        badge: "Secure"
    },
    {
        icon: Headphones,
        title: "24/7 Premium Support",
        description: "Dedicated travel concierge available around the clock in multiple African languages with local expertise.",
        badge: "Premium"
    },
    {
        icon: Package,
        title: "All-in-One Platform",
        description: "Complete travel ecosystem from flights to local experiences, all optimized for African travelers and destinations.",
        badge: "Comprehensive"
    }
]

export function WhyChooseUs() {
    return (
        <section className="py-24 section-muted relative overflow-hidden">
            <div className="container relative">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6 border border-primary/20">
                        <Award className="h-4 w-4" />
                        Why 50,000+ travelers choose us
                    </div>

                    <h2 className="text-headline mb-6">
                        Built for the
                        <span className="block bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                            Modern African Traveler
                        </span>
                    </h2>

                    <p className="text-body-large text-muted-foreground max-w-3xl mx-auto">
                        Experience the future of travel booking with our platform designed for
                        discerning travelers who demand excellence, security, and convenience across Africa and beyond.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={index}
                                className="group relative premium-card p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-out cursor-pointer"
                            >
                                {/* Badge */}
                                <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {feature.badge}
                                </div>

                                <div className="relative">
                                    {/* Icon Container */}
                                    <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-6 transition-colors duration-200">
                                        <Icon className="h-8 w-8 text-primary" />
                                    </div>

                                    <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors duration-200">
                                        {feature.title}
                                    </h3>

                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* CTA Section with proper button hierarchy */}
                <div className="premium-card p-12 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Star className="h-5 w-5 text-primary fill-primary" />
                        <Star className="h-5 w-5 text-primary fill-primary" />
                        <Star className="h-5 w-5 text-primary fill-primary" />
                        <Star className="h-5 w-5 text-primary fill-primary" />
                        <Star className="h-5 w-5 text-primary fill-primary" />
                        <span className="ml-2 text-sm font-medium text-muted-foreground">4.9/5 from 12,000+ reviews</span>
                    </div>

                    <h3 className="text-2xl font-semibold mb-4">
                        Ready to experience premium travel booking?
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied travelers who trust our platform for their journey needs across Africa and beyond.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button className="premium-button-primary">
                            <Globe className="h-5 w-5 mr-2" />
                            Start Your Journey
                        </Button>
                        <Button className="premium-button-secondary group">
                            Watch Demo
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}