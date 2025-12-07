"use client";

import Link from "next/link";
import { ArrowRight, Search, Bell, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold text-neutral-900 tracking-tight leading-tight">
            Campus Lost & Found,
            <br />
            <span className="text-neutral-400">simplified.</span>
          </h1>
          
          <p className="mt-6 text-lg text-neutral-500 max-w-xl mx-auto">
            Report lost items, find what others have found, and reconnect with your belongings — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Link href="/feed">
              <Button size="lg" className="h-12 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-medium">
                View Feed
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/report/lost">
              <Button size="lg" variant="outline" className="h-12 px-6 border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-lg font-medium">
                Report an Item
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-neutral-100" />

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Search, 
                title: "Quick Search", 
                desc: "Find items by category, location, or date" 
              },
              { 
                icon: Bell, 
                title: "Real-time Updates", 
                desc: "Get notified when matching items appear" 
              },
              { 
                icon: Shield, 
                title: "Secure", 
                desc: "Only verified students can access" 
              },
              { 
                icon: Clock, 
                title: "Fast", 
                desc: "Post in under a minute" 
              },
            ].map((feature) => (
              <div key={feature.title}>
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-neutral-600" />
                </div>
                <h3 className="font-medium text-neutral-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-neutral-100" />

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-neutral-900 text-center mb-12">
            How it works
          </h2>
          
          <div className="space-y-8">
            {[
              { 
                num: "1", 
                title: "Report", 
                desc: "Lost something? Fill out a quick form with details about the item and where you last saw it." 
              },
              { 
                num: "2", 
                title: "Browse", 
                desc: "Check the feed regularly. Someone might have already found what you're looking for." 
              },
              { 
                num: "3", 
                title: "Connect", 
                desc: "Found a match? Use the contact feature to arrange a pickup." 
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-5">
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-medium shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">{step.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
            Ready to get started?
          </h2>
          <p className="text-neutral-500 mb-8">
            Sign in with your account to start reporting and finding items.
          </p>
          <Link href="/api/auth/login">
            <Button size="lg" className="h-12 px-8 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-medium">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-neutral-100">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
          <span className="font-medium text-neutral-600">Gotchu</span>
          <div className="flex gap-6">
            <Link href="/feed" className="hover:text-neutral-600 transition-colors">Feed</Link>
            <Link href="/report/lost" className="hover:text-neutral-600 transition-colors">Report</Link>
            <Link href="/profile" className="hover:text-neutral-600 transition-colors">Profile</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
