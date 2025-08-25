import React from 'react';
import { ArrowRight, Calculator, Search, Shield, Code, FileText, Atom, FlaskConical, BarChart3, Zap, Brain, Crown, Sparkles, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AnimatedHeadline from '@/components/AnimatedHeadline';
import CountUp from '@/components/CountUp';
import Prism from '@/components/Prism';
import ParticleBackground from '@/components/ParticleBackground';
import { Link } from 'react-router-dom';

const Index = () => {
  const features = [
    {
      icon: <Search className="h-8 w-8 text-blue-400" />,
      title: "AI-Powered Search",
      description: "Revolutionary search experience with intelligent results and atomic thinking processes.",
      link: "/search",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Globe className="h-8 w-8 text-indigo-400" />,
      title: "Deep Search",
      description: "Advanced web scraping with AI analysis. Searches multiple pages and provides intelligent summaries with sources.",
      link: "/deep-search",
      gradient: "from-indigo-500 to-purple-500",
      badge: "New"
    },
    {
      icon: <Calculator className="h-8 w-8 text-purple-400" />,
      title: "Mathematics Suite",
      description: "Advanced mathematical tools and AI-powered problem solving with step-by-step solutions.",
      link: "/math",
      gradient: "from-purple-500 to-pink-500",
      badge: "Beta"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-indigo-400" />,
      title: "Advanced Graphing",
      description: "Interactive mathematical graphing with real-time analysis and parameter controls.",
      link: "/graphing",
      gradient: "from-indigo-500 to-purple-500",
      badge: "Beta"
    },
    {
      icon: <Atom className="h-8 w-8 text-green-400" />,
      title: "Physics Engine",
      description: "Comprehensive physics calculations and simulations for complex problem solving.",
      link: "/physics",
      gradient: "from-green-500 to-emerald-500",
      badge: "Beta"
    },
    {
      icon: <FlaskConical className="h-8 w-8 text-red-400" />,
      title: "Chemistry Lab",
      description: "Advanced chemistry tools and molecular analysis for research and education.",
      link: "/chemistry",
      gradient: "from-orange-500 to-red-500",
      badge: "Beta"
    },
    {
      icon: <Code className="h-8 w-8 text-cyan-400" />,
      title: "Code Generation",
      description: "AI-powered code generation and development tools for modern applications.",
      link: "/code",
      gradient: "from-cyan-500 to-teal-500"
    },
    {
      icon: <FileText className="h-8 w-8 text-yellow-400" />,
      title: "Document Suite",
      description: "Advanced document creation and editing with AI assistance and collaboration.",
      link: "/pages",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Shield className="h-8 w-8 text-emerald-400" />,
      title: "Secure Vault",
      description: "Military-grade password management and secure data storage solutions.",
      link: "/vault",
      gradient: "from-emerald-500 to-green-500"
    }
  ];

  const stats = [
    { number: 50000, label: "Active Users", suffix: "+" },
    { number: 1000000, label: "Calculations Processed", suffix: "+" },
    { number: 99.9, label: "Uptime Guarantee", suffix: "%" },
    { number: 24, label: "Support Availability", suffix: "/7" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 relative overflow-hidden">
      <ParticleBackground />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-32 relative z-10">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <div className="relative mb-8">
            <Prism />
          </div>
          
          <AnimatedHeadline />
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto font-fira-code">
            Experience the future of productivity with our comprehensive suite of AI-powered tools. 
            From advanced mathematics to secure data management, Prism delivers unprecedented capabilities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3">
              <Link to="/search" className="flex items-center">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="font-semibold px-8 py-3">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-4 font-fira-code">Powerful Tools & Features</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Discover our comprehensive suite of AI-powered tools designed to revolutionize your workflow
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group border-border/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.gradient} text-white mb-4 group-hover:scale-110 transition-transform`}>
                        {feature.icon}
                      </div>
                      {feature.badge && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="font-fira-code">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 font-fira-code">Trusted by Thousands</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join the growing community of users who rely on Prism for their daily productivity needs
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2 font-fira-code">
                  <CountUp to={stat.number} />
                  {stat.suffix}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-card/30 backdrop-blur-sm rounded-2xl p-12 border border-border/50">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4 font-fira-code">Ready to Transform Your Workflow?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
            Experience the power of AI-driven productivity tools. Start your journey with Prism today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3">
              <Link to="/auth" className="flex items-center">
                Start Free Trial <Crown className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="font-semibold px-8 py-3">
              <Link to="/pricing">Compare Plans</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
