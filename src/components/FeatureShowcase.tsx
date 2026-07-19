import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, CheckCircle2, GitCommit, GitBranch, GitMerge, RotateCcw } from 'lucide-react';

interface FeatureData {
  name: string;
  icon: any;
  cppCode: string;
  description: string;
  steps: {
    title: string;
    description: string;
    highlightLines: number[]; // 1-indexed lines to highlight in code snippet
    visualState: string; // state tag for drawing the animation
  }[];
}

export const FeatureShowcase: React.FC = () => {
  const [selectedFeatureIdx, setSelectedFeatureIdx] = useState(0);
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  const features: FeatureData[] = [
    {
      name: "Commit",
      icon: GitCommit,
      description: "Creates an immutable snapshot of the working directory and links it to the current branch head, pushing the previous HEAD to the undo stack.",
      cppCode: `void RevStack::commit(string message) {
    if (HEAD != nullptr) {
        undoStack.push(HEAD);
    }
    while (!redoStack.empty()) {
        redoStack.pop();
    }
    string id = generateID();
    Commit* newCommit = new Commit(
        id, message, workingDir, currentBranch->head
    );
    currentBranch->head = newCommit;
    HEAD = newCommit;
    commitMap[id] = newCommit;
}`,
      steps: [
        {
          title: "1. Record History",
          description: "If HEAD points to a commit, push the current HEAD pointer onto the Undo Stack to save the state.",
          highlightLines: [2, 3, 4],
          visualState: "push_undo"
        },
        {
          title: "2. Invalidate Futures",
          description: "Clear the Redo Stack. Any new commit cuts off the redo path (non-linear branch split).",
          highlightLines: [5, 6, 7],
          visualState: "clear_redo"
        },
        {
          title: "3. Allocate Node",
          description: "Generate a unique ID and instantiate the new Commit node in memory, passing parent pointer references.",
          highlightLines: [8, 9, 10, 11],
          visualState: "new_commit"
        },
        {
          title: "4. Advance Pointers",
          description: "Update the current branch head pointer and the global HEAD pointer to point to the newly allocated commit node.",
          highlightLines: [12, 13, 14],
          visualState: "update_head"
        }
      ]
    },
    {
      name: "Undo",
      icon: RotateCcw,
      description: "Pops the previous commit from the undo stack and restores the working directory to that state, pushing the undone state to the redo stack.",
      cppCode: `void RevStack::undo() {
    if (undoStack.empty()) return;

    redoStack.push(HEAD);

    HEAD = undoStack.top();
    undoStack.pop();

    currentBranch->head = HEAD;
    workingDir = HEAD->files;
}`,
      steps: [
        {
          title: "1. Push Redo Stack",
          description: "Push the current HEAD onto the Redo Stack, saving the state so we can restore it later if needed.",
          highlightLines: [4],
          visualState: "push_redo"
        },
        {
          title: "2. Pop Undo Stack",
          description: "Set the HEAD pointer to the top of the Undo Stack and pop the stack.",
          highlightLines: [6, 7],
          visualState: "pop_undo"
        },
        {
          title: "3. Restore Snapshot",
          description: "Sync the active branch head pointer and overwrite the working directory files to match the new HEAD commit's snapshot.",
          highlightLines: [9, 10],
          visualState: "restore_files"
        }
      ]
    },
    {
      name: "Branch",
      icon: GitBranch,
      description: "Creates a new branch pointer pointing to the current commit node and prepends it to the branch linked list.",
      cppCode: `void RevStack::createBranch(string name) {
    Branch* newBranch = new Branch();
    newBranch->name = name;
    newBranch->head = currentBranch->head;

    newBranch->next = branchList;
    branchList = newBranch;
}`,
      steps: [
        {
          title: "1. Instantiate Branch pointer",
          description: "Allocate a new Branch object and copy the current active branch's HEAD pointer.",
          highlightLines: [2, 3, 4],
          visualState: "new_branch"
        },
        {
          title: "2. Prepend List Link",
          description: "Link the new branch's next pointer to the head of the branchList, prepending it to the list.",
          highlightLines: [6, 7],
          visualState: "link_branch"
        }
      ]
    },
    {
      name: "Merge",
      icon: GitMerge,
      description: "Creates a new merge commit containing files from both branches, with two parents in the Directed Acyclic Graph.",
      cppCode: `void RevStack::merge(string branchName) {
    // 1. Find other branch...
    // 2. Perform file union resolution...
    Commit* mergeCommit = new Commit(
        newID, "Merge commit", mergedFiles, currentCommit
    );
    mergeCommit->parents.push_back(otherCommit);

    currentBranch->head = mergeCommit;
    HEAD = mergeCommit;
}`,
      steps: [
        {
          title: "1. Resolve Files",
          description: "Read files from the other branch. If a file does not exist in the current branch, add it to the merged snapshot.",
          highlightLines: [2],
          visualState: "merge_files"
        },
        {
          title: "2. Allocate Merge Node",
          description: "Create a new Commit node with currentHEAD as parent[0].",
          highlightLines: [3, 4, 5, 6],
          visualState: "allocate_merge"
        },
        {
          title: "3. Link Dual Parents",
          description: "Push the other branch's HEAD commit into the parents vector, forming a Directed Acyclic Graph structure.",
          highlightLines: [7],
          visualState: "link_parents"
        },
        {
          title: "4. Advance HEAD",
          description: "Set the current branch head and global HEAD pointers to the new merge commit.",
          highlightLines: [9, 10],
          visualState: "advance_merge"
        }
      ]
    }
  ];

  const selectedFeature = features[selectedFeatureIdx];

  const handleFeatureSelect = (idx: number) => {
    setSelectedFeatureIdx(idx);
    setActiveStepIdx(0);
  };

  const handleNextStep = () => {
    if (activeStepIdx < selectedFeature.steps.length - 1) {
      setActiveStepIdx(prev => prev + 1);
    } else {
      setActiveStepIdx(0); // Loop back
    }
  };

  // Visual Renderer for steps
  const renderVisualAnimation = (state: string) => {
    switch (state) {
      // COMMIT animations
      case "push_undo":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="flex items-center space-x-12 relative">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-neutral-500 mb-1">HEAD Ptr</span>
                <div className="w-14 h-14 rounded-full bg-white text-black font-mono font-bold flex items-center justify-center border border-primary animate-pulse">
                  1001
                </div>
              </div>
              <motion.div 
                animate={{ x: [0, 40, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight className="w-6 h-6 text-primary" />
              </motion.div>
              <div className="w-24 h-28 border-2 border-dashed border-primary/40 rounded-lg flex flex-col justify-end p-2 space-y-1">
                <div className="bg-primary/20 text-primary border border-primary/30 p-1.5 rounded text-[10px] text-center font-mono font-bold">
                  1001
                </div>
                <div className="text-[9px] text-neutral-500 font-mono text-center">Undo Stack</div>
              </div>
            </div>
            <p className="text-xs text-neutral-400 font-mono text-center px-4">
              HEAD (Commit 1001) pushed onto Undo Stack.
            </p>
          </div>
        );
      case "clear_redo":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="flex space-x-12">
              <div className="w-24 h-28 border border-neutral-800 rounded-lg flex flex-col justify-end p-2 space-y-1 relative">
                <div className="bg-neutral-800 text-neutral-500 p-1.5 rounded text-[10px] text-center font-mono">
                  1001
                </div>
                <div className="text-[9px] text-neutral-500 font-mono text-center">Undo Stack</div>
              </div>
              <div className="w-24 h-28 border border-neutral-800 rounded-lg flex flex-col justify-end p-2 space-y-1 relative">
                <motion.div 
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: 0, scale: 0.8, y: -40 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="bg-cyanAccent/20 text-cyanAccent border border-cyanAccent/30 p-1.5 rounded text-[10px] text-center font-mono font-bold"
                >
                  1002
                </motion.div>
                <div className="text-[9px] text-neutral-500 font-mono text-center">Redo Stack</div>
              </div>
            </div>
            <p className="text-xs text-neutral-400 font-mono text-center px-4">
              Redo stack items popped and deleted from memory.
            </p>
          </div>
        );
      case "new_commit":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="relative">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-neutral-900 border-2 border-primary/70 shadow-glow-primary flex flex-col items-center justify-center"
              >
                <span className="text-white font-mono font-bold text-xs">1003</span>
                <span className="text-[8px] font-mono text-neutral-400 mt-1">Message</span>
              </motion.div>
              <div className="absolute -left-12 top-6 flex items-center">
                <span className="text-[9px] font-mono text-neutral-500 mr-1">Parent:</span>
                <span className="font-mono text-[10px] text-neutral-300">1001</span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 font-mono text-center px-4">
              Commit node allocated on heap with files snapshot pointer.
            </p>
          </div>
        );
      case "update_head":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-4 items-center">
                <div className="text-[9px] font-mono text-neutral-500">HEAD</div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                <div className="p-2 bg-white text-black font-mono font-bold rounded border border-primary text-xs">
                  1003
                </div>
              </div>
              <div className="flex space-x-4 items-center">
                <div className="text-[9px] font-mono text-neutral-500">main Branch</div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                <div className="p-2 bg-primary/20 text-primary font-mono font-bold rounded border border-primary/30 text-xs">
                  1003
                </div>
              </div>
            </div>
            <p className="text-xs text-neutral-400 font-mono text-center px-4">
              Branch Head pointer updated to point to commit 1003.
            </p>
          </div>
        );

      // UNDO animations
      case "push_redo":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="flex items-center space-x-8">
              <div className="w-14 h-14 rounded-full bg-white text-black font-mono font-bold flex items-center justify-center border border-primary">
                1002
              </div>
              <motion.div animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <ArrowRight className="w-6 h-6 text-cyanAccent" />
              </motion.div>
              <div className="w-24 h-28 border border-neutral-800 rounded-lg flex flex-col justify-end p-2 space-y-1">
                <div className="bg-cyanAccent/20 text-cyanAccent border border-cyanAccent/30 p-1.5 rounded text-[10px] text-center font-mono font-bold">
                  1002
                </div>
                <div className="text-[9px] text-neutral-500 font-mono text-center">Redo Stack</div>
              </div>
            </div>
            <p className="text-xs text-neutral-400 font-mono text-center px-4">
              Current HEAD (1002) is pushed onto Redo Stack.
            </p>
          </div>
        );
      case "pop_undo":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="flex items-center space-x-8">
              <div className="w-24 h-28 border border-neutral-800 rounded-lg flex flex-col justify-end p-2 space-y-1">
                <motion.div 
                  initial={{ y: 0 }}
                  animate={{ y: -40, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="bg-primary/20 text-primary border border-primary/30 p-1.5 rounded text-[10px] text-center font-mono font-bold"
                >
                  1001
                </motion.div>
                <div className="text-[9px] text-neutral-500 font-mono text-center">Undo Stack</div>
              </div>
              <ArrowRight className="w-6 h-6 text-neutral-700" />
              <div className="w-14 h-14 rounded-full bg-white text-black font-mono font-bold flex items-center justify-center border border-primary">
                1001
              </div>
            </div>
            <p className="text-xs text-neutral-400 font-mono text-center px-4">
              Previous commit 1001 popped from Undo Stack to become the new HEAD.
            </p>
          </div>
        );
      case "restore_files":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="border border-neutral-800 bg-neutral-950/60 p-4 rounded-lg font-mono text-xs w-48 space-y-1.5 text-neutral-400">
              <div className="text-neutral-500 uppercase tracking-widest text-[9px] mb-1">Restored Working Dir</div>
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} className="flex justify-between">
                <span>main.cpp</span> <span className="text-emerald-400">Restored</span>
              </motion.div>
              <div className="flex justify-between">
                <span>README.md</span> <span className="text-neutral-500">Unchanged</span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 font-mono text-center px-4">
              Working directory snapshot synced to Commit 1001.
            </p>
          </div>
        );

      // BRANCH animations
      case "new_branch":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-neutral-900 border border-purpleAccent/40 p-3 rounded-lg flex flex-col items-center">
                <span className="text-purpleAccent font-bold text-xs">dev branch</span>
                <span className="text-[9px] text-neutral-500 mt-1">head -&gt; 1001</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-700 transform rotate-90" />
              <div className="w-12 h-12 rounded-full bg-neutral-950 border border-neutral-700 flex items-center justify-center text-[10px] font-mono">
                1001
              </div>
            </div>
            <p className="text-xs text-neutral-400 font-mono text-center px-4">
              New branch object points to the active HEAD commit node.
            </p>
          </div>
        );
      case "link_branch":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6 font-mono text-xs">
            <div className="flex items-center space-x-4">
              <div className="bg-purpleAccent/20 border border-purpleAccent/30 p-2 rounded">
                dev (new)
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-600" />
              <div className="bg-neutral-900 border border-glass-border p-2 rounded">
                main
              </div>
            </div>
            <p className="text-xs text-neutral-400 font-mono text-center px-4">
              The new branch is linked to the front of the branch list pointer link structure.
            </p>
          </div>
        );

      // MERGE animations
      case "merge_files":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6 font-mono text-xs text-neutral-400">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-2 border border-neutral-800 bg-neutral-950/60 rounded">
                <div className="text-primary text-[10px] mb-1">main branch files</div>
                <div>fileA.txt</div>
              </div>
              <div className="p-2 border border-neutral-800 bg-neutral-950/60 rounded">
                <div className="text-purpleAccent text-[10px] mb-1">dev branch files</div>
                <div>fileA.txt</div>
                <div>fileB.txt</div>
              </div>
            </div>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded w-48 text-center font-bold text-[10px]">
              Union: [fileA.txt, fileB.txt]
            </div>
            <p className="text-xs text-neutral-400 font-mono text-center px-4">
              Merge files snapshot constructed from the two branches.
            </p>
          </div>
        );
      case "allocate_merge":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-18 h-18 rounded-full bg-neutral-900 border border-neutral-700 flex flex-col items-center justify-center font-mono">
              <span className="text-white text-xs font-bold">1005</span>
              <span className="text-[8px] text-neutral-500 mt-1">Merge Commit</span>
            </div>
            <p className="text-xs text-neutral-400 font-mono text-center px-4">
              Merge Commit allocated, linked to currentBranch-&gt;head as parent[0].
            </p>
          </div>
        );
      case "link_parents":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-12 relative">
                <div className="w-10 h-10 rounded-full border border-primary/50 text-primary flex items-center justify-center text-[10px] font-mono font-bold">
                  1003
                </div>
                <div className="w-10 h-10 rounded-full border border-purpleAccent/50 text-purpleAccent flex items-center justify-center text-[10px] font-mono font-bold">
                  1004
                </div>
              </div>
              <div className="flex justify-between space-x-16">
                <ArrowRight className="w-4 h-4 text-neutral-500 transform rotate-45" />
                <ArrowRight className="w-4 h-4 text-neutral-500 transform rotate-135" />
              </div>
              <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-xs font-mono font-bold border border-primary">
                1005
              </div>
            </div>
            <p className="text-xs text-neutral-400 font-mono text-center px-4">
              Other branch's HEAD is added to parents vector, generating a DAG merge loop.
            </p>
          </div>
        );
      case "advance_merge":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="flex space-x-6 items-center font-mono text-xs">
              <span className="text-neutral-500">HEAD</span>
              <ArrowRight className="w-4 h-4 text-neutral-500" />
              <span className="p-2 border border-primary text-primary bg-primary/10 rounded font-bold">
                1005 (Merge)
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono text-center px-4">
              Current branch head pointer and HEAD advanced to the merge commit node.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden border-t border-glass-border px-4 md:px-8">
      {/* Background grids */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-cyanAccent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full flex flex-col space-y-12">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white font-sans uppercase">
            Interactive <span className="text-primary">Feature Showcase</span>
          </h2>
          <p className="text-sm text-neutral-400 font-light mt-2 leading-relaxed">
            See the raw C++ code behind each command and click through the step-by-step executions to trace memory pointers.
          </p>
        </div>

        {/* Feature Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-3">
          {features.map((feature, idx) => {
            const FeatureIcon = feature.icon;
            const isSelected = selectedFeatureIdx === idx;
            return (
              <button
                key={feature.name}
                onClick={() => handleFeatureSelect(idx)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-lg border font-mono text-xs tracking-wider uppercase transition-all duration-300 ${isSelected ? 'bg-primary border-primary text-black font-bold shadow-glow-primary' : 'bg-neutral-900/60 border-glass-border text-neutral-400 hover:border-glass-borderHover hover:text-white'}`}
              >
                <FeatureIcon className="w-4 h-4" />
                <span>{feature.name}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[550px]">
          
          {/* Column 1: C++ Implementation (6 cols) */}
          <div className="lg:col-span-6 glass-panel rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-glass-border bg-neutral-950/60 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purpleAccent animate-pulse" />
                <span className="text-xs font-mono text-neutral-300 font-semibold uppercase">C++ Source Code</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">RevStack.cpp</span>
            </div>

            <div className="flex-1 p-5 overflow-auto bg-black/30 font-mono text-xs leading-relaxed text-neutral-400">
              <pre className="relative select-none">
                {selectedFeature.cppCode.split('\n').map((line, idx) => {
                  const lineNum = idx + 1;
                  const isHighlighted = selectedFeature.steps[activeStepIdx]?.highlightLines.includes(lineNum);
                  
                  return (
                    <div 
                      key={lineNum}
                      className={`flex -mx-5 px-5 py-0.5 transition-colors duration-300 ${isHighlighted ? 'bg-primary/10 border-l-2 border-primary text-white font-medium' : ''}`}
                    >
                      <span className="w-8 text-neutral-600 text-right select-none pr-4">{lineNum}</span>
                      <span>{line}</span>
                    </div>
                  );
                })}
              </pre>
            </div>
          </div>

          {/* Column 2: Walkthrough Controller & Animation (6 cols) */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            
            {/* Walkthrough controller */}
            <div className="glass-panel rounded-xl p-6 flex flex-col bg-neutral-900/40 relative overflow-hidden">
              <div className="text-xs text-neutral-500 font-mono uppercase tracking-widest mb-1.5 flex items-center">
                <CheckCircle2 className="w-4 h-4 text-primary mr-1.5" /> Walkthrough Controller
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {selectedFeature.name} Mechanism
              </h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed mb-6">
                {selectedFeature.description}
              </p>

              {/* Progress Steps Indicators */}
              <div className="space-y-4">
                {selectedFeature.steps.map((step, idx) => {
                  const isActive = activeStepIdx === idx;
                  const isCompleted = activeStepIdx > idx;

                  return (
                    <div 
                      key={step.title}
                      onClick={() => setActiveStepIdx(idx)}
                      className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-300 ${isActive ? 'bg-neutral-900 border-primary/30 shadow-sm' : 'border-transparent hover:bg-white/5'}`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold mt-0.5 shrink-0 ${isActive ? 'bg-primary text-black' : isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-500'}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className={`text-xs font-mono font-semibold ${isActive ? 'text-white' : isCompleted ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {step.title}
                        </div>
                        {isActive && (
                          <motion.p 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[11px] text-neutral-400 font-light mt-1 leading-relaxed"
                          >
                            {step.description}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Simulation button */}
              <button 
                onClick={handleNextStep}
                className="mt-6 flex items-center justify-center space-x-2 w-full py-3 bg-neutral-950/80 hover:bg-neutral-900 border border-glass-border hover:border-glass-borderHover text-white rounded-lg font-mono text-xs uppercase tracking-wider transition-all duration-300"
              >
                <Play className="w-4 h-4 text-cyanAccent animate-pulse" />
                <span>Next animation step</span>
              </button>
            </div>

            {/* Animation Viewer Panel */}
            <div className="glass-panel rounded-xl flex-1 min-h-[220px] bg-neutral-950/50 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-3 left-3 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                Heap Visual Allocator
              </div>

              <div className="w-full h-full p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedFeatureIdx}-${activeStepIdx}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {renderVisualAnimation(selectedFeature.steps[activeStepIdx]?.visualState)}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
