import { Calendar, CheckCircle2, MessageSquare, UserCheck } from "lucide-react"

const steps = [
  {
    icon: UserCheck,
    title: "Choose Your Provider",
    description: "Browse our network of qualified professionals across various industries and find the perfect match for your needs.",
    step: "01"
  },
  {
    icon: Calendar,
    title: "Select Date & Time",
    description: "Pick a convenient appointment slot that fits your schedule. We offer flexible timing including evenings and weekends.",
    step: "02"
  },
  {
    icon: MessageSquare,
    title: "Attend Your Session",
    description: "Meet with your service provider either in-person or via secure video call from the comfort of your home or office.",
    step: "03"
  },
  {
    icon: CheckCircle2,
    title: "Follow-up Care",
    description: "Receive personalized recommendations, deliverables if applicable, and easy scheduling for follow-up sessions.",
    step: "04"
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
            <span>Simple Process</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Book in 3 Easy Steps
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our streamlined booking process makes it simple to connect with trusted professionals. 
            From browsing to booking, everything is designed for your convenience.
          </p>
        </div>

        {/* Steps with visual flow */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-20 left-0 right-0">
            <div className="flex items-center justify-between px-16">
              {[1, 2].map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-0.5 bg-gradient-to-r from-primary/60 to-primary/20 mx-8"
                />
              ))}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.slice(0, 3).map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative text-center">
                  {/* Step number */}
                  <div className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center z-10 shadow-lg">
                    {step.step}
                  </div>
                  
                  <div className="relative bg-card rounded-3xl border border-border p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mx-auto mb-6">
                      <Icon className="h-10 w-10 text-primary" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Additional benefits */}
        <div className="mt-16 grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {[
            { title: "Instant Confirmation", desc: "Get booking confirmations immediately" },
            { title: "Secure Payments", desc: "Safe and encrypted payment processing" },
            { title: "24/7 Support", desc: "Help available whenever you need it" }
          ].map((benefit, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-card border border-border">
              <h4 className="font-semibold text-foreground mb-2">{benefit.title}</h4>
              <p className="text-sm text-muted-foreground">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}