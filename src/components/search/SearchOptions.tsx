
import { motion } from 'framer-motion';
import { engineUrls } from './constants';

const SearchOptions = () => {
  return (
    <div className="flex justify-center space-x-6">
      {Object.keys(engineUrls).slice(0, 5).map(engine => (
        <motion.a
          key={engine}
          href={engineUrls[engine as keyof typeof engineUrls]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center cursor-pointer"
          whileHover={{
            scale: 1.1,
            y: -5
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 10
          }}
        >
          <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center 
            backdrop-blur-md border border-white/10
            ${engine === 'Google' ? 'bg-blue-500/80' : 
              engine === 'Bing' ? 'bg-blue-700/80' : 
              engine === 'DuckDuckGo' ? 'bg-yellow-600/80' : 
              engine === 'Brave' ? 'bg-orange-500/80' : 
              engine === 'Yahoo' ? 'bg-purple-600/80' : 'bg-purple-500/80'} 
            hover:border-white/20 transition-all duration-300
            shadow-lg hover:shadow-xl`}>
            <span className="text-xl font-bold text-white">{engine.charAt(0)}</span>
          </div>
          <span className="text-sm font-medium text-gray-100 opacity-90 hover:opacity-100 transition-opacity">
            {engine}
          </span>
        </motion.a>
      ))}
    </div>
  );
};

export default SearchOptions;
