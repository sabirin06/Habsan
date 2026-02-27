import Link from "next/link"
import { Plane, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Plane className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">TravelPro</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Your trusted partner for seamless travel experiences. Book flights, hotels, 
              and local experiences with confidence.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-6">Services</h3>
            <ul className="space-y-4">
              {[
                "Flight Bookings",
                "Hotel Reservations", 
                "Car Rentals",
                "Local Experiences",
                "Travel Insurance",
                "Group Bookings"
              ].map((service) => (
                <li key={service}>
                  <Link href="#" className="text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-200">
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-6">Support</h3>
            <ul className="space-y-4">
              {[
                "Help Center",
                "Contact Us",
                "Booking Support",
                "Cancellation Policy",
                "Travel Guidelines",
                "FAQ"
              ].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-6">Company</h3>
            <ul className="space-y-4">
              {[
                "About Us",
                "Careers",
                "Press",
                "Privacy Policy",
                "Terms of Service",
                "Sitemap"
              ].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-muted-foreground text-sm">
              © 2024 TravelPro. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <span className="text-sm text-muted-foreground">Download our app:</span>
              <div className="flex gap-3">
                <Link href="#" className="inline-flex items-center gap-2 px-4 py-2 clean-card hover:shadow-sm transition-shadow">
                  <span className="text-sm font-medium">App Store</span>
                </Link>
                <Link href="#" className="inline-flex items-center gap-2 px-4 py-2 clean-card hover:shadow-sm transition-shadow">
                  <span className="text-sm font-medium">Google Play</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}