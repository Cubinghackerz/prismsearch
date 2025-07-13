
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, Search, Eye, Clock, Globe } from 'lucide-react';

const AnalyticsDashboard = () => {
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
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-prism-text mb-2">Analytics Dashboard</h2>
        <p className="text-prism-text-muted">Comprehensive insights into your application performance</p>
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
            <Card className="bg-prism-surface/50 border-prism-border backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-prism-text-muted">{stat.title}</p>
                    <p className="text-2xl font-bold text-prism-text">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-prism-surface/50 border-prism-border backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-prism-text">Search Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={searchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="searches" stroke="#00C2A8" fill="#00C2A8" fillOpacity={0.3} />
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
          <Card className="bg-prism-surface/50 border-prism-border backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-prism-text">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
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
          <Card className="bg-prism-surface/50 border-prism-border backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-prism-text">Top Search Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSearches} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis type="category" dataKey="query" stroke="#9CA3AF" width={120} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#9B5DE5" />
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
          <Card className="bg-prism-surface/50 border-prism-border backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-prism-text">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="responseTime" stroke="#F97316" name="Response Time (ms)" />
                  <Line type="monotone" dataKey="uptime" stroke="#10B981" name="Uptime %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
