
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Search, MessageCircle, Lock, ArrowRight, Shield, FileType, Code, Globe, Sparkles, Sigma, ChevronDown, Calculator, Archive, Atom, Flask } from 'lucide-react';
import AnimatedHeadline from '@/components/AnimatedHeadline';
import Footer from '@/components/Footer';
import AuthButtons from '@/components/AuthButtons';
import Galaxy from '@/components/Galaxy';
import CountUp from '@/components/CountUp';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Globe,
      title: 'AI Web App Generator',
      description: 'Generate complete web applications with HTML, CSS, and JavaScript using AI',
      path: '/code',
      gradient: 'from-orange-500 to-yellow-500',
      featured: true,
      beta: true
    },
    {
      icon: Sigma,
      title: 'Math Assistant',
      description: 'Advanced mathematical problem solver with step-by-step solutions and equation keyboards',
      path: '/math',
      gradient: 'from-blue-500 to-purple-500',
      featured: true
    },
    {
      icon: Atom,
      title: 'Physics Assistant',
      description: 'Solve physics problems across mechanics, thermodynamics, electromagnetism, and quantum physics',
      path: '/physics',
      gradient: 'from-green-500 to-blue-500',
      featured: true,
      new: true
    },
    {
      icon: Flask,
      title: 'Chemistry Assistant',
      description: 'Chemical problem solver for organic, inorganic, and physical chemistry with formula support',
      path: '/chemistry',
      gradient: 'from-purple-500 to-pink-500',
      featured: true,
      new: true
    },
    {
      icon: Calculator,
      title: 'Graphing Tool',
      description: 'Plot mathematical equations, analyze functions, and visualize complex relationships',
      path: '/graphing',
      gradient: 'from-purple-500 to-blue-500',
      featured: true,
      new: true
    },
    {
      icon: Archive,
      title: 'File Compressor',
      description: 'Compress files while maintaining quality across multiple formats with batch processing',
      path: '/compressor',
      gradient: 'from-green-500 to-teal-500',
      featured: true,
      new: true
    },
    {
      icon: Search,
      title: 'AI-Powered Search',
      description: 'Search across multiple engines with intelligent results aggregation',
      path: '/search',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MessageCircle,
      title: 'Advanced Chat',
      description: 'Engage with AI assistants for complex queries and conversations',
      path: '/chat',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Lock,
      title: 'Secure Vault',
      description: 'Military-grade password generation and secure storage',
      path: '/vault',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: FileType,
      title: 'File Conversions',
      description: 'Convert between different file formats while maintaining quality',
      path: '/conversions',
      gradient: 'from-orange-500 to-red-500',
      beta: true
    },
    {
      icon: Shield,
      title: 'Threat Detector',
      description: 'Detect suspicious content and potential threats in uploaded files',
      path: '/detector',
      gradient: 'from-red-500 to-pink-500',
      beta: true
    }
  ];

  const featuredFeatures = features.filter(f => f.featured);
  const regularFeatures = features.filter(f => !f.featured);

  return (
    <div className="min-h-screen relative overflow-hidden font-fira-code">
      {/* Galaxy Background - Full coverage with updated speed */}
      <div className="fixed inset-0">
        <Galaxy
          mouseRepulsion={false}
          mouseInteraction={true}
          density={4.0}
          glowIntensity={0.15}
          saturation={0.8}
          hueShift={200}
          transparent={false}
          rotationSpeed={0.075}
          twinkleIntensity={0.15}
          repulsionStrength={2.5}
          speed={2}
          starSpeed={0.75}
          autoCenterRepulsion={1.5}
        />
      </div>

      {/* Content - All UI elements with solid backgrounds */}
      <div className="relative z-10 min-h-screen">
        {/* Navigation */}
        <header className="container mx-auto px-6 py-8">
          <nav className="flex items-center justify-between bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
                alt="Prism Logo" 
                className="w-8 h-8"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent font-fira-code">
                Prism
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost"
                    className="font-fira-code text-sm flex items-center gap-2 text-white hover:text-white hover:bg-white/10"
                  >
                    Tools
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-background/95 backdrop-blur-md border border-border/50" align="start">
                  <DropdownMenuItem 
                    onClick={() => navigate("/search")}
                    className="cursor-pointer font-fira-code"
                  >
                    Search
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/chat")}
                    className="cursor-pointer font-fira-code"
                  >
                    Chat
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate("/code")}
                    className="cursor-pointer font-fira-code"
                  >
                    <div className="flex items-center justify-between w-full">
                      Code
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-fira-code">Beta</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/math")}
                    className="cursor-pointer font-fira-code"
                  >
                    Math
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/physics")}
                    className="cursor-pointer font-fira-code"
                  >
                    <div className="flex items-center justify-between w-full">
                      Physics
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-fira-code">New</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/chemistry")}
                    className="cursor-pointer font-fira-code"
                  >
                    <div className="flex items-center justify-between w-full">
                      Chemistry
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-fira-code">New</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/graphing")}
                    className="cursor-pointer font-fira-code"
                  >
                    <div className="flex items-center justify-between w-full">
                      Graphing
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-fira-code">New</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/vault")}
                    className="cursor-pointer font-fira-code"
                  >
                    Vault
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/conversions")}
                    className="cursor-pointer font-fira-code"
                  >
                    <div className="flex items-center justify-between w-full">
                      Conversions
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-fira-code">Beta</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/compressor")}
                    className="cursor-pointer font-fira-code"
                  >
                    <div className="flex items-center justify-between w-full">
                      Compressor
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-fira-code">New</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/detector")}
                    className="cursor-pointer font-fira-code"
                  >
                    <div className="flex items-center justify-between w-full">
                      Detector
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-fira-code">Beta</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" onClick={() => navigate('/pricing')} className="font-fira-code text-white/90 hover:text-white hover:bg-white/10">
                Pricing
              </Button>
              <AuthButtons />
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-16">
          <div className="text-center space-y-8 mb-20">
            <div className="space-y-4 bg-black/80 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <AnimatedHeadline />
              <p className="text-xl text-white/80 max-w-2xl mx-auto font-fira-code">
                Experience the future of intelligent search, AI-powered web app generation, advanced mathematical computation,
                secure password management, online code execution, and AI conversations in one unified platform.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/code')}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 font-fira-code text-black font-bold"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Try AI Web App Generator
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/physics')}
                className="font-fira-code text-white border-white/30 hover:bg-white/10 hover:text-white"
              >
                Solve Physics Problems
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Featured Features */}
          {featuredFeatures.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-center mb-8 font-fira-code text-white bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/20">Featured Tools</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredFeatures.map((feature, index) => (
                  <Card 
                    key={index}
                    className="group cursor-pointer transition-all duration-300 hover:scale-105 border-2 border-orange-500/30 bg-black/80 backdrop-blur-md hover:bg-black/90"
                    onClick={() => navigate(feature.path)}
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className={`p-4 rounded-lg bg-gradient-to-r ${feature.gradient} text-white`}>
                          <feature.icon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CardTitle className="text-xl font-fira-code text-white">{feature.title}</CardTitle>
                            {feature.beta && (
                              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-full border border-orange-500/30 font-fira-code">
                                Beta
                              </span>
                            )}
                            {feature.new && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30 font-fira-code">
                                New
                              </span>
                            )}
                          </div>
                          <CardDescription className="text-sm font-fira-code text-white/70">
                            {feature.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start group-hover:bg-white/10 font-fira-code text-sm py-4 text-white/90 hover:text-white"
                      >
                        {feature.title.includes('Web App') ? 'Start Creating Web Apps' : 
                         feature.title.includes('Math') ? 'Solve Math Problems' : 
                         feature.title.includes('Physics') ? 'Solve Physics Problems' :
                         feature.title.includes('Chemistry') ? 'Solve Chemistry Problems' :
                         feature.title.includes('Graphing') ? 'Plot Equations' :
                         feature.title.includes('Compressor') ? 'Compress Files' : 'Explore Feature'}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {regularFeatures.map((feature, index) => (
              <Card 
                key={index}
                className="group cursor-pointer transition-all duration-300 hover:scale-105 bg-black/80 backdrop-blur-md hover:bg-black/90 border-white/20"
                onClick={() => navigate(feature.path)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.gradient} text-white`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <CardTitle className="font-fira-code text-white">{feature.title}</CardTitle>
                      {feature.beta && (
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-full border border-orange-500/30 font-fira-code">
                          Beta
                        </span>
                      )}
                    </div>
                  </div>
                  <CardDescription className="font-fira-code text-white/70">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start group-hover:bg-white/10 font-fira-code text-white/90 hover:text-white"
                  >
                    Explore Feature
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section with faster CountUp animations */}
          <div className="grid md:grid-cols-3 gap-8 text-center bg-black/80 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-fira-code">
                <CountUp
                  from={0}
                  to={10}
                  duration={2}
                  delay={0.2}
                  className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                />
                M+
              </h3>
              <p className="text-white/70 font-fira-code">Searches Powered</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-fira-code">
                <CountUp
                  from={0}
                  to={256}
                  duration={2}
                  delay={0.4}
                  className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                />
                -bit
              </h3>
              <p className="text-white/70 font-fira-code">Encryption Standard</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-fira-code">
                <CountUp
                  from={0}
                  to={99.9}
                  duration={2}
                  delay={0.6}
                  className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                />
                %
              </h3>
              <p className="text-white/70 font-fira-code">Uptime Guarantee</p>
            </div>
          </div>
        </main>

        <div className="bg-black/80 backdrop-blur-md border-t border-white/20">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;
