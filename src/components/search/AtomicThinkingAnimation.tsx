
import React from 'react';
import { motion } from 'framer-motion';

const AtomicThinkingAnimation = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="relative w-32 h-32 flex justify-center items-center">
        {/* Rotating container */}
        <motion.div
          className="relative w-24 h-24 flex justify-center items-center"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Nucleus */}
          <motion.div
            className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-prism-primary to-prism-accent"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              boxShadow: '0 0 20px rgba(0, 194, 168, 0.6)'
            }}
          />
          
          {/* Electron orbit 1 */}
          <motion.div
            className="absolute w-24 h-12 rounded-full border-2 border-prism-accent/60"
            animate={{
              rotate: 360,
              borderColor: [
                'rgba(0, 194, 168, 0.6)',
                'rgba(0, 194, 168, 0.2)',
                'rgba(0, 194, 168, 0.6)'
              ]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              borderRightColor: 'transparent'
            }}
          >
            {/* Electron 1 */}
            <motion.div
              className="absolute w-2 h-2 bg-prism-accent rounded-full"
              style={{
                top: '60%',
                left: '100%',
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                top: ['60%', '100%', '60%', '0%', '60%'],
                left: ['100%', '60%', '0%', '60%', '100%']
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
          
          {/* Electron orbit 2 */}
          <motion.div
            className="absolute w-24 h-12 rounded-full border-2 border-prism-primary-light/60"
            style={{ transform: 'rotate(60deg)' }}
            animate={{
              rotate: [60, 420],
              borderColor: [
                'rgba(102, 255, 204, 0.6)',
                'rgba(102, 255, 204, 0.2)',
                'rgba(102, 255, 204, 0.6)'
              ]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
              delay: -0.66
            }}
            style={{
              transform: 'rotate(60deg)',
              borderBottomColor: 'transparent'
            }}
          >
            {/* Electron 2 */}
            <motion.div
              className="absolute w-2 h-2 bg-prism-primary-light rounded-full"
              style={{
                top: '60%',
                left: '100%',
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                top: ['60%', '100%', '60%', '0%', '60%'],
                left: ['100%', '60%', '0%', '60%', '100%']
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
                delay: -0.66
              }}
            />
          </motion.div>
          
          {/* Electron orbit 3 */}
          <motion.div
            className="absolute w-24 h-12 rounded-full border-2 border-prism-accent-light/60"
            style={{ transform: 'rotate(-60deg)' }}
            animate={{
              rotate: [-60, 300],
              borderColor: [
                'rgba(153, 255, 204, 0.6)',
                'rgba(153, 255, 204, 0.2)',
                'rgba(153, 255, 204, 0.6)'
              ]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              transform: 'rotate(-60deg)',
              borderLeftColor: 'transparent'
            }}
          >
            {/* Electron 3 */}
            <motion.div
              className="absolute w-2 h-2 bg-prism-accent-light rounded-full"
              style={{
                top: '60%',
                left: '100%',
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                top: ['60%', '100%', '60%', '0%', '60%'],
                left: ['100%', '60%', '0%', '60%', '100%']
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AtomicThinkingAnimation;
