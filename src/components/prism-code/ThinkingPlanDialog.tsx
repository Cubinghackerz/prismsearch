
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, Code, Package, Lightbulb, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlanStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  complexity: 'low' | 'medium' | 'high';
  packages?: string[];
}

interface ThinkingPlan {
  title: string;
  description: string;
  totalTime: string;
  complexity: 'low' | 'medium' | 'high';
  steps: PlanStep[];
  recommendedPackages: string[];
  potentialChallenges: string[];
}

interface ThinkingPlanDialogProps {
  isOpen: boolean;
  plan: ThinkingPlan | null;
  isLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
}

const ThinkingPlanDialog: React.FC<ThinkingPlanDialogProps> = ({
  isOpen,
  plan,
  isLoading,
  onApprove,
  onReject
}) => {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lightbulb className="w-6 h-6 text-orange-400" />
            <span>AI Development Plan</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-prism-text-muted">AI is analyzing your request and creating a development plan...</p>
            </div>
          </div>
        ) : plan ? (
          <div className="space-y-6">
            {/* Plan Overview */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-prism-text mb-2">{plan.title}</h3>
                    <p className="text-prism-text-muted">{plan.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getComplexityColor(plan.complexity)}>
                      {plan.complexity.toUpperCase()} COMPLEXITY
                    </Badge>
                    <div className="flex items-center text-sm text-prism-text-muted">
                      <Clock className="w-4 h-4 mr-1" />
                      Est. {plan.totalTime}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Development Steps */}
            <div>
              <h4 className="text-lg font-semibold text-prism-text mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                Development Steps
              </h4>
              <div className="space-y-3">
                {plan.steps.map((step, index) => (
                  <Card key={step.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <h5 className="font-semibold text-prism-text">{step.title}</h5>
                            <Badge className={getComplexityColor(step.complexity)} variant="outline">
                              {step.complexity}
                            </Badge>
                          </div>
                          <p className="text-prism-text-muted text-sm ml-8">{step.description}</p>
                          {step.packages && step.packages.length > 0 && (
                            <div className="ml-8 mt-2">
                              <div className="flex flex-wrap gap-1">
                                {step.packages.map((pkg) => (
                                  <span key={pkg} className="text-xs bg-prism-surface/20 px-2 py-1 rounded">
                                    {pkg}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-prism-text-muted flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.estimatedTime}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recommended Packages */}
            {plan.recommendedPackages.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-prism-text mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-400" />
                  Recommended Packages
                </h4>
                <div className="flex flex-wrap gap-2">
                  {plan.recommendedPackages.map((pkg) => (
                    <Badge key={pkg} variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                      {pkg}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Potential Challenges */}
            {plan.potentialChallenges.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-prism-text mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                  Potential Challenges
                </h4>
                <ul className="space-y-2">
                  {plan.potentialChallenges.map((challenge, index) => (
                    <li key={index} className="flex items-start space-x-2 text-prism-text-muted">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter className="flex space-x-2">
          <Button
            onClick={onReject}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onApprove}
            disabled={isLoading || !plan}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
          >
            <Code className="w-4 h-4 mr-2" />
            Approve & Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ThinkingPlanDialog;
export type { ThinkingPlan, PlanStep };
