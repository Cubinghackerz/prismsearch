
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Globe, 
  ShoppingCart, 
  User, 
  BookOpen, 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Camera,
  Music,
  Gamepad2,
  Heart,
  Briefcase
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  prompt: string;
  features: string[];
  complexity: 'Low' | 'Medium' | 'High';
  tags: string[];
}

const templates: Template[] = [
  {
    id: 'dashboard',
    name: 'Analytics Dashboard',
    description: 'A modern analytics dashboard with charts, metrics, and data visualization',
    category: 'Business',
    icon: BarChart3,
    complexity: 'Medium',
    prompt: 'Create a modern analytics dashboard with multiple chart types (line, bar, pie), key metrics cards, data tables, and a responsive sidebar navigation. Include dark/light mode toggle, export functionality, and interactive filters. Use Chart.js for visualizations and implement real-time data updates simulation.',
    features: ['Multiple chart types', 'Real-time updates', 'Export functionality', 'Dark/light mode', 'Responsive design'],
    tags: ['charts', 'analytics', 'business', 'dashboard']
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    description: 'A complete e-commerce platform with product catalog, cart, and checkout',
    category: 'E-commerce',
    icon: ShoppingCart,
    complexity: 'High',
    prompt: 'Build a full-featured e-commerce store with product grid, detailed product pages, shopping cart functionality, user authentication, checkout process, order tracking, and admin panel. Include search and filter capabilities, product reviews, wishlist, and responsive design for mobile shopping.',
    features: ['Product catalog', 'Shopping cart', 'User authentication', 'Payment integration', 'Admin panel'],
    tags: ['shopping', 'products', 'payment', 'commerce']
  },
  {
    id: 'portfolio',
    name: 'Portfolio Website',
    description: 'A professional portfolio website for showcasing work and skills',
    category: 'Personal',
    icon: User,
    complexity: 'Low',
    prompt: 'Create a stunning personal portfolio website with hero section, about me, skills showcase, project gallery with filtering, testimonials, blog section, and contact form. Include smooth scrolling, animations, responsive design, and a modern aesthetic with professional typography.',
    features: ['Project gallery', 'Skills showcase', 'Contact form', 'Blog section', 'Smooth animations'],
    tags: ['portfolio', 'personal', 'showcase', 'professional']
  },
  {
    id: 'blog',
    name: 'Blog Platform',
    description: 'A modern blog platform with content management and social features',
    category: 'Content',
    icon: BookOpen,
    complexity: 'Medium',
    prompt: 'Develop a comprehensive blog platform with article creation, rich text editor, categories and tags, search functionality, user comments, social sharing, newsletter signup, and author profiles. Include SEO optimization, reading time estimation, and responsive design.',
    features: ['Rich text editor', 'Categories & tags', 'User comments', 'SEO optimization', 'Social sharing'],
    tags: ['blog', 'content', 'writing', 'social']
  },
  {
    id: 'todo',
    name: 'Task Manager',
    description: 'A powerful task management app with projects, deadlines, and collaboration',
    category: 'Productivity',
    icon: Calendar,
    complexity: 'Medium',
    prompt: 'Build a comprehensive task management application with project organization, task priorities, due dates, progress tracking, team collaboration, file attachments, time tracking, and reporting. Include drag-and-drop functionality, notifications, and calendar integration.',
    features: ['Project organization', 'Priority levels', 'Team collaboration', 'Time tracking', 'Calendar view'],
    tags: ['tasks', 'productivity', 'organization', 'collaboration']
  },
  {
    id: 'chat',
    name: 'Chat Application',
    description: 'A real-time chat application with rooms, file sharing, and video calls',
    category: 'Communication',
    icon: MessageSquare,
    complexity: 'High',
    prompt: 'Create a real-time chat application with multiple chat rooms, private messaging, file and image sharing, emoji reactions, message search, user profiles, online status indicators, and basic video calling functionality. Include message encryption and moderation tools.',
    features: ['Real-time messaging', 'File sharing', 'Video calls', 'Multiple rooms', 'User profiles'],
    tags: ['chat', 'messaging', 'realtime', 'communication']
  },
  {
    id: 'photo-gallery',
    name: 'Photo Gallery',
    description: 'An elegant photo gallery with albums, filters, and sharing capabilities',
    category: 'Media',
    icon: Camera,
    complexity: 'Medium',
    prompt: 'Build a beautiful photo gallery application with album organization, image filters, slideshow mode, sharing capabilities, metadata display, bulk upload, search by tags, and social features. Include image optimization and responsive masonry layout.',
    features: ['Album organization', 'Image filters', 'Slideshow mode', 'Bulk upload', 'Social sharing'],
    tags: ['photos', 'gallery', 'images', 'albums']
  },
  {
    id: 'music-player',
    name: 'Music Player',
    description: 'A modern music streaming app with playlists and audio visualization',
    category: 'Entertainment',
    icon: Music,
    complexity: 'High',
    prompt: 'Develop a feature-rich music player with playlist management, audio visualization, equalizer, search functionality, favorite tracks, shuffle and repeat modes, lyrics display, and social sharing. Include cross-fade transitions and keyboard shortcuts.',
    features: ['Playlist management', 'Audio visualization', 'Equalizer', 'Lyrics display', 'Social features'],
    tags: ['music', 'audio', 'streaming', 'playlists']
  },
  {
    id: 'game',
    name: 'Browser Game',
    description: 'An interactive browser game with scoring, levels, and achievements',
    category: 'Games',
    icon: Gamepad2,
    complexity: 'Medium',
    prompt: 'Create an engaging browser-based game with multiple levels, scoring system, achievements, leaderboards, power-ups, responsive controls, and progressive difficulty. Include save/load functionality, sound effects, and social sharing of scores.',
    features: ['Multiple levels', 'Scoring system', 'Achievements', 'Leaderboards', 'Progressive difficulty'],
    tags: ['games', 'interactive', 'entertainment', 'scoring']
  },
  {
    id: 'fitness',
    name: 'Fitness Tracker',
    description: 'A comprehensive fitness tracking app with workouts and progress monitoring',
    category: 'Health',
    icon: Heart,
    complexity: 'Medium',
    prompt: 'Build a fitness tracking application with workout logging, exercise database, progress charts, goal setting, nutrition tracking, social challenges, workout plans, and achievement badges. Include BMI calculator and workout timer.',
    features: ['Workout logging', 'Progress tracking', 'Goal setting', 'Social challenges', 'Nutrition tracking'],
    tags: ['fitness', 'health', 'tracking', 'workouts']
  },
  {
    id: 'crm',
    name: 'CRM System',
    description: 'A customer relationship management system for business operations',
    category: 'Business',
    icon: Briefcase,
    complexity: 'High',
    prompt: 'Develop a comprehensive CRM system with contact management, deal pipeline, task scheduling, email integration, reporting dashboard, customer segmentation, sales forecasting, and team collaboration tools. Include data import/export and custom fields.',
    features: ['Contact management', 'Deal pipeline', 'Email integration', 'Sales reporting', 'Team collaboration'],
    tags: ['crm', 'business', 'sales', 'customers']
  }
];

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
  isOpen: boolean;
  onClose: () => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate, isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-prism-primary" />
            <span>Template Library</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-[70vh]">
          {/* Categories Sidebar */}
          <div className="w-48 flex-shrink-0">
            <h3 className="font-semibold text-prism-text mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1">
            <ScrollArea className="h-full pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => {
                  const IconComponent = template.icon;
                  return (
                    <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-lg bg-prism-primary/10">
                              <IconComponent className="w-5 h-5 text-prism-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              <Badge 
                                variant={template.complexity === 'Low' ? 'default' : 
                                        template.complexity === 'Medium' ? 'secondary' : 'destructive'}
                                className="text-xs mt-1"
                              >
                                {template.complexity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-prism-text-muted mb-3 line-clamp-2">
                          {template.description}
                        </p>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-xs font-medium text-prism-text mb-1">Key Features:</h4>
                            <div className="flex flex-wrap gap-1">
                              {template.features.slice(0, 3).map(feature => (
                                <Badge key={feature} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {template.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{template.features.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Button 
                            onClick={() => handleSelectTemplate(template)}
                            className="w-full text-sm"
                            size="sm"
                          >
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateLibrary;
