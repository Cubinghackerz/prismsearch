
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MessageSquare, 
  Shield, 
  Calculator, 
  Code2, 
  FileText, 
  Atom, 
  Beaker, 
  Zap,
  Brain,
  Sparkles,
  ChevronRight,
  Star,
  Users,
  Clock,
  Award
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Galaxy from '@/components/Galaxy';
import CountUp from '@/components/CountUp';
import AnimatedHeadline from '@/components/AnimatedHeadline';

const Home = () => {
  const features = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "AI-Powered Search",
      description: "Search the web with advanced AI analysis and get comprehensive answers with source citations.",
      link: "/",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Intelligent Chat",
      description: "Engage with multiple AI models in dynamic conversations with file attachments and deep research.",
      link: "/chat",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Vault",
      description: "Protect your passwords with military-grade encryption and advanced security features.",
      link: "/vault",
      color: "from-red-500 to-pink-600"
    },
    {
      icon: <Calculator className="h-6 w-6" />,
      title: "Math Assistant",
      description: "Solve complex mathematical problems with step-by-step solutions and visual representations.",
      link: "/math",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: <Atom className="h-6 w-6" />,
      title: "Physics Helper",
      description: "Master physics concepts with detailed explanations and interactive problem solving.",
      link: "/physics",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: <Beaker className="h-6 w-6" />,
      title: "Chemistry Lab",
      description: "Explore chemical reactions, balance equations, and understand molecular interactions.",
      link: "/chemistry",
      color: "from-teal-500 to-cyan-600"
    },
    {
      icon: <Calculator className="h-6 w-6" />,
      title: "Graphing Tool",
      description: "Visualize mathematical functions with advanced plotting and analysis capabilities.",
      link: "/graphing",
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: <Code2 className="h-6 w-6" />,
      title: "Code Generator",
      description: "Generate, edit, and deploy web applications with AI-powered development tools.",
      link: "/code",
      color: "from-cyan-500 to-blue-600"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Document Editor",
      description: "Create and collaborate on documents with intelligent writing assistance and formatting.",
      link: "/pages",
      color: "from-pink-500 to-rose-600"
    }
  ];

  const stats = [
    { value: 10000, label: "Active Users", suffix: "+" },
    { value: 1000000, label: "Problems Solved", suffix: "+" },
    { value: 99.9, label: "Uptime", suffix: "%" },
    { value: 24, label: "Support", suffix: "/7" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Galaxy Background with Doubled Repulsion */}
      <div className="absolute inset-0 -z-10">
        <Galaxy
          focal={[0.5, 0.5]}
          rotation={[1.0, 0.0]}
          starSpeed={0.3}
          density={0.8}
          hueShift={180}
          speed={0.8}
          mouseInteraction={true}
          glowIntensity={0.4}
          saturation={0.3}
          mouseRepulsion={true}
          twinkleIntensity={0.4}
          rotationSpeed={0.05}
          repulsionStrength={16}
          autoCenterRepulsion={0}
          transparent={true}
        />
      </div>

      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by Advanced AI
            </Badge>
            
            <AnimatedHeadline />
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Your all-in-one AI-powered productivity suite. From solving complex equations to generating code, 
              Prism transforms how you work, learn, and create.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8">
                <Link to="/chat" className="flex items-center">
                  Get Started Free
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8">
                <Link to="/pricing" className="flex items-center">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  <CountUp to={stat.value} />
                  <span>{stat.suffix}</span>
                </div>
                <div className="text-white/70 text-sm lg:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Discover powerful AI tools designed to enhance your productivity and creativity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link} className="group block">
                <Card className="h-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-2.5 mb-4 group-hover:scale-110 transition-transform`}>
                      {React.cloneElement(feature.icon, { className: "h-full w-full text-white" })}
                    </div>
                    <CardTitle className="text-white group-hover:text-white/90 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/70 group-hover:text-white/80 transition-colors">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-white/80">
              Join thousands of users who have already discovered the power of AI-driven productivity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8">
                <Link to="/auth" className="flex items-center">
                  Start Free Trial
                  <Star className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <div className="flex items-center text-white/70 text-sm">
                <Users className="h-4 w-4 mr-2" />
                No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
