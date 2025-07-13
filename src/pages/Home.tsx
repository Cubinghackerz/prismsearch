import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MessageCircle, Shield, Zap, Brain, Lock, FileText, Palette, Calendar, Link2 } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
const Home = () => {
  const navigate = useNavigate();
  const features = [{
    icon: <Search className="w-8 h-8 text-prism-primary" />,
    title: "AI-Powered Search",
    description: "Experience next-generation search with intelligent results and contextual understanding.",
    action: () => navigate("/search"),
    buttonText: "Start Searching"
  }, {
    icon: <MessageCircle className="w-8 h-8 text-prism-primary" />,
    title: "Intelligent Chat",
    description: "Engage with advanced AI assistants for research, analysis, and creative tasks.",
    action: () => navigate("/chat"),
    buttonText: "Start Chatting"
  }, {
    icon: <Shield className="w-8 h-8 text-prism-primary" />,
    title: "Secure Vault",
    description: "Store and manage your passwords with military-grade encryption and advanced security.",
    action: () => navigate("/vault"),
    buttonText: "Access Vault"
  }, {
    icon: <FileText className="w-8 h-8 text-prism-primary" />,
    title: "Prism Notes",
    description: "Create encrypted notes with whiteboard functionality, auto-linking, and smart reminders.",
    action: () => navigate("/notes"),
    buttonText: "Open Notes",
    isNew: true
  }];
  const notesFeatures = [{
    icon: <Lock className="w-5 h-5 text-prism-accent" />,
    title: "Encrypted Notes",
    description: "Your thoughts stay private with end-to-end encryption"
  }, {
    icon: <Palette className="w-5 h-5 text-prism-accent" />,
    title: "Visual Whiteboard",
    description: "Sketch, diagram, and wireframe with powerful drawing tools"
  }, {
    icon: <Link2 className="w-5 h-5 text-prism-accent" />,
    title: "Smart Linking",
    description: "Automatically connects notes with similar topics"
  }, {
    icon: <Calendar className="w-5 h-5 text-prism-accent" />,
    title: "Smart Reminders",
    description: "Never forget important ideas with intelligent reminders"
  }];
  return <div className="min-h-screen bg-gradient-to-b from-prism-bg to-prism-surface relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-prism-primary to-prism-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-prism-primary to-prism-accent bg-clip-text text-transparent">
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
                Vault
              </Button>
              <Button variant="ghost" onClick={() => navigate("/notes")}>
                Notes <span className="ml-1 px-1.5 py-0.5 text-xs bg-prism-primary text-white rounded-full">New</span>
              </Button>
              <Button variant="ghost" onClick={() => navigate("/pricing")}>
                Pricing
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-prism-primary via-prism-accent to-prism-primary-light bg-clip-text text-transparent leading-tight py-0 md:text-7xl">
              The Future of
              <br />
              Digital Intelligence
            </h1>
            <p className="text-xl md:text-2xl text-prism-text-muted mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the next evolution of AI-powered tools. Search smarter, chat intelligently, 
              store securely, and think visually with Prism's comprehensive suite.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary-dark hover:to-prism-accent-dark text-white px-8 py-3 text-lg font-semibold shadow-xl" onClick={() => navigate("/search")}>
                <Zap className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-prism-primary text-prism-primary hover:bg-prism-primary hover:text-white px-8 py-3 text-lg font-semibold" onClick={() => navigate("/notes")}>
                <FileText className="w-5 h-5 mr-2" />
                Try Prism Notes
              </Button>
            </div>
          </div>

          {/* New: Prism Notes Spotlight */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-prism-primary/10 to-prism-accent/10 border-prism-primary/20 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-prism-primary to-prism-accent rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <span className="ml-3 px-3 py-1 bg-prism-primary text-white text-sm font-semibold rounded-full">
                    New Feature
                  </span>
                </div>
                <CardTitle className="text-3xl font-bold text-prism-text mb-2">
                  Introducing Prism Notes
                </CardTitle>
                <CardDescription className="text-lg text-prism-text-muted max-w-2xl mx-auto">
                  The ultimate note-taking experience with encryption, visual whiteboards, and intelligent features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {notesFeatures.map((feature, index) => <div key={index} className="text-center p-4">
                      <div className="flex justify-center mb-3">
                        <div className="w-10 h-10 bg-prism-surface/50 rounded-lg flex items-center justify-center">
                          {feature.icon}
                        </div>
                      </div>
                      <h4 className="font-semibold text-prism-text mb-2">{feature.title}</h4>
                      <p className="text-sm text-prism-text-muted">{feature.description}</p>
                    </div>)}
                </div>
                <div className="text-center">
                  <Button size="lg" onClick={() => navigate("/notes")} className="bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary-dark hover:to-prism-accent-dark text-white px-8 py-3 font-semibold shadow-lg">
                    <FileText className="w-5 h-5 mr-2" />
                    Explore Prism Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => <Card key={index} className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-prism-border/50 bg-prism-surface/30 backdrop-blur-sm relative overflow-hidden" onClick={feature.action}>
                {feature.isNew && <div className="absolute top-4 right-4 px-2 py-1 bg-prism-primary text-white text-xs font-semibold rounded-full">
                    New
                  </div>}
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-prism-text group-hover:text-prism-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-prism-text-muted mb-6 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <Button className="w-full bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary-dark hover:to-prism-accent-dark text-white font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300" onClick={e => {
                e.stopPropagation();
                feature.action();
              }}>
                    {feature.buttonText}
                  </Button>
                </CardContent>
              </Card>)}
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-prism-surface/50 to-prism-surface/30 rounded-2xl p-12 backdrop-blur-sm border border-prism-border/30">
            <Brain className="w-16 h-16 text-prism-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-prism-text mb-4">
              Ready to Transform Your Digital Experience?
            </h2>
            <p className="text-xl text-prism-text-muted mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already discovered the power of intelligent digital tools.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary-dark hover:to-prism-accent-dark text-white px-12 py-4 text-lg font-semibold shadow-2xl hover:shadow-prism-primary/25 transition-all duration-300" onClick={() => navigate("/search")}>
              <Zap className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 mt-16 border-t border-prism-border/30">
          <div className="text-center text-prism-text-muted">
            <p>&copy; 2024 Prism. Empowering intelligence, securing privacy.</p>
          </div>
        </footer>
      </div>
    </div>;
};
export default Home;