
import { motion } from 'framer-motion';
import { SearchResult } from './types';
import SearchResultCard from './SearchResultCard';

interface SearchEngineColumnProps {
  title: string;
  results: SearchResult[];
  bgColor: string;
  hoverBorderColor: string;
}

// Define logo URLs for each search engine with updated images
const engineLogos: Record<string, string> = {
  'Google': '/lovable-uploads/616c674a-121c-4474-bc2d-a9606bc729a0.png',
  'Bing': '/lovable-uploads/d1b1c7b4-acea-4a6a-a7ac-86e12c8be0c2.png',
  'DuckDuckGo': 'https://duckduckgo.com/assets/logo_header.v108.svg',
  'Brave': 'https://brave.com/static-assets/images/brave-logo-sans-text.svg',
  'You.com': '/lovable-uploads/3f6bf968-0fd9-4357-bc92-b18c07666134.png'
};

const SearchEngineColumn = ({ title, results, bgColor, hoverBorderColor }: SearchEngineColumnProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-purple-900/10 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}>
            <img
              src={engineLogos[title] || ''}
              alt={`${title} logo`}
              className="w-5 h-5 object-contain"
              onError={(e) => {
                // Fallback to first letter if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML += `<span class="text-white font-bold">${title[0]}</span>`;
              }}
            />
          </div>
          <h3 className="text-lg font-semibold text-purple-100">{title}</h3>
        </div>
        <div className="text-sm text-purple-300">
          {results.length} {results.length === 1 ? 'Result' : 'Results'}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, index) => (
            <SearchResultCard
              key={result.id}
              result={result}
              index={index}
              hoverBorderColor={hoverBorderColor}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-purple-300">
          No results from {title}
        </div>
      )}
    </motion.div>
  );
};

export default SearchEngineColumn;
