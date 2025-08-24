import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  MessageSquare,
  Shield,
  Calculator,
  Atom,
  FlaskConical,
  Code,
  FileText,
  TrendingUp
} from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "AI Chat Assistant",
      description: "Advanced conversational AI with real-time responses, file uploads, and intelligent context awareness.",
      href: "/chat",
      gradient: "from-blue-500 to-cyan-500",
      delay: 0.1
    },
    {
      icon: Shield,
      title: "Prism Vault",
      description: "Military-grade password management with quantum-resistant encryption and breach monitoring.",
      href: "/vault",
      gradient: "from-cyan-500 to-teal-500",
      delay: 0.2
    },
    {
      icon: Calculator,
      title: "Mathematics Suite",
      description: "Advanced mathematical tools including calculators, graphing, and step-by-step equation solving.",
      href: "/math",
      gradient: "from-purple-500 to-pink-500",
      delay: 0.3,
      tag: "Beta"
    },
    {
      icon: Atom,
      title: "Physics Engine",
      description: "Comprehensive physics calculations, simulations, and interactive problem-solving tools.",
      href: "/physics",
      gradient: "from-green-500 to-emerald-500",
      delay: 0.4,
      tag: "Beta"
    },
    {
      icon: FlaskConical,
      title: "Chemistry Lab",
      description: "Chemical equation balancing, molecular modeling, and periodic table interactions.",
      href: "/chemistry",
      gradient: "from-orange-500 to-red-500",
      delay: 0.5,
      tag: "Beta"
    },
    {
      icon: Code,
      title: "Prism Code",
      description: "Advanced code editor with AI assistance, project management, and deployment capabilities.",
      href: "/code",
      gradient: "from-indigo-500 to-purple-500",
      delay: 0.6
    },
    {
      icon: FileText,
      title: "Prism Pages",
      description: "Intelligent document creation and management with AI-powered writing assistance.",
      href: "/pages",
      gradient: "from-pink-500 to-rose-500",
      delay: 0.7
    },
    {
      icon: TrendingUp,
      title: "Advanced Graphing",
      description: "Interactive mathematical graphing with parametric equations and real-time analysis.",
      href: "/graphing",
      gradient: "from-violet-500 to-purple-500",
      delay: 0.8,
      tag: "Beta"
    }
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_500px] 2xl:grid-cols-[1fr_550px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-cyan-500 to-blue-500 text-transparent bg-clip-text">
                Unleash Your Potential with Prism AI
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Revolutionize your workflow with our AI-powered suite of tools designed to enhance productivity, creativity, and problem-solving.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/chat">
                  Get Started <Sparkles className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/vault">
                  Explore Prism Vault
                </Link>
              </Button>
            </div>
          </div>
          <img
            src="/placeholder.svg"
            alt="Vercel"
            className="hidden rounded-md border object-cover sm:block"
            loading="lazy"
            width="400"
            height="300"
          />
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-2 border-gray-800 transition-all hover:border-gray-700"
              style={{ transitionDelay: `${feature.delay}s` }}
            >
              <div className="absolute inset-0 z-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ backgroundImage: `linear-gradient(to bottom right, ${feature.gradient})` }} />
              <Link to={feature.href} className="relative block p-4 text-gray-300 group-hover:text-white z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <feature.icon className="h-6 w-6 text-white/80 group-hover:text-white" />
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  {feature.tag && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-800 group-hover:bg-white group-hover:text-gray-800">
                      {feature.tag}
                    </span>
                  )}
                </div>
                <p className="text-sm">{feature.description}</p>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Index;
