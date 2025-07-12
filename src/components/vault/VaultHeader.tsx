import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Lock } from 'lucide-react';
export const VaultHeader: React.FC = () => {
  return <>
      {/* Navigation */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors group">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <Link to="/" className="flex items-center text-slate-400 hover:text-slate-300 transition-colors">
            <Home className="h-5 w-5 mr-2" />
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="relative">
            <Lock className="h-12 w-12 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Prism Vault
          </h1>
        </div>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto my-[10px] py-[5px]">
          Advanced password generation with military-grade encryption analysis
        </p>
      </div>
    </>;
};