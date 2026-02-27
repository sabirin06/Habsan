"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

const faqs = [
  {
    id: 1,
    question: "How does your Best Price Guarantee work?",
    answer: "If you find a lower price for the same flight within 24 hours of booking, we'll refund the difference plus give you an extra 5% off your next booking. Simply contact our support team with proof of the lower price."
  },
  {
    id: 2,
    question: "Can I change or cancel my flight booking?",
    answer: "Yes, most bookings can be changed or cancelled. Flexible fares allow free changes, while standard fares may have fees. You can manage your booking online or contact our 24/7 support team for assistance."
  },
  {
    id: 3,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, PayPal, bank transfers, and mobile money. All transactions are secured with bank-grade encryption for your safety."
  },
  {
    id: 4,
    question: "How do I receive my flight tickets?",
    answer: "E-tickets are sent instantly to your email after booking confirmation. You can also access them anytime through your account dashboard or our mobile app."
  },
  {
    id: 5,
    question: "What if my flight is delayed or cancelled?",
    answer: "We'll notify you immediately via email and SMS. Our support team will help you with rebooking, refunds, or compensation claims based on airline policies and your rights as a passenger."
  }
]

export function FlightFAQCompact() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <section className="py-20 section-muted">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6 border border-primary/20">
              <HelpCircle className="h-4 w-4" />
              Flight Booking Help
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Questions about
              <span className="block bg-linear-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                booking flights?
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              We've got you covered. Here are answers to the most common questions.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="clean-card overflow-hidden hover:shadow-md transition-all duration-200"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-accent/50 transition-colors"
                >
                  <span className="font-semibold text-foreground pr-4 text-base">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-all duration-150 ease-out shrink-0 ${
                      openFAQ === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {openFAQ === faq.id && (
                  <div className="px-6 pb-5 border-t border-border">
                    <p className="text-muted-foreground leading-relaxed pt-5 text-base">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="text-center mt-16 p-8 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-muted-foreground mb-2 text-lg">
              Need more help?
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Our travel experts respond within 2 minutes, 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-md transition-all duration-200 font-semibold">
                Start Live Chat
              </button>
              <button className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium text-muted-foreground">
                Email Support
              </button>
              <button className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium text-muted-foreground">
                Call +234 800 123 4567
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}