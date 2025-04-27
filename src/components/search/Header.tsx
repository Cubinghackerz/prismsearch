
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { SearchEngineSettings } from './SearchEngineSettings';
import { SearchEngine } from './types';

interface HeaderProps {
  hasSearched: boolean;
  selectedEngines: SearchEngine[];
  onEngineToggle: (engine: SearchEngine) => void;
  onBackClick: () => void;
}

const Header = ({ hasSearched, selectedEngines, onEngineToggle, onBackClick }: HeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }} 
      className="text-center relative"
    >
      <div className="flex items-center justify-between">
        {hasSearched && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="absolute left-4 top-1/2 -translate-y-1/2"
          >
            <Button 
              variant="ghost" 
              onClick={onBackClick}
              className="text-white bg-transparent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </motion.div>
        )}
        <motion.h1 
          className={`text-4xl font-bold bg-clip-text text-transparent 
          bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 
          animate-gradient-text mb-2 mx-auto ${hasSearched ? 'text-2xl' : ''}`}
        >
          Prism Search
        </motion.h1>
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${!hasSearched ? 'opacity-0' : ''}`}>
          <SearchEngineSettings 
            selectedEngines={selectedEngines}
            onEngineToggle={onEngineToggle}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Header;
