
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Palette, Code, Package, Layout, Shield, Zap } from 'lucide-react';

interface DevelopmentPlan {
  projectOverview: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  architecture: {
    framework: string;
    styling: string;
    stateManagement: string;
    routing: string;
  };
  features: string[];
  packages: string[];
  fileStructure: string[];
  implementationSteps: string[];
  securityConsiderations: string[];
  performanceOptimizations: string[];
  estimatedComplexity: 'Low' | 'Medium' | 'High';
}

interface DevelopmentPlanDialogProps {
  isOpen: boolean;
  plan: DevelopmentPlan | null;
  isLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

const DevelopmentPlanDialog: React.FC<DevelopmentPlanDialogProps> = ({
  isOpen,
  plan,
  isLoading,
  onApprove,
  onReject,
  onClose,
}) => {
  if (!plan && !isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-prism-primary" />
            <span>Development Plan</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prism-primary"></div>
            <span className="ml-4 text-prism-text-muted">Analyzing your project...</span>
          </div>
        ) : plan ? (
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Project Overview */}
              <div>
                <h3 className="text-lg font-semibold text-prism-text mb-3 flex items-center">
                  <Layout className="w-4 h-4 mr-2" />
                  Project Overview
                </h3>
                <p className="text-prism-text-muted leading-relaxed">{plan.projectOverview}</p>
                <div className="mt-2">
                  <Badge variant={plan.estimatedComplexity === 'Low' ? 'default' : plan.estimatedComplexity === 'Medium' ? 'secondary' : 'destructive'}>
                    {plan.estimatedComplexity} Complexity
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Color Scheme */}
              <div>
                <h3 className="text-lg font-semibold text-prism-text mb-3 flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  Color Scheme
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(plan.colorScheme).map(([key, color]) => (
                    <div key={key} className="text-center">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-prism-border mx-auto mb-2"
                        style={{ backgroundColor: color }}
                      ></div>
                      <p className="text-sm font-medium text-prism-text capitalize">{key}</p>
                      <p className="text-xs text-prism-text-muted">{color}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Architecture */}
              <div>
                <h3 className="text-lg font-semibold text-prism-text mb-3 flex items-center">
                  <Code className="w-4 h-4 mr-2" />
                  Technical Architecture
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(plan.architecture).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-prism-text-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <Badge variant="outline">{value}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-prism-text mb-3">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-prism-text-muted text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Packages */}
              <div>
                <h3 className="text-lg font-semibold text-prism-text mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Recommended Packages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plan.packages.map((pkg, index) => (
                    <Badge key={index} variant="secondary">{pkg}</Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* File Structure */}
              <div>
                <h3 className="text-lg font-semibold text-prism-text mb-3">File Structure</h3>
                <div className="bg-prism-surface/20 rounded-lg p-4 font-mono text-sm">
                  {plan.fileStructure.map((file, index) => (
                    <div key={index} className="text-prism-text-muted">{file}</div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Implementation Steps */}
              <div>
                <h3 className="text-lg font-semibold text-prism-text mb-3">Implementation Steps</h3>
                <div className="space-y-3">
                  {plan.implementationSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-prism-primary/20 text-prism-primary rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-prism-text-muted text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Security & Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-prism-text mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Considerations
                  </h3>
                  <ul className="space-y-2">
                    {plan.securityConsiderations.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Shield className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-prism-text-muted text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-prism-text mb-3 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Performance Optimizations
                  </h3>
                  <ul className="space-y-2">
                    {plan.performanceOptimizations.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Zap className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-prism-text-muted text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : null}

        <DialogFooter className="flex justify-between">
          <Button 
            onClick={onReject} 
            variant="outline"
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Plan</span>
          </Button>
          <Button 
            onClick={onApprove}
            disabled={isLoading || !plan}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve & Generate</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DevelopmentPlanDialog;
