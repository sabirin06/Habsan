"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MessageCircle, Mail, Phone, HelpCircle, Send, Clock, CheckCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

type Ticket = {
  id: string
  subject: string
  category: string
  status: "open" | "in_progress" | "resolved"
  createdAt: string
  lastUpdate: string
}

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<"tickets" | "contact" | "faq">("tickets")
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  const tickets: Ticket[] = [
    {
      id: "TKT-001",
      subject: "Unable to modify flight booking",
      category: "Booking Issue",
      status: "in_progress",
      createdAt: "2024-02-08",
      lastUpdate: "2024-02-09"
    },
    {
      id: "TKT-002",
      subject: "Refund request for cancelled hotel",
      category: "Refund",
      status: "resolved",
      createdAt: "2024-01-25",
      lastUpdate: "2024-01-28"
    }
  ]

  const faqs = [
    {
      id: "faq-1",
      question: "How do I cancel or modify my booking?",
      answer:
        "You can cancel or modify your booking from the 'My Bookings' section in your dashboard. Click on the booking you want to change, then select 'Modify' or 'Cancel'. Please note that cancellation policies vary by provider."
    },
    {
      id: "faq-2",
      question: "What payment methods do you accept?",
      answer:
        "We accept major credit cards (Visa, Mastercard, American Express) and mobile money payments. All payments are processed securely through our encrypted payment gateway."
    },
    {
      id: "faq-3",
      question: "How do I add passengers to my bookings?",
      answer:
        "Go to the 'Passengers' section in your dashboard and click 'Add Passenger'. Fill in the required details including passport information. These details will be auto-filled during checkout for faster booking."
    },
    {
      id: "faq-4",
      question: "Can I save my favorite hotels and experiences?",
      answer:
        "Yes! Click the heart icon on any hotel or experience to save it to your 'Saved Items'. You can access all your saved items from your dashboard."
    },
    {
      id: "faq-5",
      question: "What is your refund policy?",
      answer:
        "Refund policies vary by service provider and booking type. Most bookings offer free cancellation up to 24-48 hours before the service date. Check the specific cancellation policy shown during booking."
    },
    {
      id: "faq-6",
      question: "How do I download my booking confirmation?",
      answer:
        "Go to 'My Bookings', select your booking, and click 'Download Ticket' or 'Download Invoice'. Your confirmation will be downloaded as a PDF."
    }
  ]

  const getStatusColor = (status: Ticket["status"]) => {
    switch (status) {
      case "open":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
      case "in_progress":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20"
      case "resolved":
        return "text-primary bg-primary/10 border-primary/20"
    }
  }

  const getStatusIcon = (status: Ticket["status"]) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-muted-foreground mt-1">Get help with your bookings and account</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border/60 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors shrink-0 ${
              activeTab === "tickets"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Support Tickets
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors shrink-0 ${
              activeTab === "contact"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Contact Us
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors shrink-0 ${
              activeTab === "faq"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            FAQ
          </button>
        </div>

        {/* Tickets Tab */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">View and track your support tickets</p>
              <Button className="premium-button-primary" disabled>
                <Send className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </div>

            {tickets.length === 0 ? (
              <div className="clean-card border border-border/60 p-12 text-center">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No support tickets</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Need help? Create a support ticket and we'll get back to you soon
                </p>
                <Button className="premium-button-primary" disabled>
                  Create Your First Ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="clean-card border border-border/60 p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(ticket.status)}`}
                          >
                            {getStatusIcon(ticket.status)}
                            {ticket.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Category: {ticket.category}</p>
                      </div>
                      <Button variant="outline" className="rounded-xl" size="sm">
                        View Details
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/60">
                      <span>Ticket ID: {ticket.id}</span>
                      <span>Created: {ticket.createdAt}</span>
                      <span>Last update: {ticket.lastUpdate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="max-w-2xl space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="clean-card border border-border/60 p-6 text-center">
                <div className="inline-flex p-4 rounded-xl bg-primary/10 mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-4">Get help via email within 24 hours</p>
                <a
                  href="mailto:support@travelpro.com"
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  support@travelpro.com
                </a>
              </div>

              {/* Phone */}
              <div className="clean-card border border-border/60 p-6 text-center">
                <div className="inline-flex p-4 rounded-xl bg-blue-500/10 mb-4">
                  <Phone className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="text-sm text-muted-foreground mb-4">Available Mon-Fri 9AM-6PM EAT</p>
                <a
                  href="tel:+252612345678"
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  +252 61 234 5678
                </a>
              </div>
            </div>

            {/* Live Chat */}
            <div className="clean-card border border-border/60 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Live Chat Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Chat with our support team in real-time for immediate assistance
                  </p>
                </div>
              </div>
              <Button className="premium-button-primary" disabled>
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Live Chat (Coming soon)
              </Button>
            </div>

            {/* Office Hours */}
            <div className="clean-card border border-border/60 p-6 bg-muted/30">
              <h3 className="font-semibold mb-3">Support Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM EAT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM EAT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div className="max-w-2xl space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="clean-card border border-border/60 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-accent/50 transition-colors"
                >
                  <h3 className="font-semibold pr-4">{faq.question}</h3>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${
                      expandedFaq === faq.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-6 text-sm text-muted-foreground border-t border-border/60 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}

            {/* Still need help? */}
            <div className="clean-card border border-border/60 p-6 bg-muted/30 text-center">
              <h3 className="font-semibold mb-2">Still need help?</h3>
              <p className="text-sm text-muted-foreground mb-4">Can't find what you're looking for? Contact our support team</p>
              <Button
                onClick={() => setActiveTab("contact")}
                className="premium-button-primary"
              >
                Contact Support
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
