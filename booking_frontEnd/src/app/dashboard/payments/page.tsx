"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CreditCard, Plus, Trash2, Download, Calendar, DollarSign, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

type PaymentMethod = {
  id: string
  type: "card" | "mobile_money"
  label: string
  last4?: string
  expiryMonth?: string
  expiryYear?: string
  provider?: string
  isDefault: boolean
}

type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  status: "completed" | "pending" | "failed"
  paymentMethod: string
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<"methods" | "history">("methods")

  // Mock data
  const paymentMethods: PaymentMethod[] = [
    {
      id: "PM-001",
      type: "card",
      label: "Visa ending in 4242",
      last4: "4242",
      expiryMonth: "12",
      expiryYear: "2025",
      provider: "Visa",
      isDefault: true
    }
  ]

  const transactions: Transaction[] = [
    {
      id: "TXN-001",
      date: "2024-02-10",
      description: "Flight Booking - Mogadishu to Nairobi",
      amount: 450,
      status: "completed",
      paymentMethod: "Visa •••• 4242"
    },
    {
      id: "TXN-002",
      date: "2024-02-08",
      description: "Hotel Booking - Safari Lodge Nairobi",
      amount: 850,
      status: "completed",
      paymentMethod: "Visa •••• 4242"
    },
    {
      id: "TXN-003",
      date: "2024-02-05",
      description: "Airport Pickup - Nairobi",
      amount: 75,
      status: "pending",
      paymentMethod: "Visa •••• 4242"
    },
    {
      id: "TXN-004",
      date: "2024-01-28",
      description: "Maasai Mara Safari Tour",
      amount: 320,
      status: "completed",
      paymentMethod: "Visa •••• 4242"
    }
  ]

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return "text-primary bg-primary/10 border-primary/20"
      case "pending":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
      case "failed":
        return "text-destructive bg-destructive/10 border-destructive/20"
    }
  }

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "failed":
        return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">Manage payment methods and view transaction history</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border/60">
          <button
            onClick={() => setActiveTab("methods")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "methods"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Payment Methods
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Transaction History
          </button>
        </div>

        {/* Payment Methods Tab */}
        {activeTab === "methods" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Securely save your payment information</p>
              <Button className="premium-button-primary" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="clean-card border border-border/60 p-12 text-center">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No payment methods saved</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Add a payment method to speed up your checkout process
                </p>
                <Button className="premium-button-primary" disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Payment Method
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="clean-card border border-border/60 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-600/20 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{method.label}</h3>
                          {method.expiryMonth && method.expiryYear && (
                            <p className="text-sm text-muted-foreground">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          )}
                          {method.isDefault && (
                            <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Security Notice */}
            <div className="clean-card border border-border/60 p-6 bg-muted/30">
              <h3 className="font-semibold mb-3">Payment security</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>All payment information is encrypted and stored securely</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>We never store your full card number or CVV</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>PCI-DSS compliant payment processing</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === "history" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="clean-card border border-border/60 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
                <p className="text-2xl font-bold">$1,695</p>
              </div>
              <div className="clean-card border border-border/60 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
                <p className="text-2xl font-bold">$1,375</p>
              </div>
              <div className="clean-card border border-border/60 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <p className="text-2xl font-bold">{transactions.filter((t) => t.status === "completed").length}</p>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="clean-card border border-border/60 p-5 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{transaction.description}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 shrink-0 ${getStatusColor(transaction.status)}`}
                        >
                          {getStatusIcon(transaction.status)}
                          {transaction.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{transaction.date}</span>
                        <span>{transaction.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-xl font-bold">${transaction.amount}</p>
                      <Button variant="outline" className="rounded-xl" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Download All */}
            <div className="flex justify-center">
              <Button variant="outline" className="rounded-xl">
                <Download className="h-4 w-4 mr-2" />
                Download All Receipts
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
