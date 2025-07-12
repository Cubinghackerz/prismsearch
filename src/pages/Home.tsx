
import React from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare, Users, Zap, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { UserProfile } from '@/components/UserProfile';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { user, loading } = useAuth();

  // Simplified animation variants for better performance
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-prism-bg">
      <ParticleBackground color="#00C2A8" />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/aeaad4a8-0dc2-4d4b-b2b3-cb248e0843db.png" 
              alt="Prism Search Logo" 
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-prism-primary">
              Prism Search
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/pricing">
              <Button variant="ghost" className="text-prism-text hover:text-prism-primary">
                Pricing
              </Button>
            </Link>
            
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-prism-primary/20 animate-pulse" />
            ) : user ? (
              <UserProfile />
            ) : (
              <Link to="/auth">
                <Button className="bg-prism-primary hover:bg-prism-primary-dark text-white">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            {...fadeInUp}
            className="text-5xl md:text-7xl font-bold mb-6 text-prism-primary"
          >
            Search Smarter,
            <br />
            Find Faster
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-xl text-prism-text-muted mb-12 max-w-2xl mx-auto"
          >
            Prism Search aggregates results from multiple search engines and adds AI-powered insights 
            to give you the most comprehensive search experience possible.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/search">
              <Button size="lg" className="bg-prism-primary hover:bg-prism-primary-dark text-white text-lg px-8">
                <Search className="mr-2 h-5 w-5" />
                Start Searching
              </Button>
            </Link>
            
            <Link to="/chat">
              <Button size="lg" variant="outline" className="border-prism-primary text-prism-primary hover:bg-prism-primary/10 text-lg px-8">
                <MessageSquare className="mr-2 h-5 w-5" />
                Try AI Chat
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-prism-text mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-prism-text-muted text-lg max-w-2xl mx-auto">
              {user ? 
                `Welcome back${user.email ? `, ${user.email.split('@')[0]}` : ''}! Your personalized search experience awaits.` :
                "Discover the power of unified search with AI assistance and secure password management."
              }
            </p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp}>
              <Card className="bg-prism-surface/30 border-prism-border backdrop-blur-sm hover:bg-prism-surface/40 transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-prism-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-prism-text mb-2">Unified Search</h3>
                  <p className="text-prism-text-muted mb-4">
                    Get results from multiple search engines in one convenient interface.
                  </p>
                  <Link to="/search">
                    <Button className="bg-prism-primary hover:bg-prism-primary-dark text-white">
                      Start Searching
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-prism-surface/30 border-prism-border backdrop-blur-sm hover:bg-prism-surface/40 transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-prism-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-prism-text mb-2">AI-Powered Insights</h3>
                  <p className="text-prism-text-muted mb-4">
                    Leverage AI to summarize search results and get answers faster.
                  </p>
                  <Link to="/chat">
                    <Button variant="outline" className="border-prism-primary text-prism-primary hover:bg-prism-primary/10">
                      Try AI Chat
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
            
            {!user && (
              <motion.div variants={fadeInUp}>
                <Card className="bg-prism-surface/30 border-prism-border backdrop-blur-sm hover:bg-prism-surface/40 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-prism-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-prism-text mb-2">Cloud Sync</h3>
                    <p className="text-prism-text-muted mb-4">
                      Sign in to sync your bookmarks and vault across all your devices securely.
                    </p>
                    <Link to="/auth">
                      <Button className="bg-prism-primary hover:bg-prism-primary-dark text-white">
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.h2 
            {...fadeInUp}
            className="text-4xl font-bold text-prism-text mb-8"
          >
            Ready to Supercharge Your Search?
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-xl text-prism-text-muted mb-12"
          >
            Join Prism Search today and experience a new way to find information online.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <Link to="/search">
              <Button size="lg" className="bg-prism-primary hover:bg-prism-primary-dark text-white text-lg px-8">
                Start Your Search
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Home;
