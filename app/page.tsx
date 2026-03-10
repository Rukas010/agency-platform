'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

function FadeInSection({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className={`fade-section ${visible ? 'fade-section-visible' : ''} ${className ?? ''}`}
    >
      {children}
    </section>
  );
}

export default function Home() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const isYearly = billingPeriod === 'yearly';

  const billingLabel = isYearly
    ? 'Billed yearly (20% discount)'
    : 'Billed monthly';

  const priceFor = (monthly: number) =>
    isYearly ? Math.round(monthly * 12 * 0.8) : monthly;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-white">
            Agency<span className="text-blue-500">Kit</span>
          </h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero + Preview */}
      <section className="relative border-b border-gray-800 overflow-hidden">
        <div className="absolute inset-0 hero-gradient" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-24">
          <div className="text-center mb-12">
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10">
              <span className="text-blue-400 text-sm font-medium">
                AI-powered platform for local agency services
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Launch a premium{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                AI agency
              </span>{' '}
              in days
            </h2>

            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              Offer review automation, AI chatbots, and missed-call follow up under
              your own brand — with a done-for-you dashboard your clients will love.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
              >
                Start Your Agency Free →
              </Link>
              <Link
                href="#features"
                className="border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-8 py-4 rounded-xl text-lg font-medium transition-colors"
              >
                See Features
              </Link>
            </div>

            <p className="text-gray-500 text-sm mt-6">
              Free trial available • Cancel anytime
            </p>
          </div>

          {/* Dashboard mockup */}
          <FadeInSection className="mt-8">
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl shadow-blue-500/20 overflow-hidden">
              <div className="flex items-center gap-1 px-4 py-3 border-b border-gray-800 bg-gray-900/80">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-3 text-xs text-gray-500">
                  agencykit.app • Dashboard
                </span>
              </div>
              <div className="flex">
                {/* Sidebar */}
                <div className="hidden md:flex flex-col w-52 border-r border-gray-800 bg-gray-950/80 p-4">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-semibold text-white">
                      AK
                    </div>
                    <div className="text-sm text-white font-semibold truncate">
                      Your Agency
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 px-2 py-2 rounded-md bg-blue-600 text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                      <span>Overview</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-2 rounded-md text-gray-400 hover:bg-gray-900/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-600/70" />
                      <span>Clients</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-2 rounded-md text-gray-400 hover:bg-gray-900/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-600/70" />
                      <span>Reviews</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-2 rounded-md text-gray-400 hover:bg-gray-900/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-600/70" />
                      <span>Chatbots</span>
                    </div>
                  </div>
                </div>
                {/* Main preview */}
                <div className="flex-1 p-4 md:p-6 space-y-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">
                        Dashboard Overview
                      </p>
                      <p className="text-sm text-white font-semibold">
                        Local Business AI Services
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/40">
                        White-labeled
                      </span>
                      <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/40">
                        Reseller Ready
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    {['Clients', 'Reviews Sent', 'Reviews Received', 'Active Chatbots'].map(
                      (label, idx) => (
                        <div
                          key={label}
                          className="rounded-xl border border-gray-800 bg-gray-900/80 px-4 py-3"
                        >
                          <p className="text-xs text-gray-400 mb-1">{label}</p>
                          <p className="text-xl font-bold text-white">
                            {idx === 0 ? '12' : '––'}
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
                      <p className="text-xs text-gray-400 mb-3 font-medium">
                        Client Snapshot
                      </p>
                      <div className="space-y-2 text-xs">
                        {['Acme Dental', 'BrightSide Plumbing', 'Luna Beauty Studio'].map(
                          (name, i) => (
                            <div
                              key={name}
                              className="flex items-center justify-between rounded-md bg-gray-950/70 px-3 py-2"
                            >
                              <span className="text-gray-200">{name}</span>
                              <span className="text-[10px] text-gray-400">
                                {i === 0 ? 'Reviews • Chatbot' : 'Onboarding'}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
                      <p className="text-xs text-gray-400 mb-3 font-medium">
                        What your clients see
                      </p>
                      <p className="text-sm text-gray-300 mb-3">
                        Clean, modern UI with your logo, your colors, and your pricing — no
                        engineering required.
                      </p>
                      <ul className="space-y-2 text-xs text-gray-400">
                        <li>• One login for all services</li>
                        <li>• Clear visibility into results</li>
                        <li>• Faster approvals for your offers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Features */}
      <FadeInSection id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need to run a modern agency
          </h3>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Replace a patchwork of tools with one platform built for agencies, freelancers,
            and operators who want recurring revenue.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon="⭐"
            title="Review Automation"
            description="Request and track reviews automatically so your clients stay ahead of local competitors."
          />
          <FeatureCard
            icon="🤖"
            title="AI Chatbots"
            description="Deploy website chatbots tailored to each industry to handle FAQs, bookings, and lead capture."
          />
          <FeatureCard
            icon="📱"
            title="Missed Call Text-Back"
            description="When a call is missed, follow up with a text so every lead gets a response."
          />
          <FeatureCard
            icon="🏷️"
            title="White-Label Everything"
            description="Your brand, your domain, your pricing. Clients never see the underlying platform."
          />
        </div>
      </FadeInSection>

      {/* How It Works */}
      <FadeInSection className="border-t border-gray-800 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How it works
            </h3>
            <p className="text-gray-400 text-lg">
              Four simple steps to launch your first clients
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Sign Up"
              description="Create your account in under a minute. No technical setup required."
            />
            <StepCard
              number="2"
              title="Add Clients"
              description="Onboard local businesses and connect their existing channels."
            />
            <StepCard
              number="3"
              title="Launch Services"
              description="Switch on review automation, chatbots, and follow-up flows in a few clicks."
            />
            <StepCard
              number="4"
              title="Scale Retainers"
              description="Charge monthly retainers under your brand and add new services over time."
            />
          </div>
        </div>
      </FadeInSection>

      {/* Who is this for */}
      <FadeInSection className="border-t border-gray-800 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Who is this for?
            </h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Agency owners, freelancers, and operators who want predictable recurring
              revenue without building software from scratch.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <WhoForCard
              title="Marketing Agencies"
              description="Scale your services with AI automation while keeping client communication simple and branded."
            />
            <WhoForCard
              title="Freelancers"
              description="Add a recurring revenue layer to your services with a dashboard you can manage yourself."
            />
            <WhoForCard
              title="Side Hustlers"
              description="Start a lean, productized service business in your spare time with the tools already built."
            />
          </div>
        </div>
      </FadeInSection>

      {/* Pricing */}
      <FadeInSection className="border-t border-gray-800 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h3>
            <p className="text-gray-400 text-lg">
              Choose a plan that matches where you are now — and upgrade only when you need
              to.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center mb-10">
            <div className="inline-flex items-center gap-3 text-sm text-gray-400">
              <span
                className={
                  !isYearly ? 'text-white font-semibold' : 'text-gray-400 font-medium'
                }
              >
                Monthly
              </span>
              <button
                type="button"
                className="relative inline-flex items-center rounded-full bg-gray-900 border border-gray-800 px-1 py-1 text-xs"
                onClick={() =>
                  setBillingPeriod((prev) => (prev === 'monthly' ? 'yearly' : 'monthly'))
                }
              >
                <span
                  className={`inline-flex items-center justify-center rounded-full px-3 py-1 transition-colors duration-200 ${
                    !isYearly
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300'
                  }`}
                >
                  Monthly
                </span>
                <span
                  className={`inline-flex items-center justify-center rounded-full px-3 py-1 transition-colors duration-200 ${
                    isYearly
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300'
                  }`}
                >
                  Yearly
                </span>
              </button>
              <span className="text-xs text-emerald-400">
                {isYearly ? 'Save around 20% on all plans' : 'Switch to yearly to save'}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price={priceFor(97).toString()}
              description="Perfect for getting started with a few clients."
              billingLabel={billingLabel}
              features={[
                'Up to 3 client accounts',
                'Review automation',
                'Basic chatbot widgets',
                'Email support',
                'White-label dashboard',
              ]}
              cta="Start Free Trial"
              highlighted={false}
            />
            <PricingCard
              name="Growth"
              price={priceFor(197).toString()}
              description="For growing agencies that want to productize services."
              billingLabel={billingLabel}
              features={[
                'Up to 10 client accounts',
                'Review automation',
                'Advanced AI chatbots',
                'Missed call text-back',
                'Priority support',
                'Custom branding',
                'Analytics dashboard',
              ]}
              cta="Start Free Trial"
              highlighted={true}
            />
            <PricingCard
              name="Scale"
              price={priceFor(397).toString()}
              description="For established teams managing a larger client base."
              billingLabel={billingLabel}
              features={[
                'Unlimited clients',
                'All features included',
                'AI voice agents',
                'API access',
                'Dedicated support',
                'Custom integrations',
                'Team accounts',
              ]}
              cta="Start Free Trial"
              highlighted={false}
            />
          </div>
        </div>
      </FadeInSection>

      {/* FAQ */}
      <FadeInSection className="border-t border-gray-800 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently asked questions
            </h3>
            <p className="text-gray-400 text-lg">
              Answers to common questions about using the platform for your agency.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger className="text-left text-white">
                Do I need technical skills?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                No. The platform is built to be point-and-click. You configure services
                with simple forms and toggles — no coding required.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger className="text-left text-white">
                Can my clients see your branding?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                No. Everything is white-labeled to your agency — your logo, your colors,
                and your domain. Your clients only see your brand.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger className="text-left text-white">
                How quickly can I get my first client?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                That depends on your existing network and outreach, but the platform is
                designed to help you get client-ready offers live in days, not months.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-4">
              <AccordionTrigger className="text-left text-white">
                What if I need help?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                We include support on all plans. If you&apos;re stuck, reach out and we&apos;ll
                help you get unstuck as quickly as possible.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-5">
              <AccordionTrigger className="text-left text-white">
                Can I cancel anytime?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Yes. There are no long-term contracts or commitments. If the platform
                isn&apos;t the right fit, you can cancel from your account settings.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </FadeInSection>

      {/* Final CTA */}
      <FadeInSection className="border-t border-gray-800 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to launch your AI-powered agency?
          </h3>
          <p className="text-gray-400 text-lg mb-8">
            Set up your white-labeled dashboard, add your first clients, and start
            offering automation services under your brand.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
          >
            Get Started Free →
          </Link>
        </div>
      </FadeInSection>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          © 2025 AgencyKit. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
      <div className="text-3xl mb-4">{icon}</div>
      <h4 className="text-white font-semibold text-lg mb-2">{title}</h4>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
        {number}
      </div>
      <h4 className="text-white font-semibold text-lg mb-2">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function WhoForCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
      <h4 className="text-white font-semibold text-lg mb-2">{title}</h4>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  billingLabel,
  features,
  cta,
  highlighted,
}: {
  name: string;
  price: string;
  description: string;
  billingLabel: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-8 ${
        highlighted
          ? 'bg-blue-600/10 border border-blue-500/80 relative shadow-[0_0_60px_rgba(59,130,246,0.35)]'
          : 'bg-gray-900 border border-gray-800'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg shadow-blue-500/40">
          Most Popular
        </div>
      )}
      <h4 className="text-white font-semibold text-xl mb-1">{name}</h4>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <div className="mb-2">
        <span className="text-4xl font-bold text-white">${price}</span>
        <span className="text-gray-400">/month</span>
      </div>
      <p className="text-xs text-gray-500 mb-6">{billingLabel}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
            <span className="text-blue-400">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className={`block text-center py-3 px-4 rounded-lg font-medium transition-colors ${
          highlighted
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-800 hover:bg-gray-700 text-white'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
