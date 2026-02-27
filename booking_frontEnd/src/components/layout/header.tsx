"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Plane, Menu, X, Sparkles, Globe, User, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { isLoggedIn, user, signOut } = useAuth()
  const router = useRouter()

  return (
    <header className="fixed top-0 z-50 w-full bg-background/80 dark:bg-background/90 backdrop-blur-2xl border-b border-border/50">
      {/* Premium Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50" />

      <div className="container flex h-20 items-center justify-between relative">
        {/* Premium Logo */}
        <Link href="/" className="flex items-center space-x-4 group">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Plane className="h-6 w-6 text-primary-foreground group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary/40 rounded-full animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
              TravelPro
            </span>
            <span className="text-xs text-muted-foreground -mt-1">
              Premium African Travel
            </span>
          </div>
        </Link>

        {/* Premium Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-2">
          {[
            { href: "/", label: "Home", active: false },
            { href: "/flights", label: "Flights", active: false },
            { href: "/stay?type=hotel", label: "Stay", active: false },
            { href: "/experiences", label: "Experiences", active: false },
            { href: "/transport", label: "Transport", active: false },
            // { href: "#about", label: "About", active: false }
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-accent/50 ${item.active
                ? "text-primary bg-primary/10 border border-primary/20"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Premium Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {isLoggedIn ? (
            <div className="relative">
              <Button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="premium-button-secondary text-sm"
              >
                <User className="h-4 w-4 mr-2" />
                {user?.firstName || user?.email?.split("@")[0] || "Account"}
              </Button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 z-50 clean-card border border-border/60 overflow-hidden">
                    <div className="p-4 border-b border-border/60">
                      <div className="font-semibold text-sm">{user?.firstName || "User"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{user?.email}</div>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2.5 text-sm rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="block px-4 py-2.5 text-sm rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Profile & Settings
                      </Link>
                      <button
                        onClick={() => {
                          signOut()
                          setShowUserMenu(false)
                          router.push("/")
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm rounded-lg hover:bg-accent transition-colors flex items-center gap-2 text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Button onClick={() => router.push("/login")} className="premium-button-secondary text-sm">
                Sign In
              </Button>
              <Button onClick={() => router.push("/register")} className="premium-button-primary group text-sm">
                <Globe className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-3 lg:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-12 w-12 rounded-xl p-0 hover:bg-accent/50 hover:scale-105 transition-all duration-200"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Premium Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-background/95 dark:bg-background/98 backdrop-blur-2xl border-t border-border/50">
          <div className="container py-8 space-y-6">
            {[
              { href: "/", label: "Home", active: false },
              { href: "/flights", label: "Flights", active: false },
              { href: "/stay?type=hotel", label: "Stay", active: false },
              { href: "/experiences", label: "Experiences", active: false },
              { href: "/transport", label: "Transport", active: false },
              // { href: "#about", label: "About", active: false }
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-6 py-4 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${item.active
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="flex flex-col space-y-4 pt-6 border-t border-border/50">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-6 py-4 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Button
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                      router.push("/")
                    }}
                    className="premium-button-secondary justify-start group text-sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => router.push("/login")} className="premium-button-secondary justify-start group text-sm">
                    Sign In
                  </Button>
                  <Button onClick={() => router.push("/register")} className="premium-button-primary group text-sm">
                    <Sparkles className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}