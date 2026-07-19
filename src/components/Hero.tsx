import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Code, GitMerge, Layers } from 'lucide-react';

export const Hero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Re-size listener
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse movement listener for parallax
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      setMouse(prev => ({
        ...prev,
        targetX: x * 0.05,
        targetY: y * 0.05
      }));
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Node definitions
    interface GraphNode {
      id: string;
      branch: 'main' | 'dev' | 'feature';
      x: number;
      y: number;
      targetY: number;
      pulse: number;
      pulseDir: number;
      radius: number;
      glowColor: string;
    }

    interface GraphEdge {
      from: GraphNode;
      to: GraphNode;
      progress: number; // 0 to 1 for growth animation
    }

    interface Particle {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      progress: number;
      speed: number;
      color: string;
    }

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const particles: Particle[] = [];

    const branchColors = {
      main: '#FF6B00',    // Primary Orange
      dev: '#8A5CFF',     // Accent Purple
      feature: '#2CE6FF'  // Accent Cyan
    };

    // Initialize base nodes
    const mainNodesCount = 6;
    for (let i = 0; i < mainNodesCount; i++) {
      const nodeY = (height / (mainNodesCount + 1)) * (i + 1);
      nodes.push({
        id: `main-${i}`,
        branch: 'main',
        x: width / 2,
        y: nodeY + 200, // Offset initial position
        targetY: nodeY,
        pulse: Math.random(),
        pulseDir: 0.02 + Math.random() * 0.02,
        radius: 6 + Math.random() * 4,
        glowColor: branchColors.main
      });
    }

    // Connect main branch edges
    for (let i = 0; i < mainNodesCount - 1; i++) {
      edges.push({
        from: nodes[i],
        to: nodes[i + 1],
        progress: 0
      });
    }

    // Add branch lines
    // Dev branch splits from main-1 and merges back to main-4
    const devNodesCount = 3;
    const devNodes: GraphNode[] = [];
    for (let i = 0; i < devNodesCount; i++) {
      const progress = (i + 1) / (devNodesCount + 1);
      const startY = nodes[1].targetY;
      const endY = nodes[4].targetY;
      const nodeY = startY + (endY - startY) * progress;
      devNodes.push({
        id: `dev-${i}`,
        branch: 'dev',
        x: width / 2 - 120,
        y: nodeY + 200,
        targetY: nodeY,
        pulse: Math.random(),
        pulseDir: 0.02 + Math.random() * 0.02,
        radius: 5 + Math.random() * 3,
        glowColor: branchColors.dev
      });
    }
    nodes.push(...devNodes);

    // Dev split edge from main[1] to dev[0]
    edges.push({ from: nodes[1], to: devNodes[0], progress: 0 });
    // Dev inner edges
    for (let i = 0; i < devNodesCount - 1; i++) {
      edges.push({ from: devNodes[i], to: devNodes[i + 1], progress: 0 });
    }
    // Dev merge edge to main[4]
    edges.push({ from: devNodes[devNodesCount - 1], to: nodes[4], progress: 0 });

    // Feature branch splits from main-2
    const featNodesCount = 2;
    const featNodes: GraphNode[] = [];
    for (let i = 0; i < featNodesCount; i++) {
      const nodeY = nodes[2].targetY + 80 * (i + 1);
      featNodes.push({
        id: `feat-${i}`,
        branch: 'feature',
        x: width / 2 + 100,
        y: nodeY + 200,
        targetY: nodeY,
        pulse: Math.random(),
        pulseDir: 0.02 + Math.random() * 0.02,
        radius: 5 + Math.random() * 3,
        glowColor: branchColors.feature
      });
    }
    nodes.push(...featNodes);

    edges.push({ from: nodes[2], to: featNodes[0], progress: 0 });
    edges.push({ from: featNodes[0], to: featNodes[1], progress: 0 });

    // Smooth mouse coordinates interpolation
    let currentMouseX = 0;
    let currentMouseY = 0;

    // Animation Loop
    const animate = () => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // Mouse smoothing
      currentMouseX += (mouse.targetX - currentMouseX) * 0.1;
      currentMouseY += (mouse.targetY - currentMouseY) * 0.1;

      // Parallax transform
      ctx.save();
      ctx.translate(currentMouseX, currentMouseY);

      // Draw Grid Background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = -gridSize; x < width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x - currentMouseX, -gridSize - currentMouseY);
        ctx.lineTo(x - currentMouseX, height + gridSize - currentMouseY);
        ctx.stroke();
      }
      for (let y = -gridSize; y < height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-gridSize - currentMouseX, y - currentMouseY);
        ctx.lineTo(width + gridSize - currentMouseX, y - currentMouseY);
        ctx.stroke();
      }

      // Draw connections/edges
      edges.forEach((edge) => {
        if (edge.progress < 1) {
          edge.progress += 0.01;
        }

        const fromX = edge.from.x;
        const fromY = edge.from.y;
        const toX = edge.to.x;
        const toY = edge.to.y;

        // Custom bezier-like curves for git-look branches
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        
        if (fromX !== toX) {
          // Curved path
          const midY = (fromY + toY) / 2;
          ctx.bezierCurveTo(fromX, midY, toX, midY, toX, toY);
        } else {
          ctx.lineTo(toX, toY);
        }

        ctx.strokeStyle = edge.from.glowColor;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = edge.from.glowColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      });

      // Spawn particles periodically along paths
      if (Math.random() < 0.03 && edges.length > 0) {
        const randomEdge = edges[Math.floor(Math.random() * edges.length)];
        particles.push({
          fromX: randomEdge.from.x,
          fromY: randomEdge.from.y,
          toX: randomEdge.to.x,
          toY: randomEdge.to.y,
          progress: 0,
          speed: 0.008 + Math.random() * 0.012,
          color: randomEdge.from.glowColor
        });
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += p.speed;
        
        if (p.progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        const t = p.progress;
        const cx = p.fromX + (p.toX - p.fromX) * t;
        const cy = p.fromY + (p.toY - p.fromY) * t;

        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Update and draw nodes
      nodes.forEach((node) => {
        // Smooth positioning transition (vertical entry)
        node.y += (node.targetY - node.y) * 0.05;

        // Pulsate glow
        node.pulse += node.pulseDir;
        if (node.pulse > 1 || node.pulse < 0) {
          node.pulseDir = -node.pulseDir;
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = node.glowColor;
        // Map pulse to shadow blur size
        ctx.shadowBlur = 10 + node.pulse * 15;
        ctx.fill();

        // Node inner circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = node.glowColor;
        ctx.shadowBlur = 0;
        ctx.fill();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouse]);

  const scrollToWorkspace = () => {
    const workspaceSection = document.getElementById('workspace-playground');
    if (workspaceSection) {
      workspaceSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen flex flex-col justify-between items-center text-center px-4 overflow-hidden">
      {/* Dynamic interactive background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Floating Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-purpleAccent/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header Content */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-4xl z-10 select-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 flex items-center space-x-2 bg-white/5 border border-glass-border px-4 py-1.5 rounded-full backdrop-blur-md"
        >
          <Layers className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs text-neutral-400 font-mono font-medium">C++ Logic Engine for Revision Tracking</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none text-white mb-6 uppercase"
        >
          Version Control.<br />
          <span className="bg-gradient-to-r from-primary via-purpleAccent to-cyanAccent bg-clip-text text-transparent glow-text-primary">
            Reimagined.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-base md:text-xl text-neutral-400 max-w-2xl font-light leading-relaxed mb-8"
        >
          Experience a custom Git-like engine written in C++ from scratch, featuring dynamic DAG histories, stack-based rewinds, and graph pointer merges.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <button
            onClick={scrollToWorkspace}
            className="flex items-center justify-center space-x-2 px-8 py-3.5 bg-primary text-black font-semibold rounded-lg shadow-glow-primary hover:bg-primary-hover transition-all duration-300 transform active:scale-95"
          >
            <Code className="w-5 h-5" />
            <span>Launch Client Simulator</span>
          </button>
          <a
            href="https://github.com/Sahil-008/RevStack-Core-logic-engine-for-revision-tracking"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 px-8 py-3.5 bg-neutral-900 border border-glass-border text-white font-semibold rounded-lg hover:bg-neutral-800 hover:border-glass-borderHover transition-all duration-300"
          >
            <GitMerge className="w-5 h-5 text-cyanAccent" />
            <span>Source Code</span>
          </a>
        </motion.div>
      </div>

      {/* Footer / Scroll down indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        onClick={scrollToWorkspace}
        className="pb-12 z-10 cursor-pointer flex flex-col items-center text-neutral-500 hover:text-white transition-colors duration-300"
      >
        <span className="text-xs font-mono tracking-widest uppercase mb-2">Scroll to explore</span>
        <ChevronDown className="w-5 h-5 animate-bounce text-primary" />
      </motion.div>
    </section>
  );
};
