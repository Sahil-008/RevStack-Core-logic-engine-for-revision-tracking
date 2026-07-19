import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Database, Hash, GitBranch, ArrowRight } from 'lucide-react';
import { ReactFlowMemoryGraph } from './ReactFlowMemoryGraph';

interface DataVisualizerProps {
  vcsState: any;
}

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ vcsState }) => {
  const [activeTab, setActiveTab] = useState<'table' | 'flow'>('flow');

  if (!vcsState) return null;

  const { workingDirectory, commitMap, undoStack, redoStack, branches, currentBranchName } = vcsState;

  // Render Undo/Redo Stacks
  const renderStack = (title: string, stackIds: string[], accentColor: string, emptyMessage: string) => {
    return (
      <div className="bg-neutral-900/40 border border-glass-border rounded-xl p-6 flex flex-col h-[280px]">
        <div className="flex items-center space-x-2 border-b border-glass-border pb-3 mb-4">
          <Layers className="w-4 h-4" style={{ color: accentColor }} />
          <h4 className="text-xs font-mono tracking-wider font-semibold text-neutral-300 uppercase">{title}</h4>
          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-mono text-neutral-500">
            std::stack&lt;Commit*&gt;
          </span>
        </div>

        <div className="flex-1 flex flex-col-reverse justify-start overflow-y-auto space-y-2 space-y-reverse">
          <AnimatePresence initial={false}>
            {stackIds.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center text-xs text-neutral-600 italic font-mono text-center"
              >
                {emptyMessage}
              </motion.div>
            ) : (
              stackIds.map((cId, idx) => {
                const commit = commitMap[cId];
                return (
                  <motion.div
                    key={`${cId}-${idx}`}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="p-3 bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 rounded-lg flex items-center justify-between font-mono text-xs shadow-md"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                      <span className="text-white font-bold">{cId}</span>
                      <span className="text-neutral-500">|</span>
                      <span className="text-neutral-400 truncate max-w-[120px]">
                        {commit ? commit.message : "Commit"}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-600 font-semibold uppercase">
                      Index {idx}
                    </span>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden border-t border-glass-border px-4 md:px-8">
      {/* Glow Backdrops */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-purpleAccent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full flex flex-col space-y-12">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white font-sans uppercase">
            Data Structure <span className="text-primary">Visualizer</span>
          </h2>
          <p className="text-sm text-neutral-400 font-light mt-2 leading-relaxed">
            See how memory structures align. The CLI operations push to C++ stacks, assign pointers, and hash files dynamically in the browser sandbox.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center">
          <div className="bg-neutral-950/80 border border-glass-border p-1.5 rounded-xl flex space-x-1.5 font-mono text-xs shadow-lg">
            <button
              onClick={() => setActiveTab('flow')}
              className={`px-6 py-2 rounded-lg font-semibold tracking-wider uppercase transition-all duration-300 ${
                activeTab === 'flow'
                  ? 'bg-primary text-black shadow-glow-primary'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Interactive Memory DAG
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-6 py-2 rounded-lg font-semibold tracking-wider uppercase transition-all duration-300 ${
                activeTab === 'table'
                  ? 'bg-primary text-black shadow-glow-primary'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              C++ STL Containers
            </button>
          </div>
        </div>

        {activeTab === 'flow' ? (
          <div className="h-[550px] w-full bg-neutral-950/40 border border-glass-border rounded-2xl overflow-hidden relative shadow-glass-card">
            <ReactFlowMemoryGraph vcsState={vcsState} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderStack("Undo Stack", undoStack, "#FF6B00", "Undo stack empty. Commiting files pushes to this stack.")}
              {renderStack("Redo Stack", redoStack, "#2CE6FF", "Redo stack empty. Undoing a commit pushes to this stack.")}
            </div>

            {/* Middle row: Maps */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Working Directory Hash Map */}
              <div className="lg:col-span-5 bg-neutral-900/40 border border-glass-border rounded-xl p-6 flex flex-col h-[320px]">
                <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-purpleAccent" />
                    <h4 className="text-xs font-mono tracking-wider font-semibold text-neutral-300 uppercase">Working Directory Snapshot</h4>
                  </div>
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-mono text-neutral-500">
                    std::unordered_map&lt;string, string&gt;
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                  {Object.keys(workingDirectory).length === 0 ? (
                    <div className="h-full flex items-center justify-center text-neutral-600 italic">
                      Working directory empty.
                    </div>
                  ) : (
                    Object.entries(workingDirectory).map(([filename, content]) => (
                      <div 
                        key={filename}
                        className="p-3 bg-neutral-950/60 border border-glass-border rounded-lg flex flex-col space-y-1.5"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-cyanAccent font-semibold">{filename}</span>
                          <span className="text-[9px] bg-white/5 text-neutral-500 px-1.5 py-0.5 rounded">
                            Hash: {Math.floor((content as string).length * 997).toString(16).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate bg-black/40 p-1 px-2 rounded">
                          {content as string}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Commit Pointer List (Commit Map) */}
              <div className="lg:col-span-7 bg-neutral-900/40 border border-glass-border rounded-xl p-6 flex flex-col h-[320px]">
                <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-cyanAccent" />
                    <h4 className="text-xs font-mono tracking-wider font-semibold text-neutral-300 uppercase">Commit Node Pool (Map)</h4>
                  </div>
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-mono text-neutral-500">
                    std::unordered_map&lt;string, Commit*&gt;
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-mono text-xs">
                  {Object.keys(commitMap).length === 0 ? (
                    <div className="h-full flex items-center justify-center text-neutral-600 italic">
                      No commits initialized.
                    </div>
                  ) : (
                    Object.values(commitMap).map((commit: any) => {
                      const isCurrentHead = commit.id === vcsState.headId;
                      return (
                        <div 
                          key={commit.id}
                          className={`p-3 bg-neutral-950/60 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isCurrentHead ? 'border-primary/45 shadow-glow-primary/5 bg-primary/5' : 'border-glass-border'}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white">{commit.id}</span>
                              <span className="text-neutral-500">|</span>
                              <span className="text-neutral-300 font-sans">{commit.message}</span>
                              {isCurrentHead && (
                                <span className="text-[8px] bg-primary text-black font-semibold px-1 rounded">
                                  HEAD
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-[10px] text-neutral-500">
                              <span>Parents: [{commit.parents.join(", ") || "None"}]</span>
                              <span>Snapshot: {Object.keys(commit.files).length} files</span>
                            </div>
                          </div>

                          <div className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-1 rounded select-all self-start sm:self-center">
                            Ptr: 0x{Math.floor(parseInt(commit.id) * 65536).toString(16).toUpperCase()}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Bottom row: Branches LinkedList */}
            <div className="bg-neutral-900/40 border border-glass-border rounded-xl p-6">
              <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-6">
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-mono tracking-wider font-semibold text-neutral-300 uppercase">Branch Head Pointers (Linked List)</h4>
                </div>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-mono text-neutral-500">
                  Branch Struct List
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 py-4 font-mono text-xs">
                {branches.map((branch: any, idx: number) => {
                  const isActive = branch.name === currentBranchName;
                  return (
                    <React.Fragment key={branch.name}>
                      {idx > 0 && <ArrowRight className="w-4 h-4 text-neutral-700 shrink-0" />}
                      
                      <div 
                        className={`p-4 rounded-xl border flex flex-col space-y-1.5 shrink-0 ${isActive ? 'bg-primary/5 border-primary/40 shadow-glow-primary/5' : 'bg-neutral-950/60 border-glass-border'}`}
                      >
                        <div className="flex justify-between items-center space-x-6">
                          <span className={`font-bold text-sm ${isActive ? 'text-primary' : 'text-neutral-300'}`}>
                            {branch.name}
                          </span>
                          {isActive && (
                            <span className="text-[8px] bg-primary text-black font-semibold px-1 rounded animate-pulse">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 flex flex-col">
                          <span>Head Ptr: {branch.headId ? `Commit (0x${(parseInt(branch.headId) * 65536).toString(16).toUpperCase()})` : "nullptr"}</span>
                          <span>Next Ptr: {idx < branches.length - 1 ? `Branch (0x${((idx + 1) * 2048).toString(16).toUpperCase()})` : "nullptr"}</span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>
    </section>
  );
};
