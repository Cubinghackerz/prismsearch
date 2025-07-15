
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, Search, Eye, Clock, Globe, Settings } from 'lucide-react';
import { DashboardSettings } from './DashboardSettings';

const AnalyticsDashboard = () => {
  const [showSettings, setShowSettings] = useState(false);

  // Mock data for charts
  const searchData = [
    { month: 'Jan', searches: 1200, users: 450 },
    { month: 'Feb', searches: 1800, users: 680 },
    { month: 'Mar', searches: 2400, users: 890 },
    { month: 'Apr', searches: 3200, users: 1200 },
    { month: 'May', searches: 4100, users: 1580 },
    { month: 'Jun', searches: 5200, users: 1920 }
  ];

  const topSearches = [
    { query: 'AI technology', count: 1250 },
    { query: 'Web development', count: 980 },
    { query: 'Data science', count: 756 },
    { query: 'Machine learning', count: 642 },
    { query: 'Cloud computing', count: 534 }
  ];

  const trafficSources = [
    { name: 'Direct', value: 35, color: '#00C2A8' },
    { name: 'Search Engines', value: 28, color: '#9B5DE5' },
    { name: 'Social Media', value: 20, color: '#F97316' },
    { name: 'Referrals', value: 17, color: '#EF4444' }
  ];

  const performanceData = [
    { time: '00:00', responseTime: 120, uptime: 99.9 },
    { time: '04:00', responseTime: 115, uptime: 99.8 },
    { time: '08:00', responseTime: 140, uptime: 99.9 },
    { time: '12:00', responseTime: 165, uptime: 99.7 },
    { time: '16:00', responseTime: 180, uptime: 99.8 },
    { time: '20:00', responseTime: 155, uptime: 99.9 }
  ];

  const stats = [
    { title: 'Total Searches', value: '24,567', change: '+12.5%', icon: Search, color: 'text-prism-primary' },
    { title: 'Active Users', value: '8,429', change: '+8.2%', icon: Users, color: 'text-prism-accent' },
    { title: 'Page Views', value: '156,892', change: '+15.3%', icon: Eye, color: 'text-orange-500' },
    { title: 'Avg. Session', value: '4m 32s', change: '+5.7%', icon: Clock, color: 'text-green-500' }
  ];

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-4xl font-bold text-prism-text mb-3">Analytics Dashboard</h2>
          <p className="text-prism-text-muted text-lg">Comprehensive insights into your application performance</p>
        </div>
        <Button
          onClick={() => setShowSettings(true)}
          variant="outline"
          className="border-prism-border hover:bg-prism-surface/80 text-prism-text"
        >
          <Settings className="h-4 w-4 mr-2" />
          Customize
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-prism-surface/60 border-prism-border backdrop-blur-md hover:bg-prism-surface/80 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-prism-text-muted uppercase tracking-wide">{stat.title}</p>
                    <p className="text-3xl font-bold text-prism-text">{stat.value}</p>
                    <p className={`text-sm font-semibold ${stat.color}`}>{stat.change}</p>
                  </div>
                  <stat.icon className={`h-10 w-10 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-prism-surface/60 border-prism-border backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-prism-text text-xl font-bold">Search Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={searchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--prism-border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--prism-text-muted))" fontSize={12} fontWeight="600" />
                  <YAxis stroke="hsl(var(--prism-text-muted))" fontSize={12} fontWeight="600" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--prism-surface))',
                      border: '1px solid hsl(var(--prism-border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}
                  />
                  <Area type="monotone" dataKey="searches" stroke="hsl(var(--prism-primary))" fill="hsl(var(--prism-primary))" fillOpacity={0.3} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Traffic Sources */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-prism-surface/60 border-prism-border backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-prism-text text-xl font-bold">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={12}
                    fontWeight="600"
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--prism-surface))',
                      border: '1px solid hsl(var(--prism-border))',
                      borderRadius: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Searches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="bg-prism-surface/60 border-prism-border backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-prism-text text-xl font-bold">Top Search Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topSearches} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--prism-border))" />
                  <XAxis type="number" stroke="hsl(var(--prism-text-muted))" fontSize={12} fontWeight="600" />
                  <YAxis type="category" dataKey="query" stroke="hsl(var(--prism-text-muted))" width={120} fontSize={12} fontWeight="600" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--prism-surface))',
                      border: '1px solid hsl(var(--prism-border))',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--prism-accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="bg-prism-surface/60 border-prism-border backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-prism-text text-xl font-bold">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--prism-border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--prism-text-muted))" fontSize={12} fontWeight="600" />
                  <YAxis stroke="hsl(var(--prism-text-muted))" fontSize={12} fontWeight="600" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--prism-surface))',
                      border: '1px solid hsl(var(--prism-border))',
                      borderRadius: '12px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="responseTime" stroke="#F97316" name="Response Time (ms)" strokeWidth={3} />
                  <Line type="monotone" dataKey="uptime" stroke="#10B981" name="Uptime %" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <DashboardSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default AnalyticsDashboard;
