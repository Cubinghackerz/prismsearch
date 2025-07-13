
import React from 'react';
import { PricingTable } from '@/components/pricing/PricingTable';
import { PricingCard } from '@/components/pricing/PricingCard';
import { PricingToggle } from '@/components/pricing/PricingToggle';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Pricing: React.FC = () => {
  const [isMonthly, setIsMonthly] = React.useState(true);
  const { toast } = useToast();

  const togglePricing = () => {
    setIsMonthly(!isMonthly);
  };

  const basicPlanFeatures = [
    "Access to core features",
    "Limited search queries", 
    "Basic customer support",
  ];

  const starterPlanFeatures = [
    "All basic features",
    "Increased search query limits",
    "Advanced search filters",
    "Priority customer support",
  ];

  const professionalPlanFeatures = [
    "All starter features",
    "Unlimited search queries",
    "API access",
    "Dedicated support channel",
    "Customizable search parameters",
  ];

  const enterprisePlanFeatures = [
    "All professional features",
    "Dedicated account manager",
    "Custom SLA options",
    "Priority feature requests",
    "On-premise deployment options",
  ];

  const plans = [
    {
      name: "Basic",
      price: "Coming Soon",
      currency: "USD",
      period: "",
      description: "For individuals and small teams getting started.",
      features: basicPlanFeatures,
      usage: "Up to 100 searches per month",
      support: "Community support",
      available: false,
      buttonText: "Coming Soon",
      buttonAction: () => {
        toast({
          title: "Coming Soon",
          description: "This plan will be available soon. Stay tuned!",
        });
      },
    },
    {
      name: "Starter",
      price: "Coming Soon",
      currency: "USD",
      period: "",
      description: "Enhanced features for growing teams.",
      features: starterPlanFeatures,
      usage: "Up to 1,000 searches per month",
      support: "Email support",
      available: false,
      buttonText: "Coming Soon",
      buttonAction: () => {
        toast({
          title: "Coming Soon",
          description: "This plan will be available soon. Stay tuned!",
        });
      },
      popular: true,
    },
    {
      name: "Professional",
      price: "Coming Soon",
      currency: "USD",
      period: "",
      description: "Advanced tools for professionals.",
      features: professionalPlanFeatures,
      usage: "Unlimited searches",
      support: "Priority support",
      available: false,
      buttonText: "Coming Soon",
      buttonAction: () => {
        toast({
          title: "Coming Soon",
          description: "This plan will be available soon. Stay tuned!",
        });
      },
    },
    {
      name: "Enterprise",
      price: "Coming Soon",
      currency: "USD",
      description: "Custom solutions for large organizations.",
      features: enterprisePlanFeatures,
      usage: "Custom usage limits",
      support: "Dedicated support",
      available: false,
      buttonText: "Coming Soon",
      buttonAction: () => {
        toast({
          title: "Coming Soon",
          description: "This plan will be available soon. Stay tuned!",
        });
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-prism-bg to-prism-surface relative overflow-hidden flex flex-col">
      <div className="relative z-10 flex-1 flex flex-col">
        <Navigation />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-6 py-12 flex-1"
        >
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl font-bold text-prism-text sm:text-5xl font-montserrat">
              Choose Your Perfect Plan
            </h2>
            <p className="max-w-[700px] text-prism-text-muted md:text-lg mt-4 font-inter">
              Explore our flexible pricing plans tailored to fit your needs. Whether
              you're just starting out or managing a large organization, we have a
              plan that's right for you.
            </p>
            <div className="mt-6 p-4 bg-prism-accent/20 rounded-lg border border-prism-accent/40">
              <p className="text-prism-accent text-lg font-semibold">🚀 All plans coming soon!</p>
              <p className="text-prism-text-muted text-sm mt-1">We're working hard to bring you amazing pricing options. Stay tuned!</p>
            </div>
          </div>

          <PricingToggle isMonthly={isMonthly} togglePricing={togglePricing} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {plans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>

          <PricingTable plans={plans} />
        </motion.div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Pricing;
