
import React from "react";

const Terminal = () => {
  return (
    <div className="bg-black rounded-lg p-4 min-h-[200px] font-mono text-sm">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-gray-400 ml-4">Terminal</span>
      </div>
      <div className="text-gray-400">
        <div className="mb-2">
          <span className="text-green-400">prism@code</span>
          <span className="text-gray-500">:</span>
          <span className="text-blue-400">~</span>
          <span className="text-gray-500">$</span>
          <span className="ml-2">Terminal functionality coming soon...</span>
        </div>
        <div className="text-gray-600 text-xs mt-4">
          • Interactive shell access
          • Package installation
          • File system operations
          • Environment management
        </div>
        <div className="mt-4 text-yellow-400">
          ⚠️ This feature is under development and will be available in the next beta release.
        </div>
      </div>
    </div>
  );
};

export default Terminal;
