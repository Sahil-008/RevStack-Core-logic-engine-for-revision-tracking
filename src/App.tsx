import { useState } from 'react';
import { TerminalLanding } from './components/TerminalLanding';
import { Hero } from './components/Hero';
import { Workspace } from './components/Workspace';
import { DataVisualizer } from './components/DataVisualizer';
import { FeatureShowcase } from './components/FeatureShowcase';
import { Architecture } from './components/Architecture';
import { AboutProject } from './components/AboutProject';
import { GitMerge } from 'lucide-react';

function App() {
  const [booted, setBooted] = useState(false);
  const [vcsState, setVcsState] = useState<any>(null);

  if (!booted) {
    return <TerminalLanding onComplete={() => setBooted(true)} />;
  }

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#FF6B00] selection:text-black">
      
      {/* Top Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between font-mono text-xs select-none">
          <div className="flex items-center space-x-2.5">
            <GitMerge className="w-5 h-5 text-primary" />
            <span className="font-bold tracking-widest text-white text-[13px] uppercase">
              RevStack<span className="text-primary">.io</span>
            </span>
          </div>

          <nav className="hidden sm:flex items-center space-x-8 text-neutral-400">
            <a href="#workspace-playground" className="hover:text-white transition-colors">Playground</a>
            <a href="#visualizer" className="hover:text-white transition-colors">Visualizer</a>
            <a href="#showcase" className="hover:text-white transition-colors">Showcase</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          </nav>

          <a 
            href="https://github.com/Sahil-008/RevStack-Core-logic-engine-for-revision-tracking"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-neutral-900 border border-glass-border px-3.5 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:border-glass-borderHover transition-all duration-300"
          >
            <svg className="w-4 h-4 text-cyanAccent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
            <span>Repository</span>
          </a>
        </div>
      </header>

      {/* Main Page Layout */}
      <main className="pt-16">
        
        {/* Section 1: Cinematic Hero Graph */}
        <Hero />

        {/* Section 2: IDE & Workspace Client Simulator */}
        <Workspace onStateChange={setVcsState} />

        {/* Section 3: Data Structure Memory Layout Visualizer */}
        <div id="visualizer">
          <DataVisualizer vcsState={vcsState} />
        </div>

        {/* Section 4: Code highlighting Walkthroughs */}
        <div id="showcase">
          <FeatureShowcase />
        </div>

        {/* Section 5: Architecture and tech grid */}
        <div id="architecture">
          <Architecture />
        </div>

        {/* Section 6: About / Complexities Case Study */}
        <AboutProject />

      </main>

      {/* Footer */}
      <footer className="border-t border-glass-border py-12 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center font-mono text-xs text-neutral-500 space-y-4 md:space-y-0 select-none">
          <div className="flex items-center space-x-2">
            <GitMerge className="w-4 h-4 text-primary" />
            <span>RevStack C++ Revision Tracker Engine Showcase</span>
          </div>
          <span>&copy; {new Date().getFullYear()} Sahil. Built for Design Award Impact.</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
