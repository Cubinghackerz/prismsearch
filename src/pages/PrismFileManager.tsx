import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Zap, 
  RefreshCw,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import existing components
import EmbeddableCompressor from '@/components/prism-code/EmbeddableCompressor';
import PrismConversions from './PrismConversions';

const PrismFileManager = () => {
  const [activeTab, setActiveTab] = useState('converter');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-fira-code">
                  File Manager
                </h1>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded-full border border-blue-500/30 font-fira-code">
                  New
                </span>
              </div>
              <p className="text-prism-text-muted mt-2 font-inter">
                Convert between file formats and compress files with advanced algorithms
              </p>
            </div>
          </div>

          <Alert className="border-blue-500/30 bg-blue-500/5">
            <Settings className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-300">
              <strong>Dual Mode Tool:</strong> Switch between file conversion and compression modes 
              to handle all your file management needs in one place.
            </AlertDescription>
          </Alert>
        </div>

        {/* Mode Selector */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="converter" className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>File Converter</span>
            </TabsTrigger>
            <TabsTrigger value="compressor" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>File Compressor</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="converter">
            <PrismConversions />
          </TabsContent>

          <TabsContent value="compressor">
            <EmbeddableCompressor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PrismFileManager;