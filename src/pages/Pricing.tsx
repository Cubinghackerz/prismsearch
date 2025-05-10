
import React, { useRef } from 'react';
import { PricingTable, PricingPlan } from '@/components/pricing/PricingTable';
import { PricingCard } from '@/components/pricing/PricingCard';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Info } from 'lucide-react';

const Pricing: React.FC = () => {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSales = () => {
    scrollToForm();
  };

  const handleGetStarted = () => {
    toast({
      title: "Getting started with Free plan",
      description: "Thank you for choosing PrismSearch! Your free plan is being activated.",
    });
    // You could redirect to signup here or show a modal
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message received",
      description: "Thank you for your interest. Our team will contact you shortly.",
    });
  };

  const pricingPlans: PricingPlan[] = [
    {
      name: "Basic",
      price: "$0",
      period: "",
      description: "For individuals and small projects",
      features: [
        "Basic web search integration",
        "Community forum access", 
        "7-day data retention"
      ],
      usage: "1000 searches & 500 chat messages",
      support: "Community support only",
      available: true,
      buttonText: "Get Started",
      buttonAction: handleGetStarted
    },
    {
      name: "Starter",
      price: "$15",
      period: "/month",
      description: "For growing teams and projects",
      features: [
        "Advanced filtering & facets", 
        "Upgraded chat context memory (Unlimited)",
        "Access to premium AI models", 
        "Email support (48h SLAs)"
      ],
      usage: "5,000 searches & 1,000 chat messages",
      support: "Email support",
      available: false,
      buttonText: "Coming Soon",
      buttonAction: handleContactSales
    },
    {
      name: "Professional",
      price: "$30",
      period: "/month",
      description: "For businesses with advanced needs",
      features: [
        "API access & key management", 
        "Custom embeddings", 
        "Analytics dashboard", 
        "Chat context memory (Unlimited)"
      ],
      usage: "50,000 searches & 15,000 chat messages",
      support: "Priority email & Slack support (24h SLAs)",
      available: false,
      popular: true,
      buttonText: "Coming Soon",
      buttonAction: handleContactSales
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations requiring custom solutions",
      features: [
        "Dedicated instance (isolated infrastructure)", 
        "Custom feature development & integrations", 
        "Audit logs"
      ],
      usage: "Unlimited searches, chat, notes and other special enterprise features",
      support: "24/7 phone/Slack & dedicated CSM",
      available: false,
      buttonText: "Contact Sales",
      buttonAction: handleContactSales
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/3c38b6c8-23f1-4e72-bd31-5fcf258572d9.png" 
              alt="Prism Search Logo" 
              className="h-8 w-auto"
            />
            <span className="ml-2 text-xl font-bold text-prism-charcoal font-montserrat">PrismSearch</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-prism-violet font-inter">Home</Link>
            <Link to="/pricing" className="text-prism-violet font-medium font-inter">Pricing</Link>
            <Link to="/chat" className="text-gray-600 hover:text-prism-violet font-inter">Chat</Link>
          </nav>
          <Button className="bg-prism-violet hover:bg-prism-teal text-white font-inter">Sign In</Button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-prism-charcoal mb-6 font-montserrat">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 font-inter">
              Choose the plan that's right for you and start leveraging the power of PrismSearch.
            </p>
            
            <Alert className="bg-amber-50 border-amber-200 mb-10 max-w-3xl mx-auto">
              <Info className="h-5 w-5 text-amber-500" />
              <AlertTitle className="text-amber-800 font-montserrat">Availability Notice</AlertTitle>
              <AlertDescription className="text-amber-700 font-inter">
                Currently, only the Free plan is available. Paid plans (Starter, Professional, and Enterprise) are coming soon.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Pricing Tables Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <PricingTable plans={pricingPlans} />
            
            {/* Mobile Pricing Cards */}
            <div className="md:hidden space-y-8">
              {pricingPlans.map((plan) => (
                <PricingCard key={plan.name} plan={plan} />
              ))}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-prism-charcoal mb-12 font-montserrat">
              Compare Plan Features
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Feature</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Basic</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Starter</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Professional</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider font-montserrat">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-inter">Search queries</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">1,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">5,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">50,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-inter">Chat messages</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">500</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">1,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">15,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-inter">Data retention</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">7 days</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">30 days</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">90 days</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">Custom</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-inter">API access</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">✓</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">✓</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-inter">Custom embeddings</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">✓</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">✓</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-inter">Analytics</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">Basic</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">Advanced</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-inter">Custom</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-prism-charcoal mb-12 font-montserrat">
              Frequently Asked Questions
            </h2>
            
            <div className="max-w-3xl mx-auto grid gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-prism-charcoal mb-2 font-montserrat">Can I upgrade or downgrade at any time?</h3>
                <p className="text-gray-600 font-inter">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-prism-charcoal mb-2 font-montserrat">How do the usage limits work?</h3>
                <p className="text-gray-600 font-inter">Usage limits are calculated on a monthly basis. If you exceed your plan's limits, you'll have the option to upgrade to a higher tier or purchase additional capacity.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-prism-charcoal mb-2 font-montserrat">When will paid plans be available?</h3>
                <p className="text-gray-600 font-inter">We're currently in beta, and only the Free plan is available. Paid plans are expected to launch in Q3 2023. Join our waitlist to be notified when they become available.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-prism-charcoal mb-2 font-montserrat">Do you offer custom solutions?</h3>
                <p className="text-gray-600 font-inter">Yes, our Enterprise plan offers custom solutions tailored to your organization's specific needs. Contact our sales team to discuss your requirements.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-12 md:py-16 bg-gray-50" ref={formRef} id="contact">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-prism-charcoal mb-6 font-montserrat">
                Contact Our Team
              </h2>
              <p className="text-center text-gray-600 mb-8 font-inter">
                Have questions about our plans or need a custom solution? Get in touch with us.
              </p>
              
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-montserrat">Name</label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-prism-violet focus:border-prism-violet font-inter"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-montserrat">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-prism-violet focus:border-prism-violet font-inter"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 font-montserrat">Company</label>
                  <input
                    type="text"
                    id="company"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-prism-violet focus:border-prism-violet font-inter"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 font-montserrat">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-prism-violet focus:border-prism-violet font-inter"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <Button 
                    type="submit" 
                    className="w-full bg-prism-violet hover:bg-prism-teal text-white font-inter"
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
