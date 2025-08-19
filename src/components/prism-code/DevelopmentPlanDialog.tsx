
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DevelopmentPlan } from '@/types/webApp';

interface DevelopmentPlanDialogProps {
  onPlanGenerated: (plan: DevelopmentPlan) => void;
}

const DevelopmentPlanDialog: React.FC<DevelopmentPlanDialogProps> = ({ onPlanGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<DevelopmentPlan | null>(null);
  const { toast } = useToast();

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      // Simulate plan generation for now
      const mockPlan: DevelopmentPlan = {
        projectOverview: "A modern web application with responsive design",
        colorScheme: {
          primary: "#3b82f6",
          secondary: "#6366f1",
          accent: "#f59e0b",
          background: "#ffffff",
          text: "#1f2937"
        },
        architecture: {
          framework: "React",
          styling: "Tailwind CSS",
          stateManagement: "React Hooks",
          routing: "React Router"
        },
        features: ["Responsive Design", "Dark Mode", "Authentication"],
        packages: ["react", "tailwindcss", "react-router-dom"],
        fileStructure: ["src/App.tsx", "src/components/", "src/styles/"],
        implementationSteps: ["Setup project", "Create components", "Add styling"],
        securityConsiderations: ["Input validation", "Authentication"],
        performanceOptimizations: ["Code splitting", "Lazy loading"],
        estimatedComplexity: "Medium"
      };
      
      setPlan(mockPlan);
      onPlanGenerated(mockPlan);
      
      toast({
        title: "Plan Generated",
        description: "Development plan has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate development plan.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Development Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Development Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!plan ? (
            <div className="text-center py-8">
              <Button
                onClick={generatePlan}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  'Generate Development Plan'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Architecture</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><strong>Framework:</strong> {plan.architecture.framework}</p>
                  <p><strong>Styling:</strong> {plan.architecture.styling}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <div className="flex flex-wrap gap-1">
                  {plan.features.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DevelopmentPlanDialog;
