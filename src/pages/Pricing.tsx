import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { PricingTable, PricingPlan } from '@/components/pricing/PricingTable';
import { PricingCard } from '@/components/pricing/PricingCard';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Info } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
const Pricing: React.FC = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const handleContactSales = () => {
    scrollToForm();
  };
  const handleGetStarted = () => {
    toast({
      title: "Getting started with Free plan",
      description: "Thank you for choosing PrismSearch! Your free plan is being activated."
    });
    // You could redirect to signup here or show a modal
  };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message received",
      description: "Thank you for your interest. Our team will contact you shortly."
    });
  };
  const pricingPlans: PricingPlan[] = [{
    name: "Basic",
    price: "$0",
    period: "",
    description: "For individuals and small projects",
    features: ["Basic web search integration", "Community forum access", "7-day data retention"],
    usage: "1000 searches & 500 chat messages",
    support: "Community support only",
    available: true,
    buttonText: "Get Started",
    buttonAction: handleGetStarted
  }, {
    name: "Starter",
    price: "$15",
    period: "/month",
    description: "For growing teams and projects",
    features: ["Advanced filtering & facets", "Upgraded chat context memory (Unlimited)", "Access to premium AI models", "Email support (48h SLAs)"],
    usage: "5,000 searches & 1,000 chat messages",
    support: "Email support",
    available: false,
    buttonText: "Coming Soon",
    buttonAction: handleContactSales
  }, {
    name: "Professional",
    price: "$30",
    period: "/month",
    description: "For businesses with advanced needs",
    features: ["API access & key management", "Custom embeddings", "Analytics dashboard", "Chat context memory (Unlimited)"],
    usage: "50,000 searches & 15,000 chat messages",
    support: "Priority email & Slack support (24h SLAs)",
    available: false,
    popular: true,
    buttonText: "Coming Soon",
    buttonAction: handleContactSales
  }, {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations requiring custom solutions",
    features: ["Dedicated instance (isolated infrastructure)", "Custom feature development & integrations", "Audit logs"],
    usage: "Unlimited searches, chat, notes and other special enterprise features",
    support: "24/7 phone/Slack & dedicated CSM",
    available: false,
    buttonText: "Contact Sales",
    buttonAction: handleContactSales
  }];
  return <div className="min-h-screen flex flex-col bg-[#1A1F2C]">
      <ParticleBackground color="#FF9E2C" />
      
      {/* Header */}
      <header className="bg-[#1A1F2C] border-b border-orange-500/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/lovable-uploads/3c38b6c8-23f1-4e72-bd31-5fcf258572d9.png" alt="Prism Search Logo" className="h-8 w-auto" />
            <span className="ml-2 text-xl font-bold text-white font-montserrat">PrismSearch</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-orange-200 hover:text-orange-100 font-inter">Home</Link>
            <Link to="/pricing" className="text-orange-100 font-medium font-inter">Pricing</Link>
            <Link to="/chat" className="text-orange-200 hover:text-orange-100 font-inter">Chat</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow relative z-10">
        {/* Hero Section */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4 text-center">
            <motion.h1 initial={{
            opacity: 0,
            y: -20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }} className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-montserrat bg-clip-text text-transparent bg-gradient-to-r from-orange-300 via-orange-400 to-orange-600 animate-gradient-text">
              Simple, Transparent Pricing
            </motion.h1>
            <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }} className="text-xl text-orange-200 max-w-3xl mx-auto mb-10 font-inter">
              Choose the plan that's right for you and start leveraging the power of PrismSearch.
            </motion.p>
            
            <Alert className="bg-orange-900/30 border-orange-500/30 mb-10 max-w-3xl mx-auto">
              <Info className="h-5 w-5 text-orange-300 bg-[#1b1b1b]/0" />
              <AlertTitle className="text-orange-100 font-montserrat">Availability Notice</AlertTitle>
              <AlertDescription className="text-orange-200 font-inter">
                Currently, only the Free plan is available. Paid plans (Starter, Professional, and Enterprise) are coming soon.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Rest of the pricing page remains structurally the same but with updated colors */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <PricingTable plans={pricingPlans} />
            
            {/* Mobile Pricing Cards */}
            <div className="md:hidden space-y-8">
              {pricingPlans.map(plan => <PricingCard key={plan.name} plan={plan} />)}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-12 md:py-16 bg-[#232938]">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 font-montserrat bg-clip-text text-transparent bg-gradient-to-r from-orange-300 via-orange-400 to-orange-600">
              Compare Plan Features
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-[#1A1F2C] border border-orange-500/20 rounded-lg">
                <thead>
                  <tr className="bg-orange-900/20">
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-200 uppercase tracking-wider font-montserrat">Feature</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-orange-200 uppercase tracking-wider font-montserrat">Basic</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-orange-200 uppercase tracking-wider font-montserrat">Starter</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-orange-200 uppercase tracking-wider font-montserrat">Professional</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-orange-200 uppercase tracking-wider font-montserrat">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-500/10">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-100 font-inter">Search queries</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">1,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">5,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">50,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-100 font-inter">Chat messages</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">500</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">1,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">15,000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-100 font-inter">Data retention</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">30 days</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">90 days</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">Custom</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-100 font-inter">API access</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">✓</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">✓</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-100 font-inter">Custom embeddings</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">✓</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">✓</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-100 font-inter">Analytics</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">❌</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">Basic</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">Advanced</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-orange-200 font-inter">Custom</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 font-montserrat bg-clip-text text-transparent bg-gradient-to-r from-orange-300 via-orange-400 to-orange-600">
              Frequently Asked Questions
            </h2>
            
            <div className="max-w-3xl mx-auto grid gap-6">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3,
              delay: 0.1
            }} className="border border-orange-500/20 rounded-lg p-6 backdrop-blur-md bg-orange-900/10">
                <h3 className="text-lg font-semibold text-orange-100 mb-2 font-montserrat">Can I upgrade or downgrade at any time?</h3>
                <p className="text-orange-200 font-inter">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
              </motion.div>
              
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3,
              delay: 0.2
            }} className="border border-orange-500/20 rounded-lg p-6 backdrop-blur-md bg-orange-900/10">
                <h3 className="text-lg font-semibold text-orange-100 mb-2 font-montserrat">How do the usage limits work?</h3>
                <p className="text-orange-200 font-inter">Usage limits are calculated on a monthly basis. If you exceed your plan's limits, you'll have the option to upgrade to a higher tier or purchase additional capacity.</p>
              </motion.div>
              
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3,
              delay: 0.3
            }} className="border border-orange-500/20 rounded-lg p-6 backdrop-blur-md bg-orange-900/10">
                <h3 className="text-lg font-semibold text-orange-100 mb-2 font-montserrat">When will paid plans be available?</h3>
                <p className="text-orange-200 font-inter">We're currently in beta, and only the Free plan is available. Paid plans are expected to launch in Late 2025.</p>
              </motion.div>
              
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3,
              delay: 0.4
            }} className="border border-orange-500/20 rounded-lg p-6 backdrop-blur-md bg-orange-900/10">
                <h3 className="text-lg font-semibold text-orange-100 mb-2 font-montserrat">Do you offer custom solutions?</h3>
                <p className="text-orange-200 font-inter">Yes, our Enterprise plan offers custom solutions tailored to your organization's specific needs. Contact our sales team to discuss your requirements.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-12 md:py-16 bg-[#232938]" ref={formRef} id="contact">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 font-montserrat bg-clip-text text-transparent bg-gradient-to-r from-orange-300 via-orange-400 to-orange-600">
                Contact Our Team
              </h2>
              <p className="text-center text-orange-200 mb-8 font-inter">
                Have questions about our plans or need a custom solution? Get in touch with us.
              </p>
              
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-orange-200 font-montserrat">Name</label>
                  <input type="text" id="name" className="mt-1 block w-full px-3 py-2 border border-orange-500/30 rounded-md bg-orange-900/30 text-orange-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500 font-inter" required />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-orange-200 font-montserrat">Email</label>
                  <input type="email" id="email" className="mt-1 block w-full px-3 py-2 border border-orange-500/30 rounded-md bg-orange-900/30 text-orange-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500 font-inter" required />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-orange-200 font-montserrat">Company</label>
                  <input type="text" id="company" className="mt-1 block w-full px-3 py-2 border border-orange-500/30 rounded-md bg-orange-900/30 text-orange-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500 font-inter" />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-orange-200 font-montserrat">Message</label>
                  <textarea id="message" rows={4} className="mt-1 block w-full px-3 py-2 border border-orange-500/30 rounded-md bg-orange-900/30 text-orange-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500 font-inter" required></textarea>
                </div>
                
                <div>
                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-inter glow-button">
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default Pricing;