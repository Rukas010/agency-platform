import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10">
          <span className="text-blue-400 text-sm font-medium">
            The #1 Platform for AI Agencies
          </span>
        </div>

        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Launch Your{' '}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI Agency
          </span>
          {' '}in Minutes
        </h2>

        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
          The all-in-one platform to sell AI automation services to local businesses.
          Review management, AI chatbots, and missed-call text-back — all white-labeled
          under your brand.
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

        <p className="text-gray-500 text-sm mt-6">Free trial available • Cancel anytime</p>
      </section>
      {/* Value Props */}
      <section className="border-y border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-white">5 min</p>
            <p className="text-gray-500 text-sm">Setup Time</p>
          </div>
          <div className="w-px bg-gray-800 hidden sm:block"></div>
          <div>
            <p className="text-3xl font-bold text-white">$0</p>
            <p className="text-gray-500 text-sm">To Get Started</p>
          </div>
          <div className="w-px bg-gray-800 hidden sm:block"></div>
          <div>
            <p className="text-3xl font-bold text-white">100%</p>
            <p className="text-gray-500 text-sm">White-Labeled</p>
          </div>
          <div className="w-px bg-gray-800 hidden sm:block"></div>
          <div>
            <p className="text-3xl font-bold text-white">1 Client</p>
            <p className="text-gray-500 text-sm">Covers Your Subscription</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need to Run a Profitable Agency
          </h3>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Stop piecing together 10 different tools. One platform. One login. One bill.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon="⭐"
            title="Review Automation"
            description="Automatically request and manage Google reviews for your clients. Smart follow-ups, tracking, and analytics."
          />
          <FeatureCard
            icon="🤖"
            title="AI Chatbots"
            description="Deploy industry-specific AI chatbots on client websites. Handles FAQs, bookings, and lead capture 24/7."
          />
          <FeatureCard
            icon="📱"
            title="Missed Call Text-Back"
            description="Never lose a lead. When a client misses a call, automatically text the caller back within seconds."
          />
          <FeatureCard
            icon="🏷️"
            title="White-Label Everything"
            description="Your brand. Your logo. Your colors. Your clients never see us — they only see your agency."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-gray-800 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h3>
            <p className="text-gray-400 text-lg">Four steps to your first paying client</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <StepCard number="1" title="Sign Up" description="Create your free account in 30 seconds. No credit card needed." />
            <StepCard number="2" title="Add Clients" description="Add local businesses and configure their AI services." />
            <StepCard number="3" title="Deploy" description="Launch review campaigns, chatbots, and automations instantly." />
            <StepCard number="4" title="Get Paid" description="Charge clients \$300-1,500/month. Keep 100% of the profit." />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-gray-800 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h3>
            <p className="text-gray-400 text-lg">One client covers your entire subscription</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="97"
              description="Perfect for getting started"
              features={[
                '3 client accounts',
                'Review automation',
                'Basic chatbot',
                'Email support',
                'White-label dashboard',
              ]}
              cta="Start Free Trial"
              highlighted={false}
            />
            <PricingCard
              name="Growth"
              price="197"
              description="Most popular for growing agencies"
              features={[
                '10 client accounts',
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
              price="397"
              description="For established agencies"
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
      </section>

      {/* CTA */}
      <section className="border-t border-gray-800 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Launch Your AI Agency?
          </h3>
          <p className="text-gray-400 text-lg mb-8">
            Join hundreds of agencies already using our platform to grow their business.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
          >
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          © 2025 AgencyKit. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
      <div className="text-3xl mb-4">{icon}</div>
      <h4 className="text-white font-semibold text-lg mb-2">{title}</h4>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
        {number}
      </div>
      <h4 className="text-white font-semibold text-lg mb-2">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  )
}

function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  highlighted,
}: {
  name: string
  price: string
  description: string
  features: string[]
  cta: string
  highlighted: boolean
}) {
  return (
    <div
      className={`rounded-xl p-8 ${
        highlighted
          ? 'bg-blue-600/10 border-2 border-blue-500 relative'
          : 'bg-gray-900 border border-gray-800'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}
      <h4 className="text-white font-semibold text-xl mb-1">{name}</h4>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold text-white">${price}</span>
        <span className="text-gray-400">/month</span>
      </div>
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
  )
}
