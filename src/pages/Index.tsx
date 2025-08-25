import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Shield, Code, FileText, Wrench, Calculator, Atom, Beaker, TrendingUp, RotateCcw, Archive, Eye, Globe } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import CountUp from 'react-countup';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface Tool {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-prism-bg via-prism-dark-bg to-prism-surface">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="relative z-10"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-prism-text mb-6 font-fira-code">
              Unlock the Power of AI
            </h1>
            <p className="text-xl md:text-2xl text-prism-text-muted max-w-3xl mx-auto mb-12">
              Explore a suite of AI-powered tools designed to enhance your productivity, creativity, and problem-solving skills.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                size="lg"
                className="bg-prism-primary hover:bg-prism-primary-dark text-white"
                onClick={() => navigate('/search')}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-prism-text hover:bg-prism-primary/10"
                onClick={() => navigate('/docs')}
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-2"
            >
              <div className="text-3xl md:text-4xl font-bold text-prism-primary font-fira-code">
                <CountUp end={50000} suffix="+" />
              </div>
              <p className="text-prism-text-muted">Searches Daily</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-2"
            >
              <div className="text-3xl md:text-4xl font-bold text-prism-primary font-fira-code">
                <CountUp end={12} />
              </div>
              <p className="text-prism-text-muted">AI Models</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-2"
            >
              <div className="text-3xl md:text-4xl font-bold text-prism-primary font-fira-code">
                <CountUp end={99} suffix="%" />
              </div>
              <p className="text-prism-text-muted">Uptime</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-2"
            >
              <div className="text-3xl md:text-4xl font-bold text-prism-primary font-fira-code">
                <CountUp end={15} />
              </div>
              <p className="text-prism-text-muted">Tools Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-prism-text font-fira-code">
              Powerful Tools
            </h2>
            <p className="text-xl text-prism-text-muted max-w-3xl mx-auto">
              Explore our comprehensive suite of AI-powered tools designed to enhance your productivity and creativity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Search Tool */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card className="h-full bg-gradient-to-br from-prism-surface/80 to-prism-bg/50 border-prism-border hover:border-prism-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-prism-primary/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-prism-primary/30 transition-colors">
                    <Search className="h-8 w-8 text-prism-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-prism-text">AI Search</h3>
                  <p className="text-prism-text-muted">
                    Advanced search with multiple AI models and intelligent result analysis.
                  </p>
                  <Button
                    onClick={() => navigate('/search')}
                    className="w-full bg-prism-primary hover:bg-prism-primary-dark text-white"
                  >
                    Try Search
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Deep Search Tool */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card className="h-full bg-gradient-to-br from-prism-surface/80 to-prism-bg/50 border-prism-border hover:border-prism-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-prism-accent/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-prism-accent/30 transition-colors">
                    <Globe className="h-8 w-8 text-prism-accent" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-xl font-semibold text-prism-text">Deep Search</h3>
                    <Badge variant="secondary" className="bg-prism-accent/20 text-prism-accent-light text-xs">
                      Beta
                    </Badge>
                  </div>
                  <p className="text-prism-text-muted">
                    Advanced web scraping with AI-powered analysis and intelligent summarization.
                  </p>
                  <Button
                    onClick={() => navigate('/deep-search')}
                    className="w-full bg-prism-accent hover:bg-prism-accent-dark text-white"
                  >
                    Try Deep Search
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chat Tool */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card className="h-full bg-gradient-to-br from-prism-surface/80 to-prism-bg/50 border-prism-border hover:border-prism-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-prism-secondary/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-prism-secondary/30 transition-colors">
                    <MessageSquare className="h-8 w-8 text-prism-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-prism-text">AI Chat</h3>
                  <p className="text-prism-text-muted">
                    Conversational AI with multiple models and advanced reasoning capabilities.
                  </p>
                  <Button
                    onClick={() => navigate('/chat')}
                    className="w-full bg-prism-secondary hover:bg-prism-secondary-dark text-white"
                  >
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Math Assistant Tool */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card className="h-full bg-gradient-to-br from-prism-surface/80 to-prism-bg/50 border-prism-border hover:border-prism-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-500/30 transition-colors">
                    <Calculator className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-xl font-semibold text-prism-text">Math Assistant</h3>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                      Beta
                    </Badge>
                  </div>
                  <p className="text-prism-text-muted">
                    Advanced mathematical problem solving with Qwen3-30B-A3B (MoE) AI model.
                  </p>
                  <Button
                    onClick={() => navigate('/math')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Solve Problems
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Physics Assistant Tool */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card className="h-full bg-gradient-to-br from-prism-surface/80 to-prism-bg/50 border-prism-border hover:border-prism-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-purple-500/30 transition-colors">
                    <Atom className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-xl font-semibold text-prism-text">Physics Helper</h3>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                      Beta
                    </Badge>
                  </div>
                  <p className="text-prism-text-muted">
                    Physics problem solving and concept explanation with Qwen3-30B-A3B (MoE) AI.
                  </p>
                  <Button
                    onClick={() => navigate('/physics')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Explore Physics
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chemistry Lab Tool */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card className="h-full bg-gradient-to-br from-prism-surface/80 to-prism-bg/50 border-prism-border hover:border-prism-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-green-500/30 transition-colors">
                    <Beaker className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-xl font-semibold text-prism-text">Chemistry Lab</h3>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 text-xs">
                      Beta
                    </Badge>
                  </div>
                  <p className="text-prism-text-muted">
                    Chemical equations, reactions, and molecular analysis with Qwen3-30B-A3B (MoE).
                  </p>
                  <Button
                    onClick={() => navigate('/chemistry')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Start Lab Work
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Advanced Graphing Tool */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card className="h-full bg-gradient-to-br from-prism-surface/80 to-prism-bg/50 border-prism-border hover:border-prism-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-orange-500/30 transition-colors">
                    <TrendingUp className="h-8 w-8 text-orange-400" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-xl font-semibold text-prism-text">Advanced Graphing</h3>
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 text-xs">
                      Beta
                    </Badge>
                  </div>
                  <p className="text-prism-text-muted">
                    Interactive graphing calculator with multiple function support and analysis.
                  </p>
                  <Button
                    onClick={() => navigate('/graphing')}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Create Graphs
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Conversions Tool */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card className="h-full bg-gradient-to-br from-prism-surface/80 to-prism-bg/50 border-prism-border hover:border-prism-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-yellow-500/30 transition-colors">
                    <RotateCcw className="h-8 w-8 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-prism-text">Unit Conversions</h3>
                  <p className="text-prism-text-muted">
                    Convert between various units of measurement with ease.
                  </p>
                  <Button
                    onClick={() => navigate('/conversions')}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Start Converting
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Compressor Tool */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card className="h-full bg-gradient-to-br from-prism-surface/80 to-prism-bg/50 border-prism-border hover:border-prism-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-red-500/30 transition-colors">
                    <Archive className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-prism-text">File Compressor</h3>
                  <p className="text-prism-text-muted">
                    Reduce the size of your files without losing quality.
                  </p>
                  <Button
                    onClick={() => navigate('/compressor')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    Compress Files
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Detector Tool */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card className="h-full bg-gradient-to-br from-prism-surface/80 to-prism-bg/50 border-prism-border hover:border-prism-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-pink-500/30 transition-colors">
                    <Eye className="h-8 w-8 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-prism-text">Content Detector</h3>
                  <p className="text-prism-text-muted">
                    Detect various types of content within your files.
                  </p>
                  <Button
                    onClick={() => navigate('/detector')}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    Detect Content
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-prism-dark-bg">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-prism-text mb-4 font-fira-code">
              What Our Users Say
            </h2>
            <p className="text-prism-text-muted">
              Real stories from people using Prism to achieve their goals.
            </p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-prism-surface/50 rounded-lg p-6 shadow-md"
            >
              <p className="text-prism-text-light italic mb-4">
                "Prism has revolutionized the way I approach problem-solving. The AI-powered tools are incredibly intuitive and accurate."
              </p>
              <p className="text-prism-text-muted">- Alex M., Student</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-prism-surface/50 rounded-lg p-6 shadow-md"
            >
              <p className="text-prism-text-light italic mb-4">
                "The document editor is a game-changer for my workflow. It's seamless, efficient, and packed with features I didn't know I needed."
              </p>
              <p className="text-prism-text-muted">- Sarah L., Writer</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-prism-surface/50 rounded-lg p-6 shadow-md"
            >
              <p className="text-prism-text-light italic mb-4">
                "I've tried other AI tools, but Prism stands out with its accuracy and user-friendly interface. It's become an essential part of my toolkit."
              </p>
              <p className="text-prism-text-muted">- Chris B., Engineer</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-prism-text mb-8 font-fira-code">
              Ready to Transform Your Work?
            </h2>
            <p className="text-xl text-prism-text-muted max-w-3xl mx-auto mb-12">
              Join thousands of users who are already leveraging the power of AI with Prism.
            </p>
            <Button
              size="lg"
              className="bg-prism-primary hover:bg-prism-primary-dark text-white"
              onClick={() => navigate('/search')}
            >
              Explore Prism Today
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
