"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Plane, Mail, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [emailError, setEmailError] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError("")

    if (!email.trim()) {
      setEmailError("Email is required")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20 pb-12">
          <div className="container py-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center justify-center mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg">
                    <Plane className="h-8 w-8 text-primary-foreground" />
                  </div>
                </Link>
              </div>

              <div className="clean-card border border-border/60 p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-3">Check your email</h1>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to <strong className="text-foreground">{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Click the link in the email to reset your password. If you don't see it, check your spam folder.
                </p>
                <Link href="/login">
                  <Button className="premium-button-primary">Back to sign in</Button>
                </Link>
              </div>

              <p className="text-center mt-6 text-sm text-muted-foreground">
                Didn't receive the email?{" "}
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setEmail("")
                  }}
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12">
        <div className="container py-12">
          <div className="max-w-md mx-auto">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg">
                  <Plane className="h-8 w-8 text-primary-foreground" />
                </div>
              </Link>
              <h1 className="text-headline">Forgot password?</h1>
              <p className="text-muted-foreground mt-2">
                No worries, we'll send you reset instructions
              </p>
            </div>

            {/* Form */}
            <div className="clean-card border border-border/60 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setEmailError("")
                      }}
                      className={`clean-input pl-12 ${emailError ? "border-destructive" : ""}`}
                      placeholder="you@example.com"
                      disabled={loading}
                    />
                  </div>
                  {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                </div>

                <Button type="submit" className="w-full premium-button-primary" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>

                <Link href="/login">
                  <Button type="button" variant="ghost" className="w-full rounded-xl">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to sign in
                  </Button>
                </Link>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
