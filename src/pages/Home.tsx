import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MessageCircle, Shield, Zap, Brain, Lock, Key, User } from "lucide-react";
import DesktopDownloads from "@/components/DesktopDownloads";
import PrismAssistant from "@/components/PrismAssistant";
import AnimatedHeadline from "@/components/AnimatedHeadline";
import ThemeToggle from "@/components/ThemeToggle";

const Home = () => {
  const navigate = useNavigate();
  const features = [{
    icon: <Search className="w-8 h-8 text-primary" />,
    title: "AI-Powered Search",
    description: "Experience next-generation search with intelligent results and contextual understanding.",
    action: () => navigate("/search"),
    buttonText: "Start Searching"
  }, {
    icon: <MessageCircle className="w-8 h-8 text-primary" />,
    title: "Intelligent Chat",
    description: "Engage with advanced AI assistants for research, analysis, and creative tasks.",
    action: () => navigate("/chat"),
    buttonText: "Start Chatting"
  }, {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: "Secure Vault",
    description: "Store and manage your passwords with military-grade encryption and advanced security.",
    action: () => navigate("/vault"),
    buttonText: "Access Vault",
    isNew: true
  }];
  const vaultFeatures = [{
    icon: <Lock className="w-5 h-5 text-accent" />,
    title: "Military-Grade Encryption",
    description: "Your passwords are secured with the strongest encryption available"
  }, {
    icon: <Key className="w-5 h-5 text-accent" />,
    title: "Password Generator",
    description: "Generate ultra-secure passwords with AI-powered strength assessment"
  }, {
    icon: <Shield className="w-5 h-5 text-accent" />,
    title: "Master Password Protection",
    description: "Additional layer of security for your most sensitive passwords"
  }, {
    icon: <Brain className="w-5 h-5 text-accent" />,
    title: "AI Security Analysis",
    description: "Smart breach detection and password health monitoring"
  }];
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 relative overflow-hidden">
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" alt="Prism Logo" className="w-8 h-8" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Prism
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" onClick={() => navigate("/search")}>
                Search
              </Button>
              <Button variant="ghost" onClick={() => navigate("/chat")}>
                Chat
              </Button>
              <Button variant="ghost" onClick={() => navigate("/vault")}>
                Vault <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">New</span>
              </Button>
              <Button variant="ghost" onClick={() => navigate("/pricing")}>
                Pricing
              </Button>
              <ThemeToggle />
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <AnimatedHeadline />
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the next evolution of AI-powered tools. Search smarter, chat intelligently, 
              and store securely with Prism's comprehensive suite.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-3 text-lg font-semibold shadow-xl" onClick={() => navigate("/auth")}>
                <User className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg font-semibold" onClick={() => navigate("/vault")}>
                <Shield className="w-5 h-5 mr-2" />
                Try Prism Vault
              </Button>
            </div>
          </div>

          {/* Desktop Downloads Section */}
          <DesktopDownloads />

          {/* Featured: Prism Vault Spotlight */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="ml-3 px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">New</span>
                </div>
                <CardTitle className="text-3xl font-bold text-foreground mb-2">
                  Prism Vault - Secure Password Manager
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  The ultimate password management experience with military-grade encryption and AI-powered security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {vaultFeatures.map((feature, index) => (
                    <div key={index} className="text-center p-4">
                      <div className="flex justify-center mb-3">
                        <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center">
                          {feature.icon}
                        </div>
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Button size="lg" onClick={() => navigate("/vault")} className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-3 font-semibold shadow-lg">
                    <Shield className="w-5 h-5 mr-2" />
                    Explore Prism Vault
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-border/50 bg-card/30 backdrop-blur-sm relative overflow-hidden" onClick={feature.action}>
                {feature.isNew && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                    Featured
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300" onClick={(e) => {
                    e.stopPropagation();
                    feature.action();
                  }}>
                    {feature.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-2xl p-12 backdrop-blur-sm border border-border/30">
            <Brain className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Transform Your Digital Experience?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already discovered the power of intelligent digital tools.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-12 py-4 text-lg font-semibold shadow-2xl hover:shadow-primary/25 transition-all duration-300" onClick={() => navigate("/search")}>
              <Zap className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 mt-16 border-t border-border/30">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Prism. Empowering intelligence, securing privacy.</p>
          </div>
        </footer>
      </div>

      {/* Prism Assistant Widget */}
      <PrismAssistant />
    </div>
  );
};

export default Home;
