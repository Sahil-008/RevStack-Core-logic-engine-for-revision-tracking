import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Layers, 
  Network, 
  FileCode2, 
  Archive,
  ArrowRight,
  Workflow,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface TechItem {
  title: string;
  category: string;
  description: string;
  complexity: string;
  role: string;
}

export const Architecture: React.FC = () => {
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);

  const layers = [
    {
      id: 1,
      title: "Frontend UI Layer",
      icon: Cpu,
      color: "#2CE6FF", // Cyan
      details: "React single-page dashboard built using TypeScript and Tailwind CSS, featuring SVG renderings of commit DAGs, state timeline controllers, and custom visual stack displays.",
      cppLink: "Interacts via JSON-serialized snapshots of the local VCS engine state."
    },
    {
      id: 2,
      title: "Repository Manager",
      icon: Layers,
      color: "#8A5CFF", // Purple
      details: "The RevStack central engine. Directs pointers, controls checkout branch switches, coordinates file restoration, and handles file additions and commits.",
      cppLink: "Implements the RevStack class defined in RevStack.h and RevStack.cpp."
    },
    {
      id: 3,
      title: "Commit Graph DAG",
      icon: Network,
      color: "#FF6B00", // Orange
      details: "Directed Acyclic Graph modeling version history. Connects commits to multiple parent nodes, supporting branch forkings and merge merges.",
      cppLink: "Stored in std::unordered_map<string, Commit*> and tracked using Commit vector pointers."
    },
    {
      id: 4,
      title: "Working Directory",
      icon: FileCode2,
      color: "#2CE6FF", // Cyan
      details: "Temporary staging map representing the active workspace files. Can be added to, modified, and committed to generate snapshots.",
      cppLink: "Implemented as std::unordered_map<string, string> mapped to file content keys."
    },
    {
      id: 5,
      title: "Commit Snapshots",
      icon: Archive,
      color: "#FFFFFF", // White
      details: "Immutable records of the working directory stored at commit times, keeping history isolated and safe from subsequent changes.",
      cppLink: "Instantiated as Commit class objects containing static maps of files."
    }
  ];

  const techItems: TechItem[] = [
    {
      title: "C++ Engine",
      category: "Language",
      description: "Low-level system efficiency utilizing fast raw pointers and direct memory allocations for zero-overhead repository operations.",
      complexity: "Memory: O(N * M)",
      role: "Implements the core VCS logic engine, managing heaps, stack buffers, and data structures."
    },
    {
      title: "STL Containers",
      category: "Framework",
      description: "Standard Template Library data layout abstractions like std::unordered_map and std::vector for robust, optimized data structures.",
      complexity: "Time: O(1) avg lookups",
      role: "Provides high-performance lists, arrays, and hashing functions out of the box."
    },
    {
      title: "Hash Maps",
      category: "Data Structure",
      description: "std::unordered_map mapping filename strings to content strings, and commit ID strings to Commit node pointer locations.",
      complexity: "Lookup: O(1) / O(log N)",
      role: "Performs instant lookup for file contents and commit pointers in history."
    },
    {
      title: "Undo/Redo Stacks",
      category: "State Control",
      description: "std::stack elements storing pointer histories of HEAD states. Pushing and popping enables instant timeline scrubbing.",
      complexity: "Time: O(1) push/pop",
      role: "Tracks chronological forward and backward navigation paths without data duplication."
    },
    {
      title: "Raw Pointers",
      category: "Memory",
      description: "Heap-allocated addresses referencing memory nodes. Models parent connections and branch HEAD cursors directly.",
      complexity: "Size: 8 bytes (64-bit)",
      role: "Establishes structural graph connections between parent commits and branches."
    },
    {
      title: "Directed Acyclic Graphs",
      category: "Structure Model",
      description: "DAG graph modeling commit histories. Supports multiple parents for merge tracking, avoiding cyclical loops.",
      complexity: "Depth: O(D) traversals",
      role: "Tells the story of the codebase timeline, representing splits and merges."
    }
  ];

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden border-t border-glass-border px-4 md:px-8">
      {/* Background radial glows */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full flex flex-col space-y-20">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white font-sans uppercase">
            System <span className="text-primary">Architecture</span> & Tech Stack
          </h2>
          <p className="text-sm text-neutral-400 font-light mt-2 leading-relaxed">
            Discover the structural hierarchy of RevStack and the low-level C++ paradigms that make the engine lightning fast.
          </p>
        </div>

        {/* Architecture Flow Diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Vertical flow diagram (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs text-neutral-500 font-mono uppercase tracking-widest mb-2 flex items-center">
              <Workflow className="w-4 h-4 text-cyanAccent mr-2" /> Data Flow Layers
            </div>
            
            <div className="flex flex-col space-y-3 relative">
              {layers.map((layer, index) => {
                const LayerIcon = layer.icon;
                const isHovered = hoveredLayer === index;

                return (
                  <div key={layer.id} className="relative">
                    <motion.div
                      onMouseEnter={() => setHoveredLayer(index)}
                      onMouseLeave={() => setHoveredLayer(null)}
                      className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300 ${isHovered ? 'bg-neutral-900 border-neutral-700 shadow-md scale-[1.02]' : 'bg-neutral-950/60 border-glass-border'}`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div 
                          className="p-2.5 rounded-lg bg-neutral-900 border"
                          style={{ borderColor: `${layer.color}33`, color: layer.color }}
                        >
                          <LayerIcon className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-xs font-bold text-neutral-200">
                          {layer.title}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-600" />
                    </motion.div>
                    
                    {index < layers.length - 1 && (
                      <div className="flex justify-center my-1.5">
                        <ArrowRight className="w-4 h-4 text-neutral-800 transform rotate-90" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Card (7 cols) */}
          <div className="lg:col-span-7 h-[380px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {hoveredLayer !== null ? (
                <motion.div
                  key={hoveredLayer}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full p-8 rounded-xl border border-glass-border bg-neutral-900/30 backdrop-blur-md flex flex-col justify-between h-full font-mono text-xs shadow-glass-card"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: layers[hoveredLayer].color }}
                      />
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        {layers[hoveredLayer].title}
                      </h4>
                    </div>

                    <div>
                      <span className="text-neutral-500 text-[10px] uppercase tracking-widest block mb-1">Layer Description</span>
                      <p className="text-neutral-300 font-sans text-xs leading-relaxed font-light">
                        {layers[hoveredLayer].details}
                      </p>
                    </div>

                    <div className="bg-black/40 border border-glass-border p-3.5 rounded-lg space-y-1">
                      <span className="text-neutral-500 text-[10px] uppercase tracking-widest block">C++ Engine Equivalence</span>
                      <p className="text-primary text-[11px] font-semibold">
                        {layers[hoveredLayer].cppLink}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-neutral-500 italic mt-6 border-t border-glass-border/30 pt-3">
                    Hover other layers in the diagram to inspect properties
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full p-8 rounded-xl border border-glass-border/50 bg-neutral-950/20 flex flex-col items-center justify-center text-center h-full border-dashed"
                >
                  <Sparkles className="w-10 h-10 text-primary mb-4 animate-pulse" />
                  <h4 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    Data Flow Inspector
                  </h4>
                  <p className="text-xs text-neutral-500 font-light max-w-sm mt-2">
                    Hover any layer on the left diagram to view detailed structural explanations, data models, and memory layouts.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Tech Stack Section */}
        <div className="space-y-6">
          <div className="text-xs text-neutral-500 font-mono uppercase tracking-widest flex items-center">
            <FileCode2 className="w-4 h-4 text-primary mr-2" /> Core Engine Paradigms
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techItems.map((tech) => (
              <motion.div
                key={tech.title}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="glass-panel glass-panel-hover rounded-xl p-6 flex flex-col justify-between h-[180px] bg-neutral-900/30"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h5 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      {tech.title}
                    </h5>
                    <span className="text-[9px] bg-white/5 border border-glass-border text-neutral-500 px-2 py-0.5 rounded font-mono">
                      {tech.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-light font-sans leading-relaxed">
                    {tech.description}
                  </p>
                </div>

                <div className="border-t border-glass-border/40 pt-2.5 flex justify-between items-center text-[10px] font-mono">
                  <span className="text-neutral-500 truncate max-w-[120px]">{tech.role}</span>
                  <span className="text-cyanAccent font-semibold shrink-0">{tech.complexity}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
