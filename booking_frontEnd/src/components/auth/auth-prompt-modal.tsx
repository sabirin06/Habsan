"use client"

import { useRouter } from "next/navigation"
import { X, User, Sparkles, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

type AuthPromptModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  benefits?: string[]
  continueAsGuest?: boolean
  onContinueAsGuest?: () => void
}

export function AuthPromptModal({
  isOpen,
  onClose,
  title = "Sign in to continue",
  message = "Create an account or sign in to save your booking and access exclusive benefits",
  benefits = [
    "Save bookings and access them anytime",
    "Auto-fill passenger details for faster checkout",
    "Save payment methods securely",
    "Manage your travel history"
  ],
  continueAsGuest = true,
  onContinueAsGuest
}: AuthPromptModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="clean-card border border-border/60 max-w-md w-full">
        <div className="p-6 border-b border-border/60 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-emerald-600/20 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Message */}
          <p className="text-center text-muted-foreground">{message}</p>

          {/* Benefits */}
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/register")}
              className="w-full premium-button-primary"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create Account
            </Button>
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="w-full rounded-xl"
            >
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            {continueAsGuest && onContinueAsGuest && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-4 text-muted-foreground">OR</span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    onContinueAsGuest()
                    onClose()
                  }}
                  variant="ghost"
                  className="w-full rounded-xl"
                >
                  Continue as guest
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
