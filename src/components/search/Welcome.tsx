
import { motion } from 'framer-motion';
import SearchOptions from './SearchOptions';

const Welcome = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ delay: 0.5, duration: 0.5 }} 
      className="mt-20 text-center"
    >
      <SearchOptions />
      <motion.p 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.7 }} 
        className="mt-12 text-gray-400"
      >
        Type your query above to search across all engines simultaneously
      </motion.p>
    </motion.div>
  );
};

export default Welcome;
