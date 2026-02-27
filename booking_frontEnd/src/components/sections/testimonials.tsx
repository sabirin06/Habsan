import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
    {
        name: "Sarah K.",
        title: "Business Executive",
        location: "Lagos, Nigeria",
        trip: "Dubai Business Trip",
        content: "Booking was incredibly smooth and the hotel exceeded all expectations. The 24/7 support made my business trip stress-free. Will definitely use again for all my travels!",
        rating: 5,
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face"
    },
    {
        name: "Michael R.",
        title: "Travel Blogger",
        location: "Cape Town, South Africa",
        trip: "Barcelona Cultural Tour",
        content: "Amazing experience from start to finish. The curated local experiences were authentic and the customer support was incredibly helpful throughout my entire journey.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    }
]

export function Testimonials() {
    return (
        <section className="py-24 section-muted">
            <div className="container">
                <div className="text-center mb-16">
                    <h2 className="text-headline mb-6">
                        What Our Customers Say
                    </h2>
                    <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
                        Join thousands who book with us every month across Africa and beyond
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="grid gap-8 md:grid-cols-2">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="premium-card p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-out"
                            >
                                {/* Trip Badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary border border-primary/20 mb-6">
                                    {testimonial.trip}
                                    <div className="flex items-center gap-1 ml-2">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                                        ))}
                                    </div>
                                </div>

                                {/* Quote */}
                                <blockquote className="text-lg text-foreground mb-6 leading-relaxed">
                                    "{testimonial.content}"
                                </blockquote>

                                {/* Author */}
                                <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                                    />
                                    <div>
                                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                                        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation with proper button hierarchy */}
                    <div className="flex justify-center gap-4 mt-12">
                        <Button className="premium-button-secondary">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button className="premium-button-secondary">
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}