
import React, { useState } from 'react';
import { Search, Filter, BookOpen, Globe, Database, Image as ImageIcon, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SearchResults from '@/components/SearchResults';
import Navigation from '@/components/Navigation';
import FocusMode from '@/components/ui/focus-mode';

const DeepSearch = () => {
  const [query, setQuery] = useState('');
  const [activeSource, setActiveSource] = useState('all');
  const [searchHistory, setSearchHistory] = useState([
    'quantum computing applications',
    'renewable energy trends 2024',
    'artificial intelligence ethics',
  ]);

  const sources = [
    { id: 'all', label: 'All Sources', icon: Globe, color: 'bg-primary' },
    { id: 'web', label: 'Web Search', icon: Globe, color: 'bg-blue-500' },
    { id: 'academic', label: 'Academic Papers', icon: BookOpen, color: 'bg-green-500' },
    { id: 'databases', label: 'Databases', icon: Database, color: 'bg-purple-500' },
    { id: 'visual', label: 'Visual Content', icon: ImageIcon, color: 'bg-orange-500' },
  ];

  return (
    <FocusMode toolName="Deep Search 2.0">
      <div className="h-full overflow-auto">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Deep Search 2.0
                </h1>
                <Badge variant="secondary" className="mt-1">Multi-Source Intelligence</Badge>
              </div>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced AI-powered search across web, academic papers, databases, and visual content
            </p>
          </div>

          {/* Search Interface */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex space-x-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter your research query..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <Button size="lg" className="px-8">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>

              {/* Source Selection */}
              <div className="flex flex-wrap gap-2 mb-4">
                {sources.map((source) => {
                  const Icon = source.icon;
                  return (
                    <Button
                      key={source.id}
                      variant={activeSource === source.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveSource(source.id)}
                      className="flex items-center space-x-2"
                    >
                      <div className={`w-3 h-3 rounded-full ${source.color}`} />
                      <Icon className="w-4 h-4" />
                      <span>{source.label}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Advanced Filters */}
              <div className="flex items-center space-x-4 text-sm">
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button variant="ghost" size="sm">
                  <Clock className="w-4 h-4 mr-2" />
                  Time Range
                </Button>
                <Button variant="ghost" size="sm">
                  <Star className="w-4 h-4 mr-2" />
                  Source Quality
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results and Features */}
          <Tabs defaultValue="results" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="results">Search Results</TabsTrigger>
              <TabsTrigger value="threads">Research Threads</TabsTrigger>
              <TabsTrigger value="history">Search History</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="results">
              <SearchResults />
            </TabsContent>

            <TabsContent value="threads">
              <Card>
                <CardHeader>
                  <CardTitle>Research Threads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors cursor-pointer">
                      <h3 className="font-medium mb-2">AI Ethics in Healthcare</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Continuing research on ethical implications of AI in medical diagnosis...
                      </p>
                      <div className="flex space-x-2">
                        <Badge variant="outline">5 sources</Badge>
                        <Badge variant="outline">3 papers</Badge>
                        <Badge variant="outline">Updated 2h ago</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Search History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {searchHistory.map((search, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors cursor-pointer"
                      >
                        <span className="text-sm">{search}</span>
                        <Button variant="ghost" size="sm">
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h3 className="font-medium text-primary mb-2">Trending Topics</h3>
                      <p className="text-sm text-muted-foreground">
                        Based on your search patterns, AI safety and quantum computing are trending in your research area.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                      <h3 className="font-medium text-accent mb-2">Source Recommendations</h3>
                      <p className="text-sm text-muted-foreground">
                        New academic papers from Nature and Science journals match your research interests.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </FocusMode>
  );
};

export default DeepSearch;
