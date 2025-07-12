import React from 'react';
import { PricingTable } from '@/components/pricing/PricingTable';
import { PricingCard } from '@/components/pricing/PricingCard';
import { PricingToggle } from '@/components/pricing/PricingToggle';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

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
      price: isMonthly ? "Free" : "Free",
      currency: "USD",
      period: "/month",
      description: "For individuals and small teams getting started.",
      features: basicPlanFeatures,
      usage: "Up to 100 searches per month",
      support: "Community support",
      available: true,
      buttonText: "Get started",
      buttonAction: () => {
        toast({
          title: "Basic Plan Selected",
          description: "Enjoy the core features with limited usage.",
        });
      },
    },
    {
      name: "Starter",
      price: isMonthly ? "9" : "79",
      currency: "USD",
      period: isMonthly ? "/month" : "/year",
      description: "Enhanced features for growing teams.",
      features: starterPlanFeatures,
      usage: "Up to 1,000 searches per month",
      support: "Email support",
      available: true,
      buttonText: "Start free trial",
      buttonAction: () => {
        toast({
          title: "Starter Plan Trial",
          description: "Start your free trial to explore enhanced features.",
        });
      },
      popular: true,
    },
    {
      name: "Professional",
      price: isMonthly ? "29" : "249",
      currency: "USD",
      period: isMonthly ? "/month" : "/year",
      description: "Advanced tools for professionals.",
      features: professionalPlanFeatures,
      usage: "Unlimited searches",
      support: "Priority support",
      available: true,
      buttonText: "Subscribe now",
      buttonAction: () => {
        toast({
          title: "Professional Plan Active",
          description: "Access advanced tools with unlimited usage.",
        });
      },
    },
    {
      name: "Enterprise",
      price: "Contact us",
      currency: "USD",
      description: "Custom solutions for large organizations.",
      features: enterprisePlanFeatures,
      usage: "Custom usage limits",
      support: "Dedicated support",
      available: false,
      buttonText: "Contact us",
      buttonAction: () => {
        toast({
          title: "Enterprise Inquiry",
          description: "Contact us to discuss custom solutions.",
        });
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container py-12 md:py-24"
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
      </div>

      <PricingToggle isMonthly={isMonthly} togglePricing={togglePricing} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>

      <PricingTable plans={plans} />
    </motion.div>
  );
};

export default Pricing;
