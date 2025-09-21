
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, Edit, Save, Copy, Key, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PasswordData {
  password: string;
  strengthAssessment: {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    feedback: string[];
    crackTime: string;
    entropy: number;
  };
}

interface GeneratedPasswordCardProps {
  passwordData: PasswordData;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onSave: () => void;
  onEdit: (editedPassword: string) => void;
}

export const GeneratedPasswordCard: React.FC<GeneratedPasswordCardProps> = ({
  passwordData,
  isVisible,
  onToggleVisibility,
  onSave,
  onEdit
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedPassword, setEditedPassword] = useState(passwordData.password);

  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'very-strong': return 'text-emerald-300 bg-emerald-950/50 border-emerald-600';
      case 'strong': return 'text-green-300 bg-green-950/50 border-green-600';
      case 'good': return 'text-cyan-300 bg-cyan-950/50 border-cyan-600';
      case 'fair': return 'text-amber-300 bg-amber-950/50 border-amber-600';
      case 'weak': return 'text-red-300 bg-red-950/50 border-red-600';
      default: return 'text-slate-300 bg-slate-950/50 border-slate-600';
    }
  };

  const getStrengthIcon = (level: string) => {
    switch (level) {
      case 'very-strong':
      case 'strong': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <Shield className="h-4 w-4" />;
      case 'fair': return <AlertTriangle className="h-4 w-4" />;
      case 'weak': return <XCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getStrengthBarColor = (score: number) => {
    if (score >= 90) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (score >= 70) return 'bg-gradient-to-r from-green-500 to-green-400';
    if (score >= 50) return 'bg-gradient-to-r from-cyan-500 to-cyan-400';
    if (score >= 30) return 'bg-gradient-to-r from-amber-500 to-amber-400';
    return 'bg-gradient-to-r from-red-500 to-red-400';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(passwordData.password);
      toast({
        title: "Password copied!",
        description: "The password has been copied to your clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy password to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save the edited password
      onEdit(editedPassword);
      setIsEditing(false);
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated."
      });
    } else {
      // Start editing
      setEditedPassword(passwordData.password);
      setIsEditing(true);
    }
  };

  const displayPassword = isEditing ? editedPassword : passwordData.password;

  return (
    <Card className="border-border bg-card shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-base font-semibold">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span>Generated Password</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              type={isVisible ? "text" : "password"}
              value={displayPassword}
              readOnly={!isEditing}
              onChange={(e) => isEditing && setEditedPassword(e.target.value)}
              className={`font-mono text-sm ${
                isEditing ? 'border-primary' : ''
              }`}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleVisibility}
              className="shrink-0"
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleEditToggle}
              className="shrink-0"
            >
              {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Security Analysis</span>
            <Badge variant="outline" className={getStrengthColor(passwordData.strengthAssessment.level)}>
              {getStrengthIcon(passwordData.strengthAssessment.level)}
              <span className="ml-1 capitalize">{passwordData.strengthAssessment.level.replace('-', ' ')}</span>
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Score</span>
              <span className="font-semibold text-primary">{passwordData.strengthAssessment.score}/100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${getStrengthBarColor(passwordData.strengthAssessment.score)}`}
                style={{ width: `${passwordData.strengthAssessment.score}%` }}
              />
            </div>
          </div>

          {passwordData.strengthAssessment.feedback.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Recommendations</span>
              <ul className="text-xs text-muted-foreground space-y-1">
                {passwordData.strengthAssessment.feedback.slice(0, 2).map((item, feedbackIndex) => (
                  <li key={feedbackIndex} className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            onClick={onSave}
            size="sm"
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
          >
            <Key className="mr-2 h-3 w-3" />
            Save Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
