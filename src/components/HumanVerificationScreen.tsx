
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Shield, CheckCircle, AlertTriangle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HumanVerificationScreenProps {
  onVerificationComplete: () => void;
  title?: string;
}

const HumanVerificationScreen: React.FC<HumanVerificationScreenProps> = ({
  onVerificationComplete,
  title = "HUMAN VERIFICATION REQUIRED"
}) => {
  const [verificationStep, setVerificationStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [captchaImages, setCaptchaImages] = useState<number[]>([]);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Generate random captcha pattern
    const randomImages = Array.from({ length: 9 }, (_, i) => Math.floor(Math.random() * 3));
    setCaptchaImages(randomImages);
  }, []);

  useEffect(() => {
    if (verificationStep === 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setVerificationStep(1), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [verificationStep]);

  const handleImageClick = (index: number) => {
    if (selectedImages.includes(index)) {
      setSelectedImages(prev => prev.filter(i => i !== index));
    } else {
      setSelectedImages(prev => [...prev, index]);
    }
  };

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate verification process
    setTimeout(() => {
      setVerificationStep(2);
      setTimeout(() => {
        onVerificationComplete();
      }, 1500);
    }, 2000);
  };

  if (verificationStep === 2) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-fira-code">
              VERIFICATION SUCCESSFUL
            </h2>
            <p className="text-green-400 font-fira-code">
              Human identity confirmed. Redirecting...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-6">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-blue-500/50">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white font-fira-code tracking-wider">
              {title}
            </h1>
          </div>

          {verificationStep === 0 && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm font-fira-code">
                  Initializing security protocols...
                </p>
              </div>
              <div className="space-y-2">
                <Progress value={progress} className="h-2 bg-slate-800" />
                <div className="text-xs text-slate-500 text-center font-fira-code">
                  {Math.round(progress)}% Complete
                </div>
              </div>
              <div className="flex justify-center space-x-4 text-xs text-blue-400/70 font-fira-code">
                <span>SSL Secure</span>
                <span>•</span>
                <span>Bot Protection</span>
                <span>•</span>
                <span>Privacy Shield</span>
              </div>
            </div>
          )}

          {verificationStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-orange-400" />
                  <p className="text-orange-400 text-sm font-fira-code font-semibold">
                    SELECT ALL TRAFFIC LIGHTS
                  </p>
                </div>
                <p className="text-slate-500 text-xs font-fira-code">
                  Click on each image containing a traffic light
                </p>
              </div>

              {/* CAPTCHA Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-800 p-4 rounded-lg">
                {captchaImages.map((imageType, index) => (
                  <div
                    key={index}
                    onClick={() => handleImageClick(index)}
                    className={`
                      aspect-square bg-slate-700 rounded cursor-pointer border-2 transition-all
                      ${selectedImages.includes(index) 
                        ? 'border-orange-400 bg-orange-400/20' 
                        : 'border-slate-600 hover:border-slate-500'
                      }
                      flex items-center justify-center text-2xl
                    `}
                  >
                    {imageType === 0 && '🚦'}
                    {imageType === 1 && '🏢'}
                    {imageType === 2 && '🚗'}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const randomImages = Array.from({ length: 9 }, (_, i) => Math.floor(Math.random() * 3));
                    setCaptchaImages(randomImages);
                    setSelectedImages([]);
                  }}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                  size="sm"
                >
                  🔄 New Challenge
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={selectedImages.length === 0 || isVerifying}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    '✓ Verify'
                  )}
                </Button>
              </div>

              {/* Warning */}
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 p-3 rounded border border-amber-400/30">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-fira-code">
                  This verification protects against automated attacks
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HumanVerificationScreen;
