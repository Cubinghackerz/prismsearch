
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings, Palette, BarChart3, Layout, Eye, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DashboardPreferences {
  theme: 'light' | 'dark' | 'auto';
  showAnimations: boolean;
  compactMode: boolean;
  chartStyle: 'minimal' | 'detailed' | 'colorful';
  autoRefresh: boolean;
  refreshInterval: number;
  showPerformanceMetrics: boolean;
  showSearchTrends: boolean;
  showTrafficSources: boolean;
  showTopSearches: boolean;
}

export const DashboardSettings: React.FC<DashboardSettingsProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<DashboardPreferences>({
    theme: 'dark',
    showAnimations: true,
    compactMode: false,
    chartStyle: 'detailed',
    autoRefresh: true,
    refreshInterval: 30,
    showPerformanceMetrics: true,
    showSearchTrends: true,
    showTrafficSources: true,
    showTopSearches: true
  });

  useEffect(() => {
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('prism_dashboard_preferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const updatePreference = <K extends keyof DashboardPreferences>(
    key: K,
    value: DashboardPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const savePreferences = () => {
    localStorage.setItem('prism_dashboard_preferences', JSON.stringify(preferences));
    toast({
      title: "Settings saved",
      description: "Your dashboard preferences have been updated.",
    });
    onClose();
  };

  const resetPreferences = () => {
    const defaultPreferences: DashboardPreferences = {
      theme: 'dark',
      showAnimations: true,
      compactMode: false,
      chartStyle: 'detailed',
      autoRefresh: true,
      refreshInterval: 30,
      showPerformanceMetrics: true,
      showSearchTrends: true,
      showTrafficSources: true,
      showTopSearches: true
    };
    setPreferences(defaultPreferences);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-prism-surface border-prism-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-prism-border pb-4">
          <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-prism-text">
            <Settings className="h-6 w-6 text-prism-primary" />
            <span>Dashboard Settings</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8 p-6">
          {/* Appearance Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="h-5 w-5 text-prism-primary" />
              <h3 className="text-lg font-bold text-prism-text">Appearance</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-prism-text font-semibold">Theme Preference</Label>
                <Select value={preferences.theme} onValueChange={(value: 'light' | 'dark' | 'auto') => updatePreference('theme', value)}>
                  <SelectTrigger className="bg-prism-surface border-prism-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-prism-text font-semibold">Chart Style</Label>
                <Select value={preferences.chartStyle} onValueChange={(value: 'minimal' | 'detailed' | 'colorful') => updatePreference('chartStyle', value)}>
                  <SelectTrigger className="bg-prism-surface border-prism-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="colorful">Colorful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-prism-surface/50 rounded-xl border border-prism-border">
                <Label className="text-prism-text font-semibold">Show Animations</Label>
                <Switch
                  checked={preferences.showAnimations}
                  onCheckedChange={(checked) => updatePreference('showAnimations', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-prism-surface/50 rounded-xl border border-prism-border">
                <Label className="text-prism-text font-semibold">Compact Mode</Label>
                <Switch
                  checked={preferences.compactMode}
                  onCheckedChange={(checked) => updatePreference('compactMode', checked)}
                />
              </div>
            </div>
          </div>

          {/* Data & Performance Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="h-5 w-5 text-prism-primary" />
              <h3 className="text-lg font-bold text-prism-text">Data & Performance</h3>
            </div>

            <div className="flex items-center justify-between p-4 bg-prism-surface/50 rounded-xl border border-prism-border">
              <Label className="text-prism-text font-semibold">Auto Refresh Data</Label>
              <Switch
                checked={preferences.autoRefresh}
                onCheckedChange={(checked) => updatePreference('autoRefresh', checked)}
              />
            </div>

            {preferences.autoRefresh && (
              <div className="space-y-3">
                <Label className="text-prism-text font-semibold">Refresh Interval: {preferences.refreshInterval}s</Label>
                <Slider
                  value={[preferences.refreshInterval]}
                  onValueChange={(value) => updatePreference('refreshInterval', value[0])}
                  max={300}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-prism-text-muted">
                  <span>10s</span>
                  <span>5min</span>
                </div>
              </div>
            )}
          </div>

          {/* Widget Visibility Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="h-5 w-5 text-prism-primary" />
              <h3 className="text-lg font-bold text-prism-text">Widget Visibility</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-prism-surface/50 rounded-xl border border-prism-border">
                <Label className="text-prism-text font-semibold">Performance Metrics</Label>
                <Switch
                  checked={preferences.showPerformanceMetrics}
                  onCheckedChange={(checked) => updatePreference('showPerformanceMetrics', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-prism-surface/50 rounded-xl border border-prism-border">
                <Label className="text-prism-text font-semibold">Search Trends</Label>
                <Switch
                  checked={preferences.showSearchTrends}
                  onCheckedChange={(checked) => updatePreference('showSearchTrends', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-prism-surface/50 rounded-xl border border-prism-border">
                <Label className="text-prism-text font-semibold">Traffic Sources</Label>
                <Switch
                  checked={preferences.showTrafficSources}
                  onCheckedChange={(checked) => updatePreference('showTrafficSources', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-prism-surface/50 rounded-xl border border-prism-border">
                <Label className="text-prism-text font-semibold">Top Searches</Label>
                <Switch
                  checked={preferences.showTopSearches}
                  onCheckedChange={(checked) => updatePreference('showTopSearches', checked)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-prism-border">
            <Button
              onClick={resetPreferences}
              variant="outline"
              className="border-prism-border hover:bg-prism-surface/80"
            >
              Reset to Default
            </Button>
            
            <div className="space-x-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-prism-border hover:bg-prism-surface/80"
              >
                Cancel
              </Button>
              <Button
                onClick={savePreferences}
                className="bg-gradient-to-r from-prism-primary to-prism-accent hover:from-prism-primary/90 hover:to-prism-accent/90 text-white font-semibold"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
