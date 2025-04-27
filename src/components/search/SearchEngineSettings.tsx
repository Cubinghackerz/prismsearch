
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

const availableEngines = {
  'Google': 'https://www.google.com',
  'Bing': 'https://www.bing.com',
  'DuckDuckGo': 'https://duckduckgo.com',
  'Brave': 'https://search.brave.com',
  'You.com': 'https://you.com',
  'Qwant': 'https://www.qwant.com',
  'Ecosia': 'https://www.ecosia.org',
  'StartPage': 'https://www.startpage.com',
  'Yahoo': 'https://search.yahoo.com',
  'Yandex': 'https://yandex.com'
} as const;

export type SearchEngine = keyof typeof availableEngines;

interface SearchEngineSettingsProps {
  selectedEngines: SearchEngine[];
  onEngineToggle: (engine: SearchEngine) => void;
}

export function SearchEngineSettings({ selectedEngines, onEngineToggle }: SearchEngineSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-purple-500/10 text-purple-300/70 hover:text-purple-200"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#1A1F2C] border border-purple-500/30">
        <DropdownMenuLabel className="text-purple-200">Search Engines</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-purple-500/20" />
        {(Object.keys(availableEngines) as SearchEngine[]).map((engine) => (
          <DropdownMenuItem
            key={engine}
            className={`flex items-center justify-between cursor-pointer text-gray-200 focus:text-white focus:bg-purple-500/20
              ${selectedEngines.includes(engine) ? 'text-purple-300' : 'text-gray-400'}`}
            onClick={() => onEngineToggle(engine)}
          >
            {engine}
            {selectedEngines.includes(engine) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="h-2 w-2 rounded-full bg-purple-500"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { availableEngines };
