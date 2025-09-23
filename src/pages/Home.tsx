import React, { lazy, Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Shield, Calculator, Code2, Atom, Beaker, Zap, Sparkles, ChevronRight, Star, ArrowRight, CheckCircle, FileText, ShieldAlert, TrendingUp, NotebookPen } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// Lazy load heavy components
const Prism = lazy(() => import('@/components/Prism'));
const AnimatedHeadline = lazy(() => import('@/components/AnimatedHeadline'));
const Home = () => {
  // Memoize static data to prevent unnecessary re-renders
  const features = useMemo(() => [{
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Intelligent Chat",
    description: "Engage with multiple AI models in dynamic conversations with file attachments and deep research.",
    link: "/chat",
    color: "from-green-500 to-teal-600",
    isNew: false
  }, {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure Vault",
    description: "Protect your passwords with military-grade encryption and advanced security features.",
    link: "/vault",
    color: "from-red-500 to-pink-600",
    isNew: false
  }, {
    icon: <Calculator className="h-6 w-6" />,
    title: "Math Assistant",
    description: "Solve complex mathematical problems with step-by-step solutions and visual representations.",
    link: "/math",
    color: "from-orange-500 to-red-600",
    isNew: true
  }, {
    icon: <Atom className="h-6 w-6" />,
    title: "Physics Helper",
    description: "Master physics concepts with detailed explanations and interactive problem solving.",
    link: "/physics",
    color: "from-purple-500 to-indigo-600",
    isNew: true
  }, {
    icon: <Beaker className="h-6 w-6" />,
    title: "Chemistry Lab",
    description: "Explore chemical reactions, balance equations, and understand molecular interactions.",
    link: "/chemistry",
    color: "from-teal-500 to-cyan-600",
    isNew: true
  }, {
    icon: <Zap className="h-6 w-6" />,
    title: "Graphing Tool",
    description: "Visualize mathematical functions with advanced plotting and analysis capabilities.",
    link: "/graphing",
    color: "from-indigo-500 to-purple-600",
    isNew: true
  }, {
    icon: <NotebookPen className="h-6 w-6" />,
    title: "Research Preview",
    description: "Compile sources, insights, and follow-ups in a guided research notebook experience.",
    link: "/research",
    color: "from-blue-500 to-indigo-600",
    isNew: true
  }, {
    icon: <Code2 className="h-6 w-6" />,
    title: "Code Generator",
    description: "Generate, edit, and deploy web applications with AI-powered development tools.",
    link: "/code",
    color: "from-cyan-500 to-blue-600",
    isNew: true
  }, {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Prism Finance",
    description: "Track live stock performance with customizable watchlists and market movers.",
    link: "/finance",
    color: "from-green-500 to-emerald-600",
    isNew: true
  }, {
    icon: <FileText className="h-6 w-6" />,
    title: "File Manager",
    description: "Convert between different file formats and compress files with advanced algorithms.",
    link: "/compressor",
    color: "from-yellow-500 to-orange-600",
    isNew: true
  }, {
    icon: <ShieldAlert className="h-6 w-6" />,
    title: "Threat Detector",
    description: "Scan files and URLs for potential security threats with advanced detection algorithms.",
    link: "/detector",
    color: "from-red-600 to-purple-600",
    isNew: true
  }], []);
  
  const stats = useMemo(() => [{
    value: 10000,
    label: "Passwords Stored",
    suffix: "+"
  }, {
    value: 1000000,
    label: "Problems Solved",
    suffix: "+"
  }, {
    value: 99.9,
    label: "Uptime",
    suffix: "%"
  }, {
    value: 100000,
    label: "Lines of Code Generated",
    suffix: "+"
  }], []);
  
  const benefits = useMemo(() => ["Advanced AI-powered assistance", "Military-grade security", "Cross-platform compatibility", "Real-time collaboration"], []);
  return <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/5">
      {/* Optimized Prism Background with Suspense */}
      <div className="absolute inset-0 -z-10 will-change-transform">
        <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />}>
          <Prism 
            animationType="rotate" 
            timeScale={0.08} 
            height={2.5} 
            baseWidth={4} 
            scale={2.5} 
            hueShift={240} 
            colorFrequency={0.5} 
            noise={0.08} 
            glow={0.2} 
            bloom={0.3} 
            suspendWhenOffscreen={true} 
          />
        </Suspense>
      </div>

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 -z-5 bg-gradient-to-b from-transparent via-background/10 to-background/20" />

      <Navigation />
      
      {/* Enhanced Hero Section */}
      <section className="relative pt-32 pb-24 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Floating Badge */}
            <div className="inline-flex">
              <Badge variant="secondary" className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 text-white border border-white/30 hover:border-white/50 transition-all duration-300 px-6 py-2 text-sm font-medium backdrop-blur-md shadow-lg">
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Powered by Advanced AI
              </Badge>
            </div>
            
            {/* Optimized Headline with Suspense */}
            <div className="space-y-6">
              <Suspense fallback={
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Prism AI Suite
                  </span>
                </h1>
              }>
                <AnimatedHeadline />
              </Suspense>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
                Your all-in-one AI-powered productivity suite. From solving complex equations to generating code, 
                <span className="font-semibold text-white"> Prism transforms</span> how you work, learn, and create.
              </p>
            </div>

            {/* Optimized Benefits List */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={`benefit-${index}`} className="flex items-center justify-center space-x-2 text-white/80 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 transform transition-transform duration-200 hover:scale-[1.02]">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Button size="lg" className="bg-gradient-to-r from-white to-gray-100 text-gray-900 hover:from-gray-100 hover:to-white font-semibold px-8 py-4 shadow-2xl hover:shadow-white/20 transition-all duration-300 group">
                <Link to="/chat" className="flex items-center">
                  Get Started Free
                  <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 md:p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={`stat-${index}`} className="text-center group">
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-3 transform transition-transform duration-200 group-hover:scale-105">
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {stat.value.toLocaleString()}{stat.suffix}
                    </span>
                  </div>
                  <div className="text-white/70 text-sm lg:text-base font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Grid */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Everything You Need in 
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"> One Platform</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Discover powerful AI tools designed to enhance your productivity and unleash your creativity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link key={`feature-${index}`} to={feature.link} className="group block">
                <Card className="h-full bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-md border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/10 relative overflow-hidden">
                  {/* Simplified hover background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {feature.isNew && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black font-bold px-2 py-1 text-xs shadow-lg z-10"
                      style={{ transform: 'rotate(12deg)' }}
                    >
                      NEW
                    </Badge>
                  )}
                  
                  <CardHeader className="relative pb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} p-3 mb-6 transform transition-transform duration-200 group-hover:scale-105 shadow-lg`}>
                      {React.cloneElement(feature.icon, {
                        className: "h-full w-full text-white"
                      })}
                    </div>
                    <CardTitle className="text-white text-xl font-semibold mb-3">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative">
                    <CardDescription className="text-white/70 group-hover:text-white/90 transition-colors duration-200 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    
                    {/* Simplified arrow indicator */}
                    <div className="mt-4 flex items-center text-white/50 group-hover:text-primary transition-colors duration-200">
                      <span className="text-sm font-medium mr-2">Learn more</span>
                      <ArrowRight className="h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-3xl" />
            
            <div className="relative bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-12 md:p-16 text-center">
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="space-y-6">
                  <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                    Ready to Transform Your
                    <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"> Productivity?</span>
                  </h2>
                  <p className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                    Join thousands of users who have already discovered the power of AI-driven productivity
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Button size="lg" className="bg-gradient-to-r from-white to-gray-100 text-gray-900 hover:from-gray-100 hover:to-white font-semibold px-10 py-4 shadow-2xl hover:shadow-white/20 transition-all duration-300 group">
                    <Link to="/auth?mode=sign-up" className="flex items-center">
                      Start Free Today
                      <Star className="h-5 w-5 ml-2 group-hover:rotate-12 transition-transform duration-300" />
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-medium px-10 py-4 backdrop-blur-sm transition-all duration-300">
                    <Link to="/chat" className="flex items-center">
                      Try Demo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Home;