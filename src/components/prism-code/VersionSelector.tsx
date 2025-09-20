import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Globe, Sparkles, Code, Beaker } from "lucide-react";

interface VersionSelectorProps {
  version: 'legacy' | 'beta';
  onVersionChange: (version: 'legacy' | 'beta') => void;
}

const VersionSelector: React.FC<VersionSelectorProps> = ({ version, onVersionChange }) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <Beaker className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Version Selection</h3>
              <p className="text-sm text-muted-foreground">Choose between stable legacy or experimental beta features</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={version === 'legacy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onVersionChange('legacy')}
              className="flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>Legacy</span>
              <Badge variant="secondary" className="ml-1 text-xs">Stable</Badge>
            </Button>
            
            <Button
              variant={version === 'beta' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onVersionChange('beta')}
              className="flex items-center space-x-2"
            >
              <Rocket className="w-4 h-4" />
              <span>Beta</span>
              <Badge variant="destructive" className="ml-1 text-xs">Experimental</Badge>
            </Button>
          </div>
        </div>
        
        {version === 'beta' && (
          <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="font-medium text-purple-300">Beta Features Active</span>
            </div>
            <ul className="text-sm text-purple-200 space-y-1">
              <li>• Multi-language support (Python, Node.js, Rust, Go)</li>
              <li>• Framework templates (React, Vue, Svelte, Angular)</li>
              <li>• Enhanced preview system with live interactions</li>
              <li>• Advanced deployment options</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VersionSelector;