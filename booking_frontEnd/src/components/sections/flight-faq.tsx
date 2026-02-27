"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

const faqs = [
  {
    id: 1,
    question: "Why is online the best booking system?",
    answer: "Online booking systems offer 24/7 availability, instant confirmation, price comparison across multiple airlines, and the convenience of managing your bookings from anywhere. You can also access exclusive online deals and promotions."
  },
  {
    id: 2,
    question: "Do we offer refund or cancellation?",
    answer: "Yes, we offer flexible refund and cancellation policies depending on the fare type you choose. Most bookings can be cancelled within 24 hours for a full refund. Please check the specific terms and conditions for your ticket type."
  },
  {
    id: 3,
    question: "How many flights are offered?",
    answer: "We partner with over 500 airlines worldwide, offering thousands of flights daily to more than 4,000 destinations across the globe. Our extensive network ensures you'll find the perfect flight for your travel needs."
  },
  {
    id: 4,
    question: "Do we offer refund or cancellation?",
    answer: "Our refund and cancellation policies vary by airline and fare type. We offer flexible options including full refunds, partial refunds, and travel credits. Contact our support team for assistance with your specific booking."
  },
  {
    id: 5,
    question: "What if my flight is delayed?",
    answer: "If your flight is delayed, we'll notify you immediately via email and SMS. Depending on the delay duration and cause, you may be entitled to compensation, meal vouchers, or accommodation. Our support team will assist you with rebooking if needed."
  },
  {
    id: 6,
    question: "How can I change my booking?",
    answer: "You can easily modify your booking through our website or mobile app. Simply log into your account, find your booking, and select 'Modify'. Changes may be subject to airline fees and fare differences."
  }
]

export function FlightFAQ() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <section className="py-16 section-muted">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
              <HelpCircle className="h-4 w-4" />
              Support
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-6">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about our flight booking service
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="clean-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-accent/50 transition-colors"
                >
                  <h3 className="font-semibold text-foreground pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
                      openFAQ === faq.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                
                {openFAQ === faq.id && (
                  <div className="px-6 pb-6">
                    <div className="pt-4 border-t border-border dark:border-border/80">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="text-center mt-12 clean-card p-8">
            <h3 className="text-xl font-semibold mb-4">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              Our support team is available 24/7 to help you with any inquiries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 rounded-lg border border-border hover:bg-accent hover:scale-105 transition-all duration-200 font-medium">
                Live Chat
              </button>
              <button className="px-6 py-3 rounded-lg border border-border hover:bg-accent hover:scale-105 transition-all duration-200 font-medium">
                Call Support
              </button>
              <button className="px-6 py-3 rounded-lg border border-border hover:bg-accent hover:scale-105 transition-all duration-200 font-medium">
                Email Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}