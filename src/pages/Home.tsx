
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MessageCircle, DollarSign, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';

const user = {
  name: 'Alex Johnson',
  avatar: '/placeholder.svg'
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Home = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 dark:from-prism-darkgray dark:to-black">
      <ParticleBackground />
      
      {/* Fixed Header */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-lg bg-white/70 dark:bg-prism-darkgray/70 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-montserrat font-bold text-2xl text-prism-violet">Prism</span>
            <span className="font-montserrat font-medium text-2xl text-gray-700 dark:text-gray-300">Search</span>
          </Link>
          
          {/* Navigation - Desktop */}
          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/search">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Search
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/chat">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Chat
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/pricing">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Pricing
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/dashboard">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/dashboard" className="w-full flex">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <motion.div 
          className="container mx-auto text-center"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-prism-violet mb-4"
            variants={item}
          >
            Welcome to Prism Search!
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8"
            variants={item}
          >
            Experience enhanced search with our AI-powered tools. Find what you need faster and get smarter answers to your questions.
          </motion.p>
          
          <motion.div 
            className="flex flex-col md:flex-row gap-4 justify-center mt-8"
            variants={container}
          >
            <motion.div variants={item}>
              <Link to="/search">
                <Button size="lg" className="bg-prism-violet hover:bg-prism-teal text-white w-full md:w-auto">
                  <Search className="mr-2 h-5 w-5" /> Start Search
                </Button>
              </Link>
            </motion.div>
            
            <motion.div variants={item}>
              <Link to="/chat">
                <Button size="lg" variant="outline" className="w-full md:w-auto border-prism-violet text-prism-violet hover:bg-prism-violet hover:text-white">
                  <MessageCircle className="mr-2 h-5 w-5" /> Open Chat
                </Button>
              </Link>
            </motion.div>
            
            <motion.div variants={item}>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="w-full md:w-auto border-prism-teal text-prism-teal hover:bg-prism-teal hover:text-white">
                  <DollarSign className="mr-2 h-5 w-5" /> View Pricing
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Feature Cards */}
      <section className="py-16 px-4 bg-white dark:bg-prism-darkgray">
        <div className="container mx-auto">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Our Core Features
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Search Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Card className="h-full border-2 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl font-bold">Quick Search</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    Find information across the web with our powerful AI-driven search engine that delivers accurate results instantly.
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link to="/search" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      Try Search <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
            
            {/* Chat Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Card className="h-full border-2 hover:border-indigo-400 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-xl font-bold">Interactive Chat</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    Have natural conversations with our advanced AI assistants to get in-depth answers to your complex questions.
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link to="/chat" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700">
                      Start Chatting <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
            
            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Card className="h-full border-2 hover:border-teal-400 transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto bg-teal-100 dark:bg-teal-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <DollarSign className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <CardTitle className="text-xl font-bold">Flexible Plans</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    Choose the perfect subscription plan to match your search and chat needs, from free trials to premium offerings.
                  </p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link to="/pricing" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">
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
      <section className="py-16 px-4 bg-gradient-to-b from-blue-50 to-white dark:from-prism-darkgray/50 dark:to-prism-darkgray">
        <div className="container mx-auto">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            See Prism Search in Action
          </motion.h2>
          
          <motion.div 
            className="bg-white dark:bg-prism-darkgray/80 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Sample Search Results</h3>
              
              <div className="space-y-4">
                <div className="p-4 border border-blue-100 dark:border-blue-900/30 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                  <h4 className="text-blue-600 dark:text-blue-400 font-medium">What are the benefits of AI in healthcare?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    AI offers numerous benefits in healthcare including improved diagnosis accuracy, personalized treatment plans, efficient patient monitoring...
                  </p>
                </div>
                
                <div className="p-4 border border-indigo-100 dark:border-indigo-900/30 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
                  <h4 className="text-indigo-600 dark:text-indigo-400 font-medium">How to implement neural networks in Python</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Neural networks can be implemented in Python using libraries like TensorFlow or PyTorch, starting with data preparation...
                  </p>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Link to="/search">
                  <Button variant="outline" size="sm">
                    Try your own search <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-prism-darkgray py-12 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Prism Search</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered search and chat platform for all your information needs.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><span className="cursor-not-allowed opacity-60">About</span></li>
                <li><span className="cursor-not-allowed opacity-60">Documentation</span></li>
                <li><span className="cursor-not-allowed opacity-60">API</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><span className="cursor-not-allowed opacity-60">Privacy Policy</span></li>
                <li><span className="cursor-not-allowed opacity-60">Terms of Service</span></li>
                <li><span className="cursor-not-allowed opacity-60">Cookie Policy</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><span className="cursor-not-allowed opacity-60">Contact</span></li>
                <li><span className="cursor-not-allowed opacity-60">Twitter</span></li>
                <li><span className="cursor-not-allowed opacity-60">GitHub</span></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
            <Footer />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
