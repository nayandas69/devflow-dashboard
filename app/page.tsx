/**
 * DevFlow Dashboard - Landing Page
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Users, BarChart3, Shield, Zap, Globe, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

const features = [
  {
    icon: FolderOpen,
    title: "Project Management",
    description: "Organize and track your client, personal, and open-source projects in one place.",
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Keep track of client details, project requirements, and communication history.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Visual progress bars and timeline tracking to stay on top of deadlines.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is protected with enterprise-grade security and privacy controls.",
  },
  {
    icon: Zap,
    title: "Fast & Responsive",
    description: "Built with modern technologies for lightning-fast performance on all devices.",
  },
  {
    icon: Globe,
    title: "Open Source",
    description: "Fully open-source and customizable to fit your specific workflow needs.",
  },
]

const benefits = [
  "Track multiple project types in one dashboard",
  "Monitor payment status and project progress",
  "Manage client relationships effectively",
  "Set and track project deadlines",
  "Beautiful, modern interface",
  "Mobile-responsive design",
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">DF</span>
            </div>
            <span className="font-bold text-xl gradient-text">DevFlow</span>
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            🚀 Now in Beta
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Project Management
            <br />
            Made Simple
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            DevFlow is a modern project management dashboard designed for developers, freelancers, and open-source
            maintainers. Track your projects, manage clients, and stay organized.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to manage projects</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to streamline your workflow and boost productivity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why choose DevFlow?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Built specifically for developers and freelancers who need a simple, powerful way to manage their
                projects and clients.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="h-4 bg-primary/30 rounded w-3/4"></div>
                  <div className="h-4 bg-primary/20 rounded w-1/2"></div>
                  <div className="h-4 bg-primary/25 rounded w-2/3"></div>
                  <div className="space-y-2 pt-4">
                    <div className="h-8 bg-card rounded flex items-center px-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <div className="h-2 bg-muted rounded flex-1"></div>
                    </div>
                    <div className="h-8 bg-card rounded flex items-center px-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      <div className="h-2 bg-muted rounded flex-1"></div>
                    </div>
                    <div className="h-8 bg-card rounded flex items-center px-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <div className="h-2 bg-muted rounded flex-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to streamline your projects?</h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of developers and freelancers who trust DevFlow to manage their projects efficiently.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">DF</span>
                </div>
                <span className="font-bold text-xl gradient-text">DevFlow</span>
              </Link>
              <p className="text-muted-foreground">Modern project management for developers and freelancers.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/features" className="block hover:text-foreground">
                  Features
                </Link>
                <Link href="/pricing" className="block hover:text-foreground">
                  Pricing
                </Link>
                <Link href="/demo" className="block hover:text-foreground">
                  Demo
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/about" className="block hover:text-foreground">
                  About
                </Link>
                <Link href="/contact" className="block hover:text-foreground">
                  Contact
                </Link>
                <Link href="/blog" className="block hover:text-foreground">
                  Blog
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/help" className="block hover:text-foreground">
                  Help Center
                </Link>
                <Link href="/docs" className="block hover:text-foreground">
                  Documentation
                </Link>
                <Link href="https://github.com/nayandas69/devflow-dashboard" className="block hover:text-foreground">
                  GitHub
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              © 2024 DevFlow. Built with ❤️ by{" "}
              <a href="https://github.com/nayandas69" className="text-primary hover:underline">
                Nayan Das
              </a>
              . All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
