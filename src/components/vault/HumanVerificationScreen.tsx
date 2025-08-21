
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, AlertTriangle, RefreshCw, User, Lock, Globe } from 'lucide-react';
import Galaxy from '@/components/Galaxy';

interface HumanVerificationScreenProps {
  onVerificationComplete: () => void;
}

const HumanVerificationScreen: React.FC<HumanVerificationScreenProps> = ({
  onVerificationComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [captchaImages, setCaptchaImages] = useState<number[]>([]);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [verificationProgress, setVerificationProgress] = useState(0);

  const steps = [
    'Initializing Security Protocol...',
    'Scanning Network Environment...',
    'Validating Browser Integrity...',
    'Human Verification Required',
  ];

  // Generate random captcha-like grid
  useEffect(() => {
    const images = Array.from({ length: 9 }, (_, i) => i);
    setCaptchaImages(images);
  }, []);

  // Auto-progress through initial steps
  useEffect(() => {
    if (currentStep < 3) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setVerificationProgress((currentStep + 1) * 25);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleImageClick = (index: number) => {
    setSelectedImages(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate verification process
    setTimeout(() => {
      setVerificationProgress(100);
      setTimeout(() => {
        onVerificationComplete();
      }, 1000);
    }, 2000);
  };

  const isTrafficLight = (index: number) => {
    // Mock logic - some images are "traffic lights"
    return [1, 4, 7].includes(index);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Galaxy Background */}
      <div className="absolute inset-0">
        <Galaxy
          mouseRepulsion={true}
          mouseInteraction={true}
          density={2.0}
          glowIntensity={0.3}
          saturation={0.7}
          hueShift={140}
          transparent={false}
          rotationSpeed={0.1}
          twinkleIntensity={0.3}
          repulsionStrength={2.0}
          speed={2.5}
          starSpeed={1.2}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-6">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8 bg-black/80 backdrop-blur-sm p-6 rounded-xl border border-green-500/30">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/lovable-uploads/3baec192-88ed-42ea-80e5-61f5cfa40481.png" 
                alt="Prism Logo" 
                className="w-12 h-12"
              />
              <h1 className="text-2xl font-bold ml-3 font-fira-code text-green-400">
                PrismVault
              </h1>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-green-400/80">
              <Globe className="w-4 h-4" />
              <span>vault.prismsearch.com</span>
              <Lock className="w-4 h-4" />
            </div>
          </div>

          {currentStep < 3 ? (
            /* Initial Loading Steps */
            <Card className="bg-black/80 backdrop-blur-sm border-green-500/30">
              <CardHeader className="text-center">
                <CardTitle className="text-white font-fira-code flex items-center justify-center">
                  <Shield className="w-5 h-5 mr-2 text-green-400" />
                  Security Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-400 font-fira-code"
                  >
                    {steps[currentStep]}
                  </motion.div>
                  
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-400 to-blue-400"
                        animate={{ width: `${verificationProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="text-xs text-green-400/70 font-fira-code">
                      {Math.round(verificationProgress)}% Complete
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Human Verification Step */
            <Card className="bg-black/80 backdrop-blur-sm border-orange-500/30">
              <CardHeader className="text-center">
                <CardTitle className="text-white font-fira-code flex items-center justify-center">
                  <User className="w-5 h-5 mr-2 text-orange-400" />
                  Human Verification Required
                </CardTitle>
                <p className="text-sm text-orange-300 mt-2">
                  Select all squares with <strong>traffic lights</strong>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Captcha Grid */}
                <div className="grid grid-cols-3 gap-1 bg-gray-900 p-3 rounded-lg">
                  {captchaImages.map((index) => (
                    <button
                      key={index}
                      onClick={() => handleImageClick(index)}
                      className={`
                        aspect-square bg-gradient-to-br from-gray-700 to-gray-800 
                        rounded border-2 transition-all duration-200 flex items-center justify-center
                        ${selectedImages.includes(index) 
                          ? 'border-green-400 bg-green-400/20' 
                          : 'border-gray-600 hover:border-gray-500'
                        }
                      `}
                    >
                      {isTrafficLight(index) ? (
                        <div className="flex flex-col space-y-1">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                      ) : (
                        <div className="w-8 h-6 bg-gray-600 rounded"></div>
                      )}
                      {selectedImages.includes(index) && (
                        <CheckCircle className="absolute w-4 h-4 text-green-400" />
                      )}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleVerify}
                  disabled={isVerifying || selectedImages.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-fira-code"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>

                {isVerifying && (
                  <div className="space-y-2">
                    <div className="text-center text-blue-400 text-sm font-fira-code">
                      Analyzing human behavior patterns...
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-400"
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Security Info */}
          <div className="mt-6 text-center">
            <div className="bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-white/10">
              <div className="flex justify-center space-x-4 text-xs font-fira-code text-white/60">
                <span>SSL Secured</span>
                <span>•</span>
                <span>Bot Protection</span>
                <span>•</span>
                <span>Privacy First</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanVerificationScreen;
