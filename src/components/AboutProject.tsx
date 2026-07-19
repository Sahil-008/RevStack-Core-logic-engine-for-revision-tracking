import React from 'react';
import { ShieldAlert, CheckCircle2, Award, Cpu, ServerCrash, Clock } from 'lucide-react';

export const AboutProject: React.FC = () => {
  const complexities = [
    { op: "add", time: "O(1)", space: "O(1)", desc: "Stores a key-value file mapping in the working directory hash map." },
    { op: "commit", time: "O(n)", space: "O(n)", desc: "Clones the working directory snapshot containing n files to a new Commit node." },
    { op: "undo", time: "O(n)", space: "O(n)", desc: "Pops from undo stack, pushes to redo stack, and restores n files from snapshot." },
    { op: "redo", time: "O(n)", space: "O(n)", desc: "Pops from redo stack, pushes to undo stack, and restores n files from snapshot." },
    { op: "merge", time: "O(n)", space: "O(n)", desc: "Combines snapshots from two branches, resolving missing files on top of current head." },
    { op: "log", time: "O(k)", space: "O(1)", desc: "Walks k ancestors starting from HEAD to print parent nodes." }
  ];

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden border-t border-glass-border px-4 md:px-8">
      {/* Background gradients */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full flex flex-col space-y-16">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white font-sans uppercase">
            About the <span className="text-primary">Project</span>
          </h2>
          <p className="text-sm text-neutral-400 font-light mt-2 leading-relaxed">
            The design philosophy, engineering challenge, and algorithmic analysis of the custom VCS engine.
          </p>
        </div>

        {/* Editorial Layout: Problem vs Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Problem */}
          <div className="glass-panel rounded-xl p-8 bg-neutral-900/10 space-y-4">
            <div className="flex items-center space-x-2 text-red-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider">The Problem</h3>
            </div>
            <h4 className="text-xl font-bold text-white leading-snug">
              Git is a black box of hidden abstractions.
            </h4>
            <p className="text-xs text-neutral-400 font-light leading-relaxed font-sans">
              Most developers run git commands daily (`git commit`, `git merge`, `git checkout`) without understanding how history is recorded or how branches align in memory. Traditional tools hide pointer manipulations, hashing operations, and stacks behind complex layers, leading to confusion during merge conflicts or rebase operations.
            </p>
          </div>

          {/* Solution */}
          <div className="glass-panel rounded-xl p-8 bg-neutral-900/10 space-y-4">
            <div className="flex items-center space-x-2 text-primary">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider">The Solution</h3>
            </div>
            <h4 className="text-xl font-bold text-white leading-snug">
              RevStack: Low-level transparency in C++.
            </h4>
            <p className="text-xs text-neutral-400 font-light leading-relaxed font-sans">
              Built from scratch in C++, RevStack strips away the magic of VCS to expose core Computer Science fundamentals. By modeling revisions as a Directed Acyclic Graph (DAG) of commit nodes, branching as pointer referencing in linked lists, and history rewinds via hardware-like stack structures, the engine offers absolute clarity.
            </p>
          </div>

        </div>

        {/* Algorithmic Analysis / Table */}
        <div className="space-y-6">
          <div className="text-xs text-neutral-500 font-mono uppercase tracking-widest flex items-center">
            <Clock className="w-4 h-4 text-cyanAccent mr-2" /> Algorithmic Complexity summary
          </div>

          <div className="glass-panel rounded-xl overflow-hidden bg-neutral-900/10">
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-glass-border bg-neutral-950/60 text-neutral-400 text-left">
                    <th className="p-4 uppercase tracking-wider font-semibold">VCS Operation</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Time Complexity</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Space Complexity</th>
                    <th className="p-4 uppercase tracking-wider font-semibold">Underlying Engine Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/40 text-neutral-300">
                  {complexities.map((row) => (
                    <tr key={row.op} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white">{row.op}</td>
                      <td className="p-4 text-primary font-semibold">{row.time}</td>
                      <td className="p-4 text-cyanAccent font-semibold">{row.space}</td>
                      <td className="p-4 text-neutral-400 font-sans text-xs">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="p-6 border border-glass-border rounded-xl space-y-2 bg-neutral-950/20">
            <Award className="w-5 h-5 text-primary" />
            <h5 className="font-mono text-xs font-bold text-white uppercase">Graph modeling</h5>
            <p className="text-[11px] text-neutral-500 font-light font-sans leading-relaxed">
              Demonstrated mastery in Directed Acyclic Graphs, building parents-vector connections and merge junctions.
            </p>
          </div>

          <div className="p-6 border border-glass-border rounded-xl space-y-2 bg-neutral-950/20">
            <Cpu className="w-5 h-5 text-cyanAccent" />
            <h5 className="font-mono text-xs font-bold text-white uppercase">Memory ownership</h5>
            <p className="text-[11px] text-neutral-500 font-light font-sans leading-relaxed">
              Deep understanding of heap allocation, pointer assignments, and referencing dynamics without garbage collection.
            </p>
          </div>

          <div className="p-6 border border-glass-border rounded-xl space-y-2 bg-neutral-950/20">
            <ServerCrash className="w-5 h-5 text-purpleAccent" />
            <h5 className="font-mono text-xs font-bold text-white uppercase">Snapshot structures</h5>
            <p className="text-[11px] text-neutral-500 font-light font-sans leading-relaxed">
              Analyzed trade-offs between diff storage patterns and complete file mapping snapshots for system immutability.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
