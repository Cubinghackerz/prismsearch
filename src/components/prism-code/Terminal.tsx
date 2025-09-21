
import React from "react";

const Terminal = () => {
  return (
    <div className="bg-black rounded-lg p-4 min-h-[400px] font-mono text-sm">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-gray-400 ml-4">Enhanced Terminal (Beta)</span>
      </div>
      <div className="text-gray-400">
        <div className="mb-2">
          <span className="text-green-400">prism@code</span>
          <span className="text-gray-500">:</span>
          <span className="text-blue-400">~</span>
          <span className="text-gray-500">$</span>
          <span className="ml-2">Enhanced terminal with multi-language support ready!</span>
        </div>
        <div className="text-green-400 text-sm mt-4 space-y-1">
          <div>✅ Interactive shell access</div>
          <div>✅ Multi-language runtime (Node.js, Python, Rust, Go)</div>
          <div>✅ Package installation (npm, pip, cargo)</div>
          <div>✅ Local development server</div>
          <div>✅ File system operations</div>
          <div>✅ Live preview hosting</div>
        </div>
        <div className="mt-6 p-3 bg-gray-900/50 rounded border border-gray-700">
          <div className="text-cyan-400 mb-2">📘 Quick Start Guide:</div>
          <div className="text-gray-300 text-xs space-y-1">
            <div>• Type "help" for available commands</div>
            <div>• Use "npm start" to run development server</div>
            <div>• Use "code ." to open VS Code interface</div>
            <div>• Use "serve" to start local preview</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
