
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Shield, Calculator, Code, TestTube, Atom, Sparkles, Zap, Database, FileText, Image, BarChart3 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import AnimatedHeadline from '@/components/AnimatedHeadline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Home = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tools = [
    {
      title: "AI Search Assistant",
      description: "Intelligent search with real-time results and AI-powered insights across multiple engines.",
      icon: Search,
      href: "/search",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Secure Vault",
      description: "Military-grade encryption for passwords and sensitive data with biometric protection.",
      icon: Shield,
      href: "/vault",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Math Assistant",
      description: "Advanced mathematical problem solver with step-by-step solutions and graphing.",
      icon: Calculator,
      href: "/math",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Physics Assistant",
      description: "Comprehensive physics problem solver for mechanics, thermodynamics, and quantum physics.",
      icon: Atom,
      href: "/physics",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      isNew: true
    },
    {
      title: "Chemistry Assistant",
      description: "Advanced chemistry solver for organic, inorganic, and physical chemistry problems.",
      icon: TestTube,
      href: "/chemistry",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      isNew: true
    },
    {
      title: "Code Generator",
      description: "Multi-language code generation with AI assistance and real-time collaboration.",
      icon: Code,
      href: "/code",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      title: "Document Editor",
      description: "Smart document creation with AI writing assistance and collaborative features.",
      icon: FileText,
      href: "/pages",
      color: "text-rose-500",
      bgColor: "bg-rose-500/10"
    },
    {
      title: "Image Tools",
      description: "Advanced image processing, compression, and AI-powered enhancements.",
      icon: Image,
      href: "/compressor",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Analytics Dashboard",
      description: "Comprehensive analytics and insights for your digital workspace.",
      icon: BarChart3,
      href: "/analytics",
      color: "text-teal-500",
      bgColor: "bg-teal-500/10"
    }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/5 relative overflow-hidden">
      <ParticleBackground />
      <Navigation />
      
      <main className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <section className="py-20 text-center space-y-8">
          <div className="space-y-4">
            <AnimatedHeadline />
            <p className="text-xl text-prism-text-muted max-w-3xl mx-auto leading-relaxed">
              Experience the future of productivity with our comprehensive suite of AI-powered tools. 
              From secure data management to advanced problem-solving, unlock your potential with cutting-edge technology.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-prism-primary hover:bg-prism-primary/90 text-white px-8 py-3 text-lg">
              <Link to="/search">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-prism-border hover:bg-prism-surface/50 px-8 py-3 text-lg">
              <Link to="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent">
              Powerful Tools for Every Need
            </h2>
            <p className="text-lg text-prism-text-muted max-w-2xl mx-auto">
              Discover our comprehensive suite of AI-powered tools designed to enhance your productivity and creativity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <Card key={index} className="group bg-prism-surface/30 hover:bg-prism-surface/50 border-prism-border hover:border-prism-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-prism-primary/10 relative">
                {tool.isNew && (
                  <Badge className="absolute -top-2 -right-2 bg-prism-accent text-white z-10">
                    New
                  </Badge>
                )}
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg ${tool.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-prism-text group-hover:text-prism-primary transition-colors">
                    {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-prism-text-muted leading-relaxed mb-4">
                    {tool.description}
                  </CardDescription>
                  <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-prism-primary/10 group-hover:text-prism-primary">
                    <Link to={tool.href}>
                      Explore Tool
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent">
              Why Choose Prism?
            </h2>
            <p className="text-lg text-prism-text-muted max-w-2xl mx-auto">
              Built with cutting-edge technology and designed for the modern digital workspace.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-prism-primary/10 flex items-center justify-center mx-auto">
                <Zap className="h-8 w-8 text-prism-primary" />
              </div>
              <h3 className="text-xl font-semibold text-prism-text">Lightning Fast</h3>
              <p className="text-prism-text-muted">
                Optimized performance with instant results and real-time processing for all your tasks.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-prism-accent/10 flex items-center justify-center mx-auto">
                <Database className="h-8 w-8 text-prism-accent" />
              </div>
              <h3 className="text-xl font-semibold text-prism-text">Secure & Private</h3>
              <p className="text-prism-text-muted">
                Military-grade encryption and privacy-first design keeps your data safe and secure.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-prism-secondary/10 flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-prism-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-prism-text">AI-Powered</h3>
              <p className="text-prism-text-muted">
                Advanced AI assistance across all tools for enhanced productivity and smart automation.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
