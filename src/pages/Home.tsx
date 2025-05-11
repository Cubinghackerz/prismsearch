import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MessageCircle, DollarSign, ArrowRight, ChevronRight, FileSearch, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
const container = {
  hidden: {
    opacity: 0
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
const item = {
  hidden: {
    opacity: 0,
    y: 20
  },
  show: {
    opacity: 1,
    y: 0
  }
};
const Home = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mock search results
  const mockSearchResults = [{
    title: "Machine Learning Applications in Healthcare",
    snippet: "Recent advances in AI have revolutionized diagnostic procedures, with deep learning models achieving 96% accuracy in early disease detection..."
  }, {
    title: "Sustainable Energy Solutions for Urban Development",
    snippet: "Smart grid technologies combined with renewable energy sources have demonstrated a 42% reduction in carbon emissions across pilot cities..."
  }];

  // Mock chat exchanges
  const mockChatExchanges = [{
    question: "How does quantum computing differ from classical computing?",
    answer: "Quantum computing leverages quantum bits or qubits that can exist in multiple states simultaneously through superposition, unlike classical bits that are either 0 or 1..."
  }, {
    question: "What are the ethical implications of AI in healthcare?",
    answer: "AI in healthcare raises concerns about data privacy, algorithm bias, and the changing doctor-patient relationship. For example, AI systems trained on non-diverse datasets may..."
  }];

  // Pricing features
  const pricingFeatures = {
    free: ["1000 searches & 500 chat messages", "Basic chat assistance", "Standard response time"],
    pro: ["Coming Soon - Unlimited searches", "Coming Soon - Advanced chat with file upload", "Coming Soon - Priority response time", "Coming Soon - Custom data integration"],
    enterprise: ["All Pro features", "Dedicated support team", "Custom model training", "SLA guarantees"]
  };
  return <div className="min-h-screen flex flex-col bg-gradient-to-b from-prism-darkgray to-black text-white">
      <ParticleBackground />
      
      {/* Fixed Header */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-lg bg-prism-darkgray/70 border-b border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-montserrat font-bold text-2xl text-prism-teal">Prism</span>
            <span className="font-montserrat font-medium text-2xl text-gray-300">Search</span>
          </Link>
          
          {/* Navigation - Desktop */}
          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/">
                    
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/search">
                    
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/chat">
                    
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/pricing">
                    
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center">
            <Avatar>
              
              
            </Avatar>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <motion.div className="container mx-auto text-center" initial="hidden" animate="show" variants={container}>
          <motion.h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 mb-6" variants={item}>
            Welcome to Prism Search!
          </motion.h1>
          
          <motion.p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8" variants={item}>
            Experience enhanced search with our AI-powered tools. Find what you need faster and get smarter, more comprehensive answers to your complex questions.
          </motion.p>
          
          <motion.div className="flex flex-col md:flex-row gap-4 justify-center mt-8" variants={container}>
            <motion.div variants={item}>
              <Link to="/search">
                <Button size="lg" className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 border-none shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40">
                  <Search className="mr-2 h-5 w-5" /> Start Search
                </Button>
              </Link>
            </motion.div>
            
            <motion.div variants={item}>
              <Link to="/chat">
                <Button size="lg" className="w-full md:w-auto bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 border-none shadow-lg shadow-teal-500/20 transition-all duration-300 hover:shadow-teal-500/40">
                  <MessageCircle className="mr-2 h-5 w-5" /> Open Chat
                </Button>
              </Link>
            </motion.div>
            
            <motion.div variants={item}>
              <Link to="/pricing">
                <Button size="lg" className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-none shadow-lg shadow-purple-500/20 transition-all duration-300 hover:shadow-purple-500/40">
                  <DollarSign className="mr-2 h-5 w-5" /> View Pricing
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Feature Cards with Mock Content */}
      <section className="py-16 px-4 bg-gradient-to-b from-prism-darkgray/50 to-prism-darkgray/80">
        <div className="container mx-auto">
          <motion.h2 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="font-bold text-center mb-12 text-blue-100 text-4xl">
            Explore Our Features
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Search Feature Card */}
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.3
          }} whileHover={{
            y: -5,
            transition: {
              duration: 0.2
            }
          }} className="h-full">
              <Card className="h-full bg-gradient-to-br from-gray-900 to-blue-900/50 border-t-2 border-blue-400 transition-all duration-300 shadow-xl hover:shadow-blue-500/20">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto bg-blue-900/40 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-blue-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-blue-100">Quick Search</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6">
                  <p className="text-gray-300 mb-6">
                    Find information across the web with our powerful AI-driven search engine that delivers accurate results instantly.
                  </p>
                  
                  {/* Mock Search Results */}
                  <div className="space-y-4 mt-6">
                    <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 p-4 rounded-lg text-left border border-blue-700/30">
                      <h4 className="text-blue-300 font-semibold text-sm">{mockSearchResults[0].title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{mockSearchResults[0].snippet}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 p-4 rounded-lg text-left border border-blue-700/30">
                      <h4 className="text-blue-300 font-semibold text-sm">{mockSearchResults[1].title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{mockSearchResults[1].snippet}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link to="/search" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20">
                      Try Search <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
            
            {/* Chat Feature Card */}
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4
          }} whileHover={{
            y: -5,
            transition: {
              duration: 0.2
            }
          }} className="h-full">
              <Card className="h-full bg-gradient-to-br from-gray-900 to-teal-900/50 border-t-2 border-teal-400 transition-all duration-300 shadow-xl hover:shadow-teal-500/20">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto bg-teal-900/40 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-teal-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-teal-100">Interactive Chat</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6">
                  <p className="text-gray-300 mb-6">
                    Have natural conversations with our advanced AI assistants to get in-depth answers to your complex questions.
                  </p>
                  
                  {/* Mock Chat Exchange */}
                  <div className="space-y-4 mt-6">
                    <div className="flex flex-col space-y-3">
                      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-3 rounded-lg ml-auto max-w-[80%] text-left border border-gray-700/50">
                        <p className="text-xs text-gray-300">{mockChatExchanges[0].question}</p>
                      </div>
                      <div className="bg-gradient-to-r from-teal-900/30 to-teal-800/30 p-3 rounded-lg mr-auto max-w-[80%] text-left border border-teal-700/30">
                        <p className="text-xs text-teal-100">{mockChatExchanges[0].answer}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link to="/chat" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 shadow-lg shadow-teal-600/10 hover:shadow-teal-600/20">
                      Start Chatting <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
            
            {/* Pricing Feature Card */}
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.5
          }} whileHover={{
            y: -5,
            transition: {
              duration: 0.2
            }
          }} className="h-full">
              <Card className="h-full bg-gradient-to-br from-gray-900 to-purple-900/50 border-t-2 border-purple-400 transition-all duration-300 shadow-xl hover:shadow-purple-500/20">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto bg-purple-900/40 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <DollarSign className="h-8 w-8 text-purple-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-purple-100">Flexible Plans</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6">
                  <p className="text-gray-300 mb-6">
                    Choose the perfect subscription plan to match your search and chat needs, from free trials to premium offerings.
                  </p>
                  
                  {/* Pricing Tiers */}
                  <div className="space-y-4 mt-6">
                    <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 p-3 rounded-lg text-left border border-gray-700">
                      <h4 className="text-gray-200 font-semibold">Free</h4>
                      <ul className="text-xs text-gray-400 mt-2 list-disc pl-4">
                        {pricingFeatures.free.map((feature, index) => <li key={index}>{feature}</li>)}
                      </ul>
                    </div>
                    <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 p-3 rounded-lg text-left border border-purple-700/30">
                      <h4 className="text-purple-300 font-semibold">Pro <span className="text-xs font-normal ml-1 text-purple-400/80">(Coming Soon)</span></h4>
                      <ul className="text-xs text-gray-400 mt-2 list-disc pl-4">
                        {pricingFeatures.pro.map((feature, index) => <li key={index}>{feature}</li>)}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link to="/pricing" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 shadow-lg shadow-purple-600/10 hover:shadow-purple-600/20">
                      View Plans <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Demo Preview Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-prism-darkgray/80 to-black">
        <div className="container mx-auto">
          <motion.h2 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="font-bold text-center mb-12 bg-clip-text bg-gradient-to-r from-blue-300 to-teal-300 text-blue-300 text-4xl">
            See Prism Search in Action
          </motion.h2>
          
          <motion.div className="bg-gradient-to-br from-gray-900 to-blue-900/20 rounded-xl shadow-2xl overflow-hidden border border-blue-900/50" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }}>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-100">Experience the Power of AI</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-4 border border-blue-800/50 rounded-lg bg-blue-900/20 hover:bg-blue-900/30 transition-colors">
                    <div className="flex items-center mb-2">
                      <FileSearch className="h-4 w-4 text-blue-400 mr-2" />
                      <h4 className="text-blue-300 text-sm font-medium">Advanced Search Capabilities</h4>
                    </div>
                    <p className="text-xs text-gray-400">
                      Natural language processing enables you to search using everyday language and questions rather than keywords.
                    </p>
                  </div>
                  
                  <div className="p-4 border border-teal-800/50 rounded-lg bg-teal-900/20 hover:bg-teal-900/30 transition-colors">
                    <div className="flex items-center mb-2">
                      <Zap className="h-4 w-4 text-teal-400 mr-2" />
                      <h4 className="text-teal-300 text-sm font-medium">Instant, Accurate Responses</h4>
                    </div>
                    <p className="text-xs text-gray-400">
                      Get comprehensive answers to complex questions with AI that understands context and can synthesize information from multiple sources.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Mock Chat Session Preview */}
                  <div className="p-4 border border-purple-800/50 rounded-lg bg-purple-900/20 hover:bg-purple-900/30 transition-colors">
                    <div className="flex items-center mb-2">
                      <MessageCircle className="h-4 w-4 text-purple-400 mr-2" />
                      <h4 className="text-purple-300 text-sm font-medium">Interactive AI Conversations</h4>
                    </div>
                    <div className="bg-gray-900/50 p-2 rounded mt-2 text-xs text-gray-300">
                      <span className="font-semibold">User:</span> {mockChatExchanges[1].question}
                    </div>
                    <div className="bg-gray-800/50 p-2 rounded mt-1 text-xs text-gray-300">
                      <span className="font-semibold">Prism AI:</span> {mockChatExchanges[1].answer}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Link to="/search">
                  <Button variant="outline" size="sm" className="border-blue-500 transition-all hover:border-blue-400 text-cyan-400 bg-transparent">
                    Try your own search <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-prism-darkgray/90 py-12 px-4 border-t border-gray-800">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-blue-100">Prism Search</h3>
              <p className="text-sm text-gray-400">
                AI-powered search and chat platform for all your information needs.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-blue-100">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="cursor-not-allowed opacity-60">About</span></li>
                <li><span className="cursor-not-allowed opacity-60">Documentation</span></li>
                <li><span className="cursor-not-allowed opacity-60">API</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-blue-100">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="cursor-not-allowed opacity-60">Privacy Policy</span></li>
                <li><span className="cursor-not-allowed opacity-60">Terms of Service</span></li>
                <li><span className="cursor-not-allowed opacity-60">Cookie Policy</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-blue-100">Connect</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="cursor-not-allowed opacity-60">Contact</span></li>
                <li><span className="cursor-not-allowed opacity-60">Twitter</span></li>
                <li><span className="cursor-not-allowed opacity-60">GitHub</span></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-gray-800 text-center text-sm text-gray-400">
            <Footer />
          </div>
        </div>
      </footer>
    </div>;
};
export default Home;