
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MessageCircle, 
  Shield, 
  Vault, 
  RefreshCw,
  FileText,
  Zap,
  ArrowRight,
  CheckCircle,
  Globe,
  Users,
  Lock,
  Smartphone
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AnimatedHeadline from '@/components/AnimatedHeadline';
import ParticleBackground from '@/components/ParticleBackground';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 text-foreground font-inter">
      <ParticleBackground />
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-24 pb-16 text-center relative">
        <div className="max-w-4xl mx-auto">
          <AnimatedHeadline />
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed font-fira-code">
            Experience the next generation of AI-powered tools designed to enhance your digital workflow, 
            protect your privacy, and unlock new possibilities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/search">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold font-fira-code">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button variant="outline" size="lg" className="font-fira-code">
                Try Prism Pages
                <FileText className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Feature Highlight - Prism Pages */}
          <div className="mb-16">
            <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <FileText className="h-8 w-8 text-primary" />
                  <CardTitle className="text-2xl font-bold font-fira-code">
                    Introducing Prism Pages
                  </CardTitle>
                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30 font-fira-code">
                    NEW
                  </Badge>
                </div>
                <CardDescription className="text-base font-fira-code">
                  A powerful rich-text document editor with real-time collaboration, similar to Google Docs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-fira-code">Rich text formatting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-fira-code">Real-time collaboration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-fira-code">Auto-save functionality</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-fira-code">Secure document sharing</span>
                  </div>
                </div>
                <Link to="/docs">
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 font-fira-code">
                    Start Creating Documents
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 font-fira-code">Powerful AI-Driven Tools</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-fira-code">
            Everything you need to enhance your productivity and secure your digital life
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link to="/search">
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/50">
              <CardHeader>
                <Search className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors font-fira-code">
                  Intelligent Search
                </CardTitle>
                <CardDescription className="font-fira-code">
                  Advanced AI-powered search across multiple sources with intelligent filtering and results
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/docs">
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors font-fira-code flex items-center">
                  Prism Pages
                  <Badge variant="secondary" className="ml-2 bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                    NEW
                  </Badge>
                </CardTitle>
                <CardDescription className="font-fira-code">
                  Rich-text document editor with real-time collaboration and secure sharing capabilities
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/chat">
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/50">
              <CardHeader>
                <MessageCircle className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors font-fira-code">
                  AI Chat Assistant
                </CardTitle>
                <CardDescription className="font-fira-code">
                  Conversational AI with advanced reasoning, file analysis, and multi-modal capabilities
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/vault">
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/50">
              <CardHeader>
                <Vault className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors font-fira-code">
                  Secure Vault
                </CardTitle>
                <CardDescription className="font-fira-code">
                  Military-grade password manager with breach detection and secure note storage
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/conversions">
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/50">
              <CardHeader>
                <RefreshCw className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors font-fira-code">
                  Smart Conversions
                </CardTitle>
                <CardDescription className="font-fira-code">
                  Intelligent file and data conversion with AI-powered optimization and formatting
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/detector">
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/50">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors font-fira-code">
                  AI Content Detector
                </CardTitle>
                <CardDescription className="font-fira-code">
                  Advanced detection of AI-generated content with confidence scoring and analysis
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* Why Choose Prism Section */}
      <section className="container mx-auto px-6 py-16 bg-secondary/20 rounded-3xl my-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 font-fira-code">Why Choose Prism?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-fira-code">
            Built with privacy, performance, and user experience at its core
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 font-fira-code">Privacy First</h3>
            <p className="text-muted-foreground text-sm font-fira-code">
              Your data is encrypted and secure. We never sell or share your personal information.
            </p>
          </div>

          <div className="text-center">
            <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 font-fira-code">Lightning Fast</h3>
            <p className="text-muted-foreground text-sm font-fira-code">
              Optimized performance with edge computing for instant responses and real-time updates.
            </p>
          </div>

          <div className="text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 font-fira-code">Collaborative</h3>
            <p className="text-muted-foreground text-sm font-fira-code">
              Built for teams with real-time collaboration and secure sharing capabilities.
            </p>
          </div>

          <div className="text-center">
            <Smartphone className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 font-fira-code">Cross-Platform</h3>
            <p className="text-muted-foreground text-sm font-fira-code">
              Works seamlessly across all devices with responsive design and offline capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 font-fira-code">Ready to Transform Your Workflow?</h2>
          <p className="text-xl text-muted-foreground mb-8 font-fira-code">
            Join thousands of users who have already discovered the power of Prism's AI-driven tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold font-fira-code">
                Start Free Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button variant="outline" size="lg" className="font-fira-code">
                Try Prism Pages
                <FileText className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
