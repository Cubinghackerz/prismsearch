
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CountUp from '@/components/CountUp';
import Prism from '@/components/Prism';
import { 
  Search, 
  Lock, 
  Calculator, 
  Code, 
  MessageSquare, 
  FileText,
  Atom,
  FlaskConical,
  TrendingUp,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Home = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/5">
      <Navigation />
      
      {/* Background Prism */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30">
          <Prism />
        </div>
      </div>

      {/* Hero Section */}
      <motion.section 
        className="relative z-10 pt-32 pb-20 px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto text-center max-w-6xl">
          <motion.div variants={itemVariants} className="mb-8">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-primary/30 bg-primary/5">
              <Sparkles className="w-4 h-4 mr-2" />
              Next-Generation AI Platform
            </Badge>
          </motion.div>
          
          <motion.div variants={itemVariants} className="space-y-6 mb-12">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              The Future of{' '}
              <span className="inline-block animate-gradient-shift bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                Digital Intelligence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience the next evolution of AI-powered tools. From intelligent search to secure password management, 
              unlock unprecedented productivity and innovation.
            </p>
          </motion.div>

          <motion.div variants={itemVariands} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              asChild 
              size="lg" 
              className="px-8 py-4 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-primary/25"
            >
              <Link to="/chat">
                <MessageSquare className="w-5 h-5 mr-2" />
                Start Chatting
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300"
            >
              <Link to="/deep-search">
                <Search className="w-5 h-5 mr-2" />
                Deep Search
              </Link>
            </Button>
          </motion.div>

          {/* Stats Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                <CountUp end={50} duration={2} suffix="K+" />
              </div>
              <p className="text-muted-foreground text-lg">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">
                <CountUp end={99.9} duration={2.5} suffix="%" decimals={1} />
              </div>
              <p className="text-muted-foreground text-lg">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                <CountUp end={1} duration={3} suffix="M+" />
              </div>
              <p className="text-muted-foreground text-lg">Queries Processed</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="relative z-10 py-20 px-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container mx-auto max-w-7xl">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Powerful AI Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover a comprehensive suite of AI-powered tools designed to enhance your productivity and creativity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: "Prism Chat",
                description: "Advanced AI conversations with multiple models and real-time insights.",
                link: "/chat",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: Search,
                title: "Deep Search 2.0",
                description: "Revolutionary search engine with atomic thinking and AI-powered results.",
                link: "/deep-search",
                gradient: "from-purple-500 to-pink-500",
                badge: "Pro"
              },
              {
                icon: Lock,
                title: "Vault Pro",
                description: "Military-grade password management with AI security analysis.",
                link: "/vault",
                gradient: "from-green-500 to-emerald-500",
                badge: "Pro"
              },
              {
                icon: Calculator,
                title: "Mathematics Suite",
                description: "Advanced mathematical tools and AI-powered problem solving.",
                link: "/math",
                gradient: "from-orange-500 to-red-500"
              },
              {
                icon: Code,
                title: "Prism Code",
                description: "Intelligent code editor with AI assistance and project management.",
                link: "/code",
                gradient: "from-indigo-500 to-purple-500"
              },
              {
                icon: FileText,
                title: "Prism Pages",
                description: "Collaborative rich-text editor with real-time synchronization.",
                link: "/docs",
                gradient: "from-teal-500 to-cyan-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Card className="relative h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 group overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      {feature.badge && (
                        <Badge variant="secondary" className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30">
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <Button 
                      asChild 
                      className="w-full group-hover:bg-primary/20 transition-colors duration-300"
                      variant="ghost"
                    >
                      <Link to={feature.link} className="flex items-center justify-center">
                        Launch Tool
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="relative z-10 py-20 px-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 border-primary/20 backdrop-blur-sm">
              <CardContent className="p-12">
                <div className="mb-8">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Ready to Transform Your Workflow?
                  </h2>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Join thousands of users who have revolutionized their productivity with our AI-powered platform.
                  </p>
                </div>
                <Button 
                  asChild 
                  size="lg" 
                  className="px-8 py-4 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-primary/25"
                >
                  <Link to="/chat">
                    <Zap className="w-5 h-5 mr-2" />
                    Get Started Today
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Home;
