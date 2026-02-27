"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { Plus, Edit, Trash2, User, X, Calendar, Globe, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TravelerProfile } from "@/lib/auth-storage"

export default function PassengersPage() {
  const { auth, addTraveler } = useAuth()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPassenger, setEditingPassenger] = useState<TravelerProfile | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    passportNumber: "",
    passportExpiry: "",
    gender: "male",
    frequentFlyer: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newPassenger: TravelerProfile = {
      id: editingPassenger?.id || `PAX-${Date.now()}`,
      label: `${formData.firstName} ${formData.lastName}`,
      ...formData
    }
    addTraveler(newPassenger)
    setShowAddModal(false)
    setEditingPassenger(null)
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: "",
      passportNumber: "",
      passportExpiry: "",
      gender: "male",
      frequentFlyer: ""
    })
  }

  const handleEdit = (passenger: TravelerProfile) => {
    setEditingPassenger(passenger)
    setFormData({
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      dateOfBirth: passenger.dateOfBirth,
      nationality: passenger.nationality,
      passportNumber: passenger.passportNumber,
      passportExpiry: passenger.passportExpiry,
      gender: passenger.gender || "male",
      frequentFlyer: passenger.frequentFlyer || ""
    })
    setShowAddModal(true)
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Saved Passengers</h1>
            <p className="text-muted-foreground mt-1">Manage passenger details for faster checkout</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="premium-button-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Passenger
          </Button>
        </div>

        {/* Passengers List */}
        {auth.travelers.length === 0 ? (
          <div className="clean-card border border-border/60 p-12 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No saved passengers</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add passenger details to speed up your booking process
            </p>
            <Button onClick={() => setShowAddModal(true)} className="premium-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Passenger
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auth.travelers.map((passenger) => (
              <div key={passenger.id} className="clean-card border border-border/60 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {passenger.firstName} {passenger.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">{passenger.gender || "Adult"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(passenger)}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Born: {passenger.dateOfBirth}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>Nationality: {passenger.nationality}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Passport: {passenger.passportNumber}</span>
                  </div>
                  {passenger.frequentFlyer && (
                    <div className="pt-2 border-t border-border/60">
                      <span className="text-xs text-muted-foreground">Frequent Flyer:</span>
                      <p className="font-medium">{passenger.frequentFlyer}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="clean-card border border-border/60 p-6 bg-muted/30">
          <h3 className="font-semibold mb-3">Why save passenger details?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Faster checkout - auto-fill passenger information during booking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Save details for family members and frequent travel companions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Store passport and frequent flyer information securely</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>No need to re-enter information for every booking</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Add/Edit Passenger Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="clean-card border border-border/60 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border/60 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingPassenger ? "Edit Passenger" : "Add Passenger"}</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingPassenger(null)
                }}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="clean-input"
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="clean-input"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="clean-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="clean-input"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Nationality */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nationality</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="clean-input"
                  placeholder="e.g., Somali, Kenyan, Ethiopian"
                  required
                />
              </div>

              {/* Passport */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Passport Number</label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    className="clean-input"
                    placeholder="A12345678"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Passport Expiry</label>
                  <input
                    type="date"
                    value={formData.passportExpiry}
                    onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                    className="clean-input"
                    required
                  />
                </div>
              </div>

              {/* Frequent Flyer (Optional) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Frequent Flyer Number <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.frequentFlyer}
                  onChange={(e) => setFormData({ ...formData, frequentFlyer: e.target.value })}
                  className="clean-input"
                  placeholder="Enter your frequent flyer number"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border/60">
                <Button type="submit" className="flex-1 premium-button-primary">
                  {editingPassenger ? "Save Changes" : "Add Passenger"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingPassenger(null)
                  }}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
