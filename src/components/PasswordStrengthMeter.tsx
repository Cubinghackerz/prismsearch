
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, AlertTriangle, XCircle } from 'lucide-react';
import zxcvbn from 'zxcvbn';

interface PasswordStrengthAssessment {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback: string[];
  crackTime: string;
  entropy: number;
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
    if (!pwd) {
      return {
        score: 0,
        level: 'weak',
        feedback: ['Enter a password to see strength analysis'],
        crackTime: 'instant',
        entropy: 0
      };
    }

    // Use zxcvbn for comprehensive analysis
    const zxcvbnResult = zxcvbn(pwd);
    
    // Convert zxcvbn score (0-4) to our percentage scale (0-100)
    const baseScore = (zxcvbnResult.score / 4) * 100;
    
    // Additional scoring based on our criteria
    let bonusScore = 0;
    const feedback: string[] = [];

    // Length bonus
    if (pwd.length >= 16) bonusScore += 10;
    else if (pwd.length >= 12) bonusScore += 5;
    else if (pwd.length < 8) feedback.push('Password is too short. Use at least 12 characters');

    // Character diversity
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
    
    const charTypes = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
    if (charTypes >= 4) bonusScore += 5;
    else if (charTypes < 3) feedback.push('Use a mix of uppercase, lowercase, numbers, and symbols');

    // Calculate final score
    const finalScore = Math.min(100, Math.round(baseScore + bonusScore));

    // Determine level
    let level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    if (finalScore >= 90) level = 'very-strong';
    else if (finalScore >= 75) level = 'strong';
    else if (finalScore >= 60) level = 'good';
    else if (finalScore >= 40) level = 'fair';
    else level = 'weak';

    // Add zxcvbn feedback
    if (zxcvbnResult.feedback.warning) {
      feedback.unshift(zxcvbnResult.feedback.warning);
    }
    
    zxcvbnResult.feedback.suggestions.forEach(suggestion => {
      if (!feedback.includes(suggestion)) {
        feedback.push(suggestion);
      }
    });

    // Format crack time - ensure it's always a string
    const crackTime = formatCrackTime(String(zxcvbnResult.crack_times_display.offline_slow_hashing_1e4_per_second));

    return {
      score: finalScore,
      level,
      feedback: feedback.slice(0, 5), // Limit to 5 most important suggestions
      crackTime,
      entropy: Math.round(zxcvbnResult.guesses_log10 * 3.32) // Convert log10 to bits
    };
  };

  const formatCrackTime = (crackTime: string): string => {
    if (crackTime.includes('instant')) return 'instant';
    if (crackTime.includes('less than a second')) return '< 1 second';
    if (crackTime.includes('centuries')) return '> 100 years';
    return crackTime;
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
    if (score >= 75) return 'bg-gradient-to-r from-green-500 to-green-400';
    if (score >= 60) return 'bg-gradient-to-r from-cyan-500 to-cyan-400';
    if (score >= 40) return 'bg-gradient-to-r from-amber-500 to-amber-400';
    return 'bg-gradient-to-r from-red-500 to-red-400';
  };

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-200 font-medium text-sm">Password Strength (zxcvbn)</span>
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

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-800/30 rounded p-2">
          <span className="text-slate-400">Crack Time:</span>
          <div className="text-cyan-300 font-medium">{assessment.crackTime}</div>
        </div>
        <div className="bg-slate-800/30 rounded p-2">
          <span className="text-slate-400">Entropy:</span>
          <div className="text-cyan-300 font-medium">{assessment.entropy} bits</div>
        </div>
      </div>

      {assessment.feedback.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm text-slate-200 font-medium">Security Recommendations</span>
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
