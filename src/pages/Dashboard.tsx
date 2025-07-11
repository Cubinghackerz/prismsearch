import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MessageCircle, 
  DollarSign, 
  ArrowRight, 
  RefreshCw, 
  PlusCircle,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DashboardHeader,
  DashboardShell,
  DashboardSidebar
} from '@/components/dashboard/layout';
import { ActivityItem } from '@/components/dashboard/activity-item';
import { StatsCard } from '@/components/dashboard/stats-card';
import { PlanSummary } from '@/components/dashboard/plan-summary';

const Dashboard = () => {
  // Mock data for the dashboard
  const user = {
    name: 'Alex Johnson',
    avatar: '/placeholder.svg'
  };
  
  const recentActivity = [
    { id: 1, type: 'search' as const, query: 'machine learning frameworks', timestamp: '2 hours ago' },
    { id: 2, type: 'chat' as const, topic: 'How to implement neural networks', timestamp: '4 hours ago' },
    { id: 3, type: 'search' as const, query: 'best practices for data visualization', timestamp: '1 day ago' },
    { id: 4, type: 'chat' as const, topic: 'Differences between supervised and unsupervised learning', timestamp: '2 days ago' },
    { id: 5, type: 'search' as const, query: 'python vs javascript for data science', timestamp: '3 days ago' }
  ];
  
  const stats = {
    searches: 28,
    chats: 14,
    plan: 'Free',
    creditsRemaining: 20
  };
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Welcome back, ${user.name}!`}
        text="Manage your searches, chats and account settings."
      >
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </DashboardHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" /> New Search
            </CardTitle>
            <CardDescription className="text-blue-100">
              Find information across the web
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">
              Access powerful AI-driven search capabilities for accurate results.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/search" className="w-full">
              <Button className="w-full bg-prism-violet hover:bg-prism-teal transition-colors">
                Start Searching <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" /> Open Chat
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Conversational AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">
              Chat with multiple AI models for in-depth conversations and assistance.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/chat" className="w-full">
              <Button className="w-full bg-prism-violet hover:bg-prism-teal transition-colors">
                Start Chatting <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" /> Prism Vault
            </CardTitle>
            <CardDescription className="text-purple-100">
              Secure password generator
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">
              Generate strong passwords with AI-powered strength assessment.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/vault" className="w-full">
              <Button className="w-full bg-prism-violet hover:bg-prism-teal transition-colors">
                Generate Password <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" /> View Plans
            </CardTitle>
            <CardDescription className="text-teal-100">
              Explore pricing options
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">
              Find the perfect plan to suit your search and chat needs.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/pricing" className="w-full">
              <Button className="w-full bg-prism-violet hover:bg-prism-teal transition-colors">
                See Pricing <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onRerun={() => console.log(`Re-running: ${activity.type}`, activity)}
              />
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <Button variant="outline" className="w-full sm:w-auto">
              View All Activity <PlusCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Searches This Month"
          value={stats.searches}
          icon={<Search className="h-8 w-8 text-blue-500" />}
          description="7 searches in the last week"
        />
        <StatsCard
          title="Chats This Month"
          value={stats.chats}
          icon={<MessageCircle className="h-8 w-8 text-indigo-500" />}
          description="3 chats in the last week"
        />
        <StatsCard
          title={`${stats.plan} Plan`}
          value={`${stats.creditsRemaining} Credits`}
          icon={<DollarSign className="h-8 w-8 text-teal-500" />}
          description="Renews on Jun 1, 2025"
        />
      </div>
      
      <div className="mt-8">
        <PlanSummary />
      </div>
    </DashboardShell>
  );
};

export default Dashboard;
