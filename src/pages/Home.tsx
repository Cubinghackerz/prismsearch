import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MessageCircle, Lock, ArrowRight, Shield, FileType, AlertTriangle, FileText } from 'lucide-react';
import AnimatedHeadline from '@/components/AnimatedHeadline';
import Footer from '@/components/Footer';
import AuthButtons from '@/components/AuthButtons';
const Home = () => {
  const navigate = useNavigate();
  const features = [{
    icon: Search,
    title: 'AI-Powered Search',
    description: 'Search across multiple engines with intelligent results aggregation',
    path: '/search',
    gradient: 'from-blue-500 to-cyan-500'
  }, {
    icon: MessageCircle,
    title: 'Advanced Chat',
    description: 'Engage with AI assistants for complex queries and conversations',
    path: '/chat',
    gradient: 'from-purple-500 to-pink-500'
  }, {
    icon: FileText,
    title: 'Prism Pages',
    description: 'Create, edit, and collaborate on documents with powerful rich text features',
    path: '/pages',
    gradient: 'from-indigo-500 to-purple-500',
    comingSoon: false
  }, {
    icon: Lock,
    title: 'Secure Vault',
    description: 'Military-grade password generation and secure storage',
    path: '/vault',
    gradient: 'from-green-500 to-emerald-500'
  }, {
    icon: FileType,
    title: 'File Conversions',
    description: 'Convert between different file formats while maintaining quality',
    path: '/conversions',
    gradient: 'from-orange-500 to-red-500',
    beta: true
  }, {
    icon: Shield,
    title: 'Threat Detector',
    description: 'Detect suspicious content and potential threats in uploaded files',
    path: '/detector',
    gradient: 'from-red-500 to-pink-500',
    beta: true
  }];
  return <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 font-fira-code">
      {/* Navigation */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" alt="Prism Logo" className="w-8 h-8" />
            <span className="text-2xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent font-fira-code">
              Prism
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" onClick={() => navigate('/search')} className="font-fira-code">
              Search
            </Button>
            <Button variant="ghost" onClick={() => navigate('/chat')} className="font-fira-code">
              Chat
            </Button>
            <Button variant="ghost" disabled className="relative font-fira-code opacity-50 cursor-not-allowed">
              Pages
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-fira-code">Coming Soon</span>
            </Button>
            <Button variant="ghost" onClick={() => navigate('/pages')} className="font-fira-code">
              Pages
            </Button>
            <Button variant="ghost" onClick={() => navigate('/vault')} className="font-fira-code">
              Vault
            </Button>
            <Button variant="ghost" onClick={() => navigate('/conversions')} className="relative font-fira-code">
              Conversions
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-fira-code">Beta</span>
            </Button>
            <Button variant="ghost" onClick={() => navigate('/detector')} className="relative font-fira-code">
              Detector
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-fira-code">Beta</span>
            </Button>
            <Button variant="ghost" onClick={() => navigate('/pricing')} className="font-fira-code">
              Pricing
            </Button>
            <AuthButtons />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center space-y-8 mb-20">
          <div className="space-y-4">
            <AnimatedHeadline />
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-fira-code">
              Experience the future of intelligent search, secure password management, 
              document creation, and AI-powered conversations in one unified platform.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/search')} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 font-fira-code">
              Start Searching
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/chat')} className="font-fira-code">
              Try AI Chat
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => <Card key={index} className={`group transition-all duration-300 ${feature.path ? 'cursor-pointer hover:scale-105' : 'opacity-75'}`} onClick={() => feature.path && navigate(feature.path)}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.gradient} text-white`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="font-fira-code">{feature.title}</CardTitle>
                    {feature.beta && <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-full border border-orange-500/30 font-fira-code">
                        Beta
                      </span>}
                    {feature.comingSoon && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30 font-fira-code">
                        Coming Soon
                      </span>}
                  </div>
                </div>
                <CardDescription className="font-fira-code">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className={`w-full justify-start font-fira-code ${feature.path ? 'group-hover:bg-accent/50' : 'opacity-50 cursor-not-allowed'}`} disabled={!feature.path}>
                  {feature.comingSoon ? 'Coming Soon' : 'Explore Feature'}
                  {feature.path && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </Button>
              </CardContent>
            </Card>)}
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-fira-code">
              10M+
            </h3>
            <p className="text-muted-foreground font-fira-code">Searches Powered</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-fira-code">10K+</h3>
            <p className="text-muted-foreground font-fira-code">Passwords Stored</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-fira-code">
              256-bit
            </h3>
            <p className="text-muted-foreground font-fira-code">Encryption Standard</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-fira-code">
              99.9%
            </h3>
            <p className="text-muted-foreground font-fira-code">Uptime Guarantee</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>;
};
export default Home;