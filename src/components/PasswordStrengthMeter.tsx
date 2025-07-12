
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, AlertTriangle, XCircle } from 'lucide-react';

interface PasswordStrengthAssessment {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback: string[];
}

interface PasswordStrengthMeterProps {
  password: string;
  onAssessmentChange?: (assessment: PasswordStrengthAssessment) => void;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  password, 
  onAssessmentChange 
}) => {
  const assessPasswordStrength = (pwd: string): PasswordStrengthAssessment => {
    let score = 0;
    const feedback: string[] = [];

    if (pwd.length >= 12) {
      score += 25;
    } else if (pwd.length >= 8) {
      score += 15;
      feedback.push('Consider using a longer password (12+ characters)');
    } else {
      score += 5;
      feedback.push('Password is too short. Use at least 8 characters');
    }

    if (/[a-z]/.test(pwd)) score += 15;
    else feedback.push('Add lowercase letters');
    
    if (/[A-Z]/.test(pwd)) score += 15;
    else feedback.push('Add uppercase letters');
    
    if (/[0-9]/.test(pwd)) score += 15;
    else feedback.push('Add numbers');
    
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 20;
    else feedback.push('Add special characters');

    if (!/(.)\1{2,}/.test(pwd)) score += 10;
    else feedback.push('Avoid repeating characters');

    let level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    if (score >= 90) level = 'very-strong';
    else if (score >= 70) level = 'strong';
    else if (score >= 50) level = 'good';
    else if (score >= 30) level = 'fair';
    else level = 'weak';

    return { score, level, feedback };
  };

  const assessment = React.useMemo(() => assessPasswordStrength(password), [password]);

  React.useEffect(() => {
    onAssessmentChange?.(assessment);
  }, [assessment, onAssessmentChange]);

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

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-200 font-medium text-sm">Password Strength</span>
        <Badge className={getStrengthColor(assessment.level)}>
          {getStrengthIcon(assessment.level)}
          <span className="ml-1 capitalize">{assessment.level.replace('-', ' ')}</span>
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-300 font-medium">Security Score</span>
          <span className="text-cyan-300 font-semibold">{assessment.score}/100</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getStrengthBarColor(assessment.score)}`} 
            style={{ width: `${assessment.score}%` }} 
          />
        </div>
      </div>

      {assessment.feedback.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm text-slate-200 font-medium">Recommendations</span>
          <ul className="text-sm text-slate-400 space-y-1">
            {assessment.feedback.map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
