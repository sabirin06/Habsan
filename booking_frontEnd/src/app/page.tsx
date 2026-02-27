import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/sections/hero"
import { WhyChooseUs } from "@/components/sections/why-choose-us"
import { PopularDestinations } from "@/components/sections/popular-destinations"
import { Testimonials } from "@/components/sections/testimonials"
import { TrustedPartners } from "@/components/sections/trusted-partners"
import { CTA } from "@/components/sections/cta"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <WhyChooseUs />
        <PopularDestinations />
        <Testimonials />
        <TrustedPartners />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}