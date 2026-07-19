import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  File, 
  Terminal, 
  ChevronRight, 
  ChevronDown, 
  Undo2, 
  Redo2, 
  GitCommit, 
  GitBranch, 
  RotateCcw, 
  Search,
  BookOpen,
  CornerDownRight,
  Info
} from 'lucide-react';
import { RevStackEngine } from '../engine/RevStackEngine';

// Import raw source files for explorer pre-population
import branchH from '../../core/Branch.h?raw';
import commitH from '../../core/Commit.h?raw';
import commitCpp from '../../core/Commit.cpp?raw';
import revStackH from '../../core/RevStack.h?raw';
import revStackCpp from '../../core/RevStack.cpp?raw';
import mainCpp from '../../core/main.cpp?raw';
import readmeMd from '../../README.md?raw';

interface WorkspaceProps {
  onStateChange: (snapshot: any) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ onStateChange }) => {
  // Engine Instance
  const engineRef = useRef(new RevStackEngine());
  
  // States
  const [snapshot, setSnapshot] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<string>('README.md');
  const [explorerOpen, setExplorerOpen] = useState({ core: true, root: true });
  
  // Terminal inputs/logs
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Welcome to Warp RevStack Terminal v1.0.0",
    "Type 'help' to list available C++ Version Control commands.",
    "Initial repository pre-populated with C++ Core Engine Source Files."
  ]);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // History states array for timeline scrub
  const [historyStates, setHistoryStates] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedCommit, setSelectedCommit] = useState<any>(null);

  // Load and pre-populate engine on mount
  useEffect(() => {
    const engine = engineRef.current;
    
    // Add raw files
    engine.addFile("Branch.h", branchH);
    engine.addFile("Commit.h", commitH);
    engine.addFile("Commit.cpp", commitCpp);
    engine.addFile("RevStack.h", revStackH);
    engine.addFile("RevStack.cpp", revStackCpp);
    engine.addFile("main.cpp", mainCpp);
    engine.addFile("README.md", readmeMd);
    
    // Initial commits
    engine.commit("Initial commit with core VCS structure");
    engine.addFile("main.cpp", mainCpp + "\n// Powered by RevStack C++ Engine");
    engine.commit("Add developer signature to main entry point");
    
    const initialSnap = engine.getSnapshot();
    setSnapshot(initialSnap);
    onStateChange(initialSnap);
    
    // Set up history tracking
    setHistoryStates([initialSnap]);
    setHistoryIndex(0);
  }, []);

  // Sync scroll on new terminal output
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Sync parent state
  const updateSnapshot = (newSnap: any) => {
    setSnapshot(newSnap);
    onStateChange(newSnap);
    
    // Save to history tracking if we are at the end
    if (historyIndex === historyStates.length - 1) {
      setHistoryStates(prev => [...prev, newSnap]);
      setHistoryIndex(prev => prev + 1);
    } else {
      // Overwrite future history if we modified from a past state
      const sliced = historyStates.slice(0, historyIndex + 1);
      setHistoryStates([...sliced, newSnap]);
      setHistoryIndex(sliced.length);
    }
  };

  // Command handler
  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    setTerminalLogs(prev => [...prev, `MiniGit > ${cmdStr}`]);
    const engine = engineRef.current;
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    
    let response = "";

    switch (cmd) {
      case "help":
        response = `Available Commands:
  add <filename> <content>   : Adds/updates a file in working directory
  commit <message>           : Commits current working directory snapshot
  undo                       : Rewinds HEAD to previous commit using stack
  redo                       : Restores HEAD forward from redo stack
  log                        : Prints the commit DAG history log
  branch <branch_name>       : Creates a new branch from current head
  switch <branch_name>       : Switches active branch and restores working directory
  merge <branch_name>        : Merges specified branch into active branch
  revert <commit_id>         : Creates a new commit restoring a target's parent files
  exit                       : Exits MiniGit simulation`;
        setTerminalLogs(prev => [...prev, ...response.split('\n')]);
        break;

      case "add":
        if (parts.length < 3) {
          response = "Usage: add <filename> <content>";
        } else {
          const filename = parts[1];
          const content = parts.slice(2).join(" ");
          response = engine.addFile(filename, content);
        }
        setTerminalLogs(prev => [...prev, response]);
        break;

      case "commit":
        if (parts.length < 2) {
          response = "Usage: commit <message>";
        } else {
          const message = parts.slice(1).join(" ");
          response = engine.commit(message);
        }
        setTerminalLogs(prev => [...prev, response]);
        break;

      case "undo":
        response = engine.undo();
        setTerminalLogs(prev => [...prev, response]);
        break;

      case "redo":
        response = engine.redo();
        setTerminalLogs(prev => [...prev, response]);
        break;

      case "log":
        const logs = engine.log();
        setTerminalLogs(prev => [...prev, ...logs]);
        break;

      case "branch":
        if (parts.length < 2) {
          response = "Usage: branch <branch_name>";
        } else {
          response = engine.createBranch(parts[1]);
        }
        setTerminalLogs(prev => [...prev, response]);
        break;

      case "switch":
        if (parts.length < 2) {
          response = "Usage: switch <branch_name>";
        } else {
          response = engine.switchBranch(parts[1]);
        }
        setTerminalLogs(prev => [...prev, response]);
        break;

      case "merge":
        if (parts.length < 2) {
          response = "Usage: merge <branch_name>";
        } else {
          response = engine.merge(parts[1]);
        }
        setTerminalLogs(prev => [...prev, response]);
        break;

      case "revert":
        if (parts.length < 2) {
          response = "Usage: revert <commit_id>";
        } else {
          response = engine.revert(parts[1]);
        }
        setTerminalLogs(prev => [...prev, response]);
        break;

      case "exit":
        response = "Exiting MiniGit simulation... Resetting repo.";
        setTerminalLogs(prev => [...prev, response]);
        // Reinitialize
        engineRef.current = new RevStackEngine();
        const fresh = engineRef.current.getSnapshot();
        updateSnapshot(fresh);
        return;

      default:
        response = `Invalid command: '${cmd}'. Type 'help' to see available commands.`;
        setTerminalLogs(prev => [...prev, response]);
    }

    // Refresh state snapshot
    const nextSnap = engine.getSnapshot();
    updateSnapshot(nextSnap);
    setTerminalInput('');
  };

  // Timeline Scrub handler
  const handleTimelineScrub = (idx: number) => {
    setHistoryIndex(idx);
    const targetState = historyStates[idx];
    
    // Load state back into the C++ engine simulation
    engineRef.current.loadState(
      targetState.workingDirectory,
      targetState.commitMap,
      targetState.headId,
      targetState.currentBranchName,
      targetState.branches,
      targetState.undoStack,
      targetState.redoStack
    );

    setSnapshot(targetState);
    onStateChange(targetState);
  };

  if (!snapshot) return null;

  // File structure for explorer
  const rootFiles = ['README.md'];
  const coreFiles = ['Branch.h', 'Commit.h', 'Commit.cpp', 'RevStack.h', 'RevStack.cpp', 'main.cpp'];

  // Current file contents inside Monaco
  const getFileContent = () => {
    if (snapshot.workingDirectory && selectedFile in snapshot.workingDirectory) {
      return snapshot.workingDirectory[selectedFile];
    }
    // Fallbacks
    if (selectedFile === 'README.md') return readmeMd;
    if (selectedFile === 'Branch.h') return branchH;
    return "// File empty or untracked in current HEAD";
  };

  // Determine Monaco Editor file language
  const getFileLanguage = () => {
    if (selectedFile.endsWith('.h') || selectedFile.endsWith('.cpp')) return 'cpp';
    if (selectedFile.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  // SVG Commit Graph Calculations
  const renderCommitGraph = () => {
    const commits = Object.values(snapshot.commitMap) as any[];
    if (commits.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-neutral-500 font-mono text-sm">
          No commits in this branch yet. Use the terminal to run "commit &lt;message&gt;"
        </div>
      );
    }

    // Setup Branch columns
    const branchColumns: Record<string, number> = { "main": 0 };
    let colIndex = 1;
    snapshot.branches.forEach((b: any) => {
      if (b.name !== "main") {
        branchColumns[b.name] = colIndex;
        colIndex++;
      }
    });

    const colWidth = 100;
    const centerOffset = 180;
    const rowHeight = 70;

    const nodes = commits.map((c, index) => {
      const col = branchColumns[c.branch] ?? 0;
      const x = centerOffset + col * colWidth;
      const y = 40 + index * rowHeight;
      return { ...c, x, y };
    });

    const nodeLookup = new Map(nodes.map(n => [n.id, n]));

    return (
      <svg className="w-full h-full min-h-[300px] select-none">
        {/* Gradients and Filters */}
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
          </radialGradient>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Draw Edges */}
        {nodes.map(node => {
          return node.parents.map((pId: string) => {
            const parentNode = nodeLookup.get(pId);
            if (!parentNode) return null;

            const fromX = parentNode.x;
            const fromY = parentNode.y;
            const toX = node.x;
            const toY = node.y;

            // Draw curved line representing Git branch transitions
            const controlY = (fromY + toY) / 2;
            const pathData = `M ${fromX} ${fromY} C ${fromX} ${controlY}, ${toX} ${controlY}, ${toX} ${toY}`;

            let strokeColor = 'rgba(255, 255, 255, 0.15)';
            if (node.branch === 'main') strokeColor = '#FF6B00';
            else if (node.branch === 'dev') strokeColor = '#8A5CFF';
            else strokeColor = '#2CE6FF';

            return (
              <path
                key={`${node.id}-${pId}`}
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth={2}
                className="opacity-75 transition-all duration-300"
              />
            );
          });
        })}

        {/* Draw Commit Nodes */}
        {nodes.map(node => {
          const isHead = node.id === snapshot.headId;
          const isSelected = selectedCommit?.id === node.id;
          
          let color = '#FF6B00';
          let glowColor = 'rgba(255, 107, 0, 0.4)';
          if (node.branch === 'dev') {
            color = '#8A5CFF';
            glowColor = 'rgba(138, 92, 255, 0.4)';
          } else if (node.branch !== 'main') {
            color = '#2CE6FF';
            glowColor = 'rgba(44, 230, 255, 0.4)';
          }

          return (
            <g
              key={node.id}
              onClick={() => setSelectedCommit(node)}
              className="cursor-pointer group"
            >
              {/* Outer pulsing ring for HEAD */}
              {isHead && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={12}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  className="animate-ping opacity-60"
                />
              )}

              {/* Glowing shadow circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={16}
                fill={glowColor}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              {/* Interactive Node */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isSelected ? 8 : 6}
                fill={isHead ? "#FFFFFF" : color}
                stroke={isHead ? color : "#FFFFFF"}
                strokeWidth={isHead ? 2.5 : 1}
                filter="url(#glowFilter)"
                className="transition-all duration-300"
              />

              {/* Text label next to node */}
              <text
                x={node.x + 15}
                y={node.y + 4}
                fill="#FFFFFF"
                className="text-[10px] font-mono fill-neutral-300 group-hover:fill-white font-medium transition-colors pointer-events-none"
              >
                {node.id} : {node.message.length > 25 ? `${node.message.slice(0, 22)}...` : node.message}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <section id="workspace-playground" className="min-h-screen py-24 bg-[#050505] relative overflow-hidden flex flex-col justify-center px-4 md:px-8">
      {/* Absolute Decorative elements */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-cyanAccent/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto w-full flex flex-col space-y-6">
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-glass-border pb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white font-sans uppercase">
              VCS Client <span className="text-primary">Workspace</span>
            </h2>
            <p className="text-sm text-neutral-400 font-light mt-1">
              Interact with the live C++ engine simulation. Switch branches, edit directory, and revert commits.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0 bg-neutral-900/60 border border-glass-border px-4 py-2 rounded-lg font-mono text-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-neutral-400">Branch:</span>
            <span className="text-cyanAccent font-semibold">{snapshot.currentBranchName}</span>
            <span className="text-neutral-500">|</span>
            <span className="text-neutral-400">HEAD:</span>
            <span className="text-primary font-semibold">{snapshot.headId || "None"}</span>
          </div>
        </div>

        {/* Triple Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[650px]">
          
          {/* Panel 1: File Explorer (3 cols) */}
          <div className="lg:col-span-3 glass-panel rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-glass-border bg-neutral-950/60 flex items-center justify-between">
              <span className="text-xs font-mono tracking-wider font-semibold text-neutral-400 uppercase flex items-center">
                <Search className="w-3.5 h-3.5 mr-2 text-primary" /> Explorer
              </span>
              <span className="text-[10px] font-mono text-neutral-500">revstack-root</span>
            </div>

            {/* Directory Files */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-4">
              
              {/* core/ directory */}
              <div className="space-y-1">
                <div 
                  className="flex items-center space-x-1 cursor-pointer text-neutral-300 hover:text-white"
                  onClick={() => setExplorerOpen(prev => ({ ...prev, core: !prev.core }))}
                >
                  {explorerOpen.core ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <Folder className="w-4 h-4 text-purpleAccent" />
                  <span className="font-semibold">core</span>
                </div>
                
                {explorerOpen.core && (
                  <div className="pl-6 space-y-1 border-l border-neutral-800 ml-1.5 mt-1">
                    {coreFiles.map(file => (
                      <div 
                        key={file}
                        onClick={() => setSelectedFile(file)}
                        className={`flex items-center space-x-2 py-1 px-2 rounded cursor-pointer transition-colors ${selectedFile === file ? 'bg-primary/10 text-primary' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'}`}
                      >
                        <File className="w-3.5 h-3.5" />
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* root files */}
              <div className="space-y-1 mt-2">
                {rootFiles.map(file => (
                  <div 
                    key={file}
                    onClick={() => setSelectedFile(file)}
                    className={`flex items-center space-x-2 py-1 px-2 rounded cursor-pointer transition-colors ${selectedFile === file ? 'bg-primary/10 text-primary' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'}`}
                  >
                    <BookOpen className="w-4 h-4 text-cyanAccent" />
                    <span>{file}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Repo Status Summary */}
            <div className="p-4 border-t border-glass-border bg-neutral-950/60 font-mono text-[11px] text-neutral-400 space-y-2">
              <div className="text-neutral-500 font-semibold uppercase tracking-wider mb-1">C++ Stack status</div>
              <div className="flex justify-between">
                <span>Undo Stack:</span>
                <span className="text-primary font-bold">{snapshot.undoStack.length} depth</span>
              </div>
              <div className="flex justify-between">
                <span>Redo Stack:</span>
                <span className="text-cyanAccent font-bold">{snapshot.redoStack.length} depth</span>
              </div>
              <div className="flex justify-between">
                <span>Total commits:</span>
                <span className="text-neutral-300">{Object.keys(snapshot.commitMap).length} commits</span>
              </div>
            </div>
          </div>

          {/* Panel 2: Editor & Workspace Viewer (6 cols) */}
          <div className="lg:col-span-6 glass-panel rounded-xl overflow-hidden flex flex-col relative">
            <div className="px-4 py-3 border-b border-glass-border bg-neutral-950/40 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <File className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-neutral-300 font-medium">{selectedFile}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] bg-white/5 border border-glass-border text-neutral-400 px-2 py-0.5 rounded font-mono">
                  {getFileLanguage().toUpperCase()}
                </span>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                  READ-ONLY
                </span>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              <Editor
                height="100%"
                language={getFileLanguage()}
                theme="vs-dark"
                value={getFileContent()}
                options={{
                  readOnly: true,
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono',
                  minimap: { enabled: false },
                  scrollbar: {
                    verticalScrollbarSize: 6,
                    horizontalScrollbarSize: 6
                  },
                  lineNumbersMinChars: 3,
                  padding: { top: 12 }
                }}
                loading={
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-500 font-mono text-sm bg-[#050505]">
                    Loading compiler snapshot...
                  </div>
                }
              />
            </div>
          </div>

          {/* Panel 3: Terminal & Command CLI (3 cols) */}
          <div className="lg:col-span-3 glass-panel rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-glass-border bg-neutral-950/60 flex items-center space-x-2">
              <Terminal className="w-4.5 h-4.5 text-primary" />
              <span className="text-xs font-mono tracking-wider font-semibold text-neutral-400 uppercase">Interactive Terminal</span>
            </div>

            {/* Logs Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-black/40 font-mono text-xs text-neutral-300 space-y-2.5">
              {terminalLogs.map((log, idx) => {
                const isCommand = log.startsWith("MiniGit >");
                const isSuccess = log.includes("successful") || log.includes("Committed") || log.includes("Branch created") || log.includes("Switched");
                const isError = log.includes("not found") || log.includes("Nothing to") || log.includes("Cannot merge") || log.includes("Usage");

                let logClass = "text-neutral-400";
                if (isCommand) logClass = "text-white font-semibold text-neutral-100 flex items-center";
                else if (isSuccess) logClass = "text-emerald-400 font-medium";
                else if (isError) logClass = "text-red-400 font-medium";

                return (
                  <div key={idx} className={logClass}>
                    {isCommand && <CornerDownRight className="w-3.5 h-3.5 text-primary mr-1.5 shrink-0" />}
                    <span>{log}</span>
                  </div>
                );
              })}
              <div ref={terminalBottomRef} />
            </div>

            {/* Input CLI Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                executeCommand(terminalInput);
              }}
              className="p-3 border-t border-glass-border bg-neutral-950/60 flex items-center space-x-2"
            >
              <span className="text-primary font-mono text-xs font-bold">MiniGit &gt;</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Type 'help'..."
                className="flex-1 bg-transparent text-white font-mono text-xs outline-none border-none placeholder-neutral-600"
              />
              <button 
                type="submit" 
                className="p-1 px-2.5 bg-neutral-900 border border-glass-border rounded hover:bg-neutral-800 text-[10px] font-mono text-neutral-400 hover:text-white transition-colors"
              >
                RUN
              </button>
            </form>
          </div>
        </div>

        {/* Lower Section: Commit Graph & Scrub Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Commit Graph Panel (8 cols) */}
          <div className="lg:col-span-8 glass-panel rounded-xl overflow-hidden flex flex-col h-[340px]">
            <div className="p-4 border-b border-glass-border bg-neutral-950/60 flex justify-between items-center">
              <span className="text-xs font-mono tracking-wider font-semibold text-neutral-400 uppercase flex items-center">
                <GitCommit className="w-4 h-4 mr-2 text-primary" /> Commit Graph DAG
              </span>
              <span className="text-[10px] font-mono text-neutral-500">Interactive Clickable Nodes</span>
            </div>

            <div className="flex-1 overflow-auto bg-neutral-950/20 relative">
              {renderCommitGraph()}

              {/* Side popup for commit details */}
              <AnimatePresence>
                {selectedCommit && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute right-4 top-4 bottom-4 w-72 bg-neutral-900/95 border border-glass-border rounded-lg backdrop-blur-md p-4 flex flex-col font-mono text-xs shadow-glass-card z-20"
                  >
                    <div className="flex items-center justify-between border-b border-glass-border pb-2 mb-3">
                      <span className="text-cyanAccent font-semibold">Commit Metadata</span>
                      <button 
                        onClick={() => setSelectedCommit(null)}
                        className="text-neutral-500 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto text-neutral-300">
                      <div>
                        <span className="text-neutral-500">Commit ID:</span>
                        <div className="text-white font-bold text-sm bg-white/5 px-2 py-1 rounded mt-0.5">{selectedCommit.id}</div>
                      </div>
                      <div>
                        <span className="text-neutral-500">Message:</span>
                        <div className="text-white mt-0.5 font-sans leading-relaxed">{selectedCommit.message}</div>
                      </div>
                      <div>
                        <span className="text-neutral-500">Branch:</span>
                        <div className="text-purpleAccent mt-0.5 flex items-center">
                          <GitBranch className="w-3.5 h-3.5 mr-1" /> {selectedCommit.branch}
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-500">Parents:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedCommit.parents.length > 0 ? (
                            selectedCommit.parents.map((p: string) => (
                              <span key={p} className="bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded text-[10px]">
                                {p}
                              </span>
                            ))
                          ) : (
                            <span className="text-neutral-600 italic">None (Root Commit)</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-500">Changed Files:</span>
                        <div className="space-y-1.5 mt-1">
                          {Object.keys(selectedCommit.files).map(filename => (
                            <div key={filename} className="flex items-center space-x-1.5 text-neutral-400">
                              <File className="w-3 h-3 text-cyanAccent" />
                              <span>{filename}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Timeline Slider / Stack Panel (4 cols) */}
          <div className="lg:col-span-4 glass-panel rounded-xl overflow-hidden flex flex-col h-[340px]">
            <div className="p-4 border-b border-glass-border bg-neutral-950/60">
              <span className="text-xs font-mono tracking-wider font-semibold text-neutral-400 uppercase flex items-center">
                <RotateCcw className="w-4 h-4 mr-2 text-primary" /> Repository Rewind Slider
              </span>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between font-mono">
              <div className="text-xs text-neutral-400 space-y-4">
                <p className="leading-relaxed">
                  Drag the history slider below to reconstruct past repo states. Scrubbing uses the <span className="text-primary">undo/redo stack</span> to pop/push commits and restore snapshots.
                </p>

                <div className="bg-neutral-950/60 border border-glass-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center text-[10px] text-neutral-500 uppercase tracking-widest">
                    <Info className="w-3.5 h-3.5 mr-1.5 text-cyanAccent" /> Current Timeline State
                  </div>
                  <div>
                    <span className="text-neutral-500">History step:</span>{' '}
                    <span className="text-white font-bold">{historyIndex + 1}</span>{' '}
                    <span className="text-neutral-600">/</span>{' '}
                    <span className="text-neutral-500">{historyStates.length}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-neutral-500">Active HEAD msg:</span>{' '}
                    <span className="text-primary font-medium">
                      {snapshot.headId ? snapshot.commitMap[snapshot.headId]?.message : "No commits"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Slider Scrub Control */}
              <div className="space-y-4 pt-6 border-t border-glass-border/40">
                <div className="flex justify-between items-center text-xs">
                  <button
                    disabled={historyIndex <= 0}
                    onClick={() => handleTimelineScrub(historyIndex - 1)}
                    className="p-1 px-2.5 bg-neutral-900 border border-glass-border rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 text-neutral-300 flex items-center space-x-1"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Undo</span>
                  </button>
                  <span className="text-[10px] text-neutral-500">Scrub Repository State</span>
                  <button
                    disabled={historyIndex >= historyStates.length - 1}
                    onClick={() => handleTimelineScrub(historyIndex + 1)}
                    className="p-1 px-2.5 bg-neutral-900 border border-glass-border rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 text-neutral-300 flex items-center space-x-1"
                  >
                    <span>Redo</span>
                    <Redo2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="range"
                  min="0"
                  max={historyStates.length - 1}
                  value={historyIndex}
                  onChange={(e) => handleTimelineScrub(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
