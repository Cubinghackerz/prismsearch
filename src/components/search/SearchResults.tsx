@@ .. @@
       <motion.div 
         className="flex items-center justify-between mb-4"
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }} 
         transition={{ duration: 0.4 }}
       >
         <div className="flex items-center gap-2">
           <LayoutGrid className="h-5 w-5 text-prism-primary" />
           <h2 className="text-xl font-semibold text-prism-text font-montserrat">Search Results</h2>
         </div>
        
         <motion.div 
           className="text-sm bg-prism-primary/10 px-3 py-1 rounded-full text-prism-primary border border-prism-border flex items-center gap-2"
           whileHover={{ scale: 1.05 }}
           transition={{ type: "spring", stiffness: 400, damping: 10 }}
         >
@@ .. @@
      
      {/* Filters and controls with improved UI */}
     <motion.div 
        className="bg-prism-primary/10 backdrop-blur-md rounded-lg p-3 mb-4 border border-prism-border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-prism-primary" />
            <span className="text-sm text-prism-text font-medium">Filters:</span>
            
            <div className="flex flex-wrap gap-2 ml-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleFilter(category)}
                  className={`
                    text-xs px-2 py-1 rounded-full border transition-all
                    ${selectedFilters.includes(category) 
                      ? 'bg-prism-primary/30 border-prism-primary/40 text-prism-text'
                      : 'border-prism-border text-prism-text-muted hover:bg-prism-primary/10'}
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
@@ .. @@
          <div className="flex items-center gap-3">
            {/* Added view mode toggle */}
            <div className="flex items-center bg-prism-surface/30 rounded-md overflow-hidden border border-prism-border">
              <button
                onClick={() => setViewMode('grid')}
                className={`text-xs px-3 py-1.5 flex items-center gap-1
                  ${viewMode === 'grid' ? 'bg-prism-primary/30 text-prism-text' : 'text-prism-text-muted hover:bg-prism-primary/10'}`}
              >
                <LayoutGrid className="h-3 w-3" />
                <span className="hidden sm:inline">Grid</span>
              </button>
@@ .. @@
              <button
                onClick={() => setViewMode('list')}
                className={`text-xs px-3 py-1.5 flex items-center gap-1
                  ${viewMode === 'list' ? 'bg-prism-primary/30 text-prism-text' : 'text-prism-text-muted hover:bg-prism-primary/10'}`}
              >
                <List className="h-3 w-3" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
@@ .. @@
           
            <div className="flex items-center gap-2">
              <span className="text-sm text-prism-text">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'relevance' | 'recent')}
                className="text-xs bg-prism-surface/20 border border-prism-border rounded px-2 py-1 text-prism-text"
              >
                <option value="relevance">Relevance</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
@@ .. @@
           
            <button 
              className="text-xs flex items-center gap-1 text-prism-primary hover:text-prism-primary-light bg-prism-surface/30 px-2 py-1 rounded-md border border-prism-border hover:bg-prism-primary/20 transition-colors"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </motion.div>
@@ .. @@
         let bgColor;
        let hoverBorderColor;
        
        // Optimized engine selection with lookup table
        const engineMap = {
          'Google': {
            results: googleResults,
            bgColor: 'bg-prism-primary',
            hoverBorderColor: 'hover:border-prism-primary-light'
          },
          'Bing': {
            results: bingResults,
            bgColor: 'bg-prism-primary-dark',
            hoverBorderColor: 'hover:border-prism-primary'
          },
          'DuckDuckGo': {
            results: duckduckgoResults,
            bgColor: 'bg-prism-accent',
            hoverBorderColor: 'hover:border-prism-accent-light'
          },
          'Brave': {
            results: braveResults,
            bgColor: 'bg-prism-accent-dark',
            hoverBorderColor: 'hover:border-prism-accent'
          },
          'You.com': {
            results: youResults,
            bgColor: 'bg-cyan-500',
            hoverBorderColor: 'hover:border-cyan-400'
          }
        };
        
        const engineData = engineMap[engine] || {
          results: [],
          bgColor: 'bg-prism-primary',
          hoverBorderColor: 'hover:border-prism-primary-light'
        }
        
        engineResults = engineData.results;
        bgColor = engineData.bgColor;
        hoverBorderColor = engineData.hoverBorderColor;
        
        const isCollapsed = collapsedEngines[engine];
        
        return (
@@ .. @@
            <div 
              className={`flex justify-between items-center px-3 py-2 rounded-t-lg ${bgColor} cursor-pointer`}
              onClick={() => toggleEngine(engine)}
              style={{ willChange: 'transform' }}
            >
              <h3 className="text-white font-medium text-sm font-montserrat" style={{ willChange: 'transform' }}>{engine}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 px-1.5 rounded-full text-white">
                  {engineResults.length}
                </span>
              </div>
            </div>
          </div>
        );