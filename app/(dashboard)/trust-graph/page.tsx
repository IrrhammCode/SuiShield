"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Loader2,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  Activity,
  Eye,
  GitBranch,
} from "lucide-react";
import { DualWalletButton } from "@/components/WalletConnect";

// ── Types ────────────────────────────────────────────────

interface FlowNode {
  id: string;
  address: string;
  label?: string;
  riskScore: number;
  riskLevel: string;
  isOrigin: boolean;
  isFlagged: boolean;
  txCount: number;
  nodeType: "wallet" | "protocol" | "contract" | "exchange" | "unknown";
  protocolInfo?: { name: string; type: string; verified: boolean };
}

interface FlowEdge {
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  txHash: string;
  isSuspicious: boolean;
  edgeType: "transfer" | "contract_call" | "nft_transfer" | "stake" | "swap";
}

interface SuspiciousPattern {
  type: string;
  severity: string;
  description: string;
  addresses: string[];
  confidence: number;
}

interface FlowGraph {
  origin: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  suspiciousPatterns: SuspiciousPattern[];
  riskSummary: {
    overallRisk: number;
    flaggedAddresses: number;
    totalVolume: string;
    uniqueAddresses: number;
  };
}

interface BehavioralPattern {
  type: string;
  detected: boolean;
  confidence: number;
  description: string;
}

// ── Risk Color Helpers ───────────────────────────────────

function getRiskColor(score: number): string {
  if (score < 25) return "#00FF9D";
  if (score < 50) return "#FFB300";
  if (score < 75) return "#FF6B00";
  return "#FF3366";
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: "#00E5FF",
    medium: "#FFB300",
    high: "#FF6B00",
    critical: "#FF3366",
  };
  return colors[severity] || "#525880";
}

function getEdgeStyle(edgeType: string, isSuspicious: boolean): { stroke: string; strokeWidth: number; dashArray: string } {
  if (isSuspicious) return { stroke: "#FF3366", strokeWidth: 2.5, dashArray: "5,5" };
  const styles: Record<string, { stroke: string; strokeWidth: number; dashArray: string }> = {
    transfer:      { stroke: "rgba(0,229,255,0.25)", strokeWidth: 1.5, dashArray: "none" },
    contract_call: { stroke: "rgba(168,85,247,0.4)",  strokeWidth: 1.5, dashArray: "4,3" },
    swap:          { stroke: "rgba(0,255,157,0.4)",   strokeWidth: 2,   dashArray: "none" },
    stake:         { stroke: "rgba(255,179,0,0.35)",   strokeWidth: 1.5, dashArray: "6,3" },
    nft_transfer:  { stroke: "rgba(255,107,0,0.4)",   strokeWidth: 1.5, dashArray: "3,3" },
  };
  return styles[edgeType] || styles.transfer;
}

function getNodeColor(node: FlowNode): string {
  if (node.isFlagged) return "#FF3366";
  if (node.nodeType === "protocol") {
    if (node.protocolInfo?.verified) return "#00E5FF";
    return "#A855F7";
  }
  return getRiskColor(node.riskScore);
}

function getNodeShape(nodeType: string): "circle" | "diamond" | "square" {
  if (nodeType === "protocol") return "diamond";
  if (nodeType === "contract") return "square";
  return "circle";
}

// ── Trust Graph Visualization ────────────────────────────

function TrustGraphViz({ graph }: { graph: FlowGraph }) {
  const width = 800;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  
  // Interaction states
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = selectedNodeId ? graph.nodes.find(n => n.id === selectedNodeId) : null;

  // Pan and Zoom
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Initialize and run physics simulation
  useEffect(() => {
    const initial: Record<string, { x: number; y: number; vx: number; vy: number }> = {};
    
    // Assign initial positions: origin in center, others scattered randomly around
    graph.nodes.forEach((node) => {
      if (node.isOrigin) {
        initial[node.id] = { x: centerX, y: centerY, vx: 0, vy: 0 };
      } else {
        const angle = Math.random() * Math.PI * 2;
        const radius = 100 + Math.random() * 100;
        initial[node.id] = {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
        };
      }
    });

    let animationId: number;
    let ticks = 0;
    
    const runSimulation = () => {
      const repelForce = 1500;
      const linkForce = 0.05;
      const centerForce = 0.02;
      const damping = 0.85;

      const keys = Object.keys(initial);
      
      // 1. Repulsion force between all nodes
      for (let i = 0; i < keys.length; i++) {
        const nodeA = initial[keys[i]];
        for (let j = i + 1; j < keys.length; j++) {
          const nodeB = initial[keys[j]];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distSq = dx * dx + dy * dy + 0.1;
          const dist = Math.sqrt(distSq);
          
          if (dist < 350) {
            const force = repelForce / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            nodeA.vx -= fx;
            nodeA.vy -= fy;
            nodeB.vx += fx;
            nodeB.vy += fy;
          }
        }
      }

      // 2. Attraction force along edges (links)
      graph.edges.forEach((edge) => {
        const nodeA = initial[edge.from];
        const nodeB = initial[edge.to];
        if (!nodeA || !nodeB) return;

        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        
        const targetLen = edge.edgeType === "contract_call" ? 100 : 150;
        const force = (dist - targetLen) * linkForce;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        nodeA.vx += fx;
        nodeA.vy += fy;
        nodeB.vx -= fx;
        nodeB.vy -= fy;
      });

      // 3. Gravity/Center force
      keys.forEach((key) => {
        const node = initial[key];
        
        if (key === graph.origin && draggedNode !== key) {
          node.x = centerX;
          node.y = centerY;
          node.vx = 0;
          node.vy = 0;
          return;
        }

        if (draggedNode === key) return;

        const dx = centerX - node.x;
        const dy = centerY - node.y;
        node.vx += dx * centerForce;
        node.vy += dy * centerForce;
      });

      // 4. Update coordinates with damping & speed limit
      let maxVelocity = 0;
      keys.forEach((key) => {
        if (draggedNode === key) return;
        
        const node = initial[key];
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed > 15) {
          node.vx = (node.vx / speed) * 15;
          node.vy = (node.vy / speed) * 15;
        }

        node.x += node.vx;
        node.y += node.vy;
        
        node.vx *= damping;
        node.vy *= damping;

        // Bounding box (wider for pan/zoom)
        const padding = 50;
        const limitWidth = width * 1.5;
        const limitHeight = height * 1.5;
        if (node.x < -limitWidth) { node.x = -limitWidth; node.vx *= -0.5; }
        if (node.x > limitWidth) { node.x = limitWidth; node.vx *= -0.5; }
        if (node.y < -limitHeight) { node.y = -limitHeight; node.vy *= -0.5; }
        if (node.y > limitHeight) { node.y = limitHeight; node.vy *= -0.5; }

        maxVelocity = Math.max(maxVelocity, Math.abs(node.vx) + Math.abs(node.vy));
      });

      const nextPositions: Record<string, { x: number; y: number }> = {};
      keys.forEach((key) => {
        nextPositions[key] = { x: initial[key].x, y: initial[key].y };
      });
      setPositions(nextPositions);

      ticks++;
      if (maxVelocity > 0.03 || ticks < 400 || draggedNode) {
        animationId = requestAnimationFrame(runSimulation);
      }
    };

    animationId = requestAnimationFrame(runSimulation);
    return () => cancelAnimationFrame(animationId);
  }, [graph, draggedNode]);

  // Canvas Interactions
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    setTransform(prev => {
      const newScale = Math.min(Math.max(0.2, prev.scale + delta), 4);
      return { ...prev, scale: newScale };
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as SVGElement).tagName !== "svg" && (e.target as SVGElement).tagName !== "g") return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    setSelectedNodeId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      }));
    } else if (draggedNode) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) - transform.x) / transform.scale;
      const y = ((e.clientY - rect.top) - transform.y) / transform.scale;

      setPositions(prev => ({
        ...prev,
        [draggedNode]: { x, y },
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNode(null);
  };

  // Node Interactions
  const handleNodeMouseDown = (nodeId: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
    setSelectedNodeId(nodeId);
  };

  const activeNode = hoveredNode || selectedNodeId;
  const isNodeConnected = (id: string) => {
    if (!activeNode) return true;
    if (id === activeNode) return true;
    return graph.edges.some(e => 
      (e.from === activeNode && e.to === id) || 
      (e.to === activeNode && e.from === id)
    );
  };

  const isEdgeConnected = (edge: FlowEdge) => {
    if (!activeNode) return true;
    return edge.from === activeNode || edge.to === activeNode;
  };

  return (
    <div className="relative rounded-3xl border border-white/[0.08] bg-black/50 p-0 backdrop-blur-2xl overflow-hidden select-none shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      {/* Tools Layer */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="flex flex-col bg-white/[0.05] border border-white/[0.1] rounded-xl backdrop-blur-md overflow-hidden">
          <button onClick={() => setTransform(p => ({ ...p, scale: Math.min(4, p.scale + 0.2) }))} className="p-2 hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Zoom In">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </button>
          <div className="h-px bg-white/[0.1]" />
          <button onClick={() => setTransform(p => ({ ...p, scale: Math.max(0.2, p.scale - 0.2) }))} className="p-2 hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Zoom Out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
          </button>
          <div className="h-px bg-white/[0.1]" />
          <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} className="p-2 hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Reset View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>
      </div>

      <svg 
        width="100%" 
        height={height}
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-full cursor-${isPanning ? 'grabbing' : 'grab'}`}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flow { to { stroke-dashoffset: -20; } }
          .edge-flow { stroke-dasharray: 6, 4; animation: flow 1s linear infinite; }
          .edge-flow-suspicious { stroke-dasharray: 4, 4; animation: flow 0.5s linear infinite; }
          .node-hoverable { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
          .node-hoverable:hover { transform: scale(1.15); cursor: pointer; }
          .node-dimmed { opacity: 0.15; filter: grayscale(100%); }
          .edge-dimmed { opacity: 0.1; }
        `}} />
        
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dynamic Transform Group */}
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          
          {/* Edges */}
          {(() => {
            // Pre-calculate edge offsets for pairs with multiple connections
            const edgeGroups: Record<string, FlowEdge[]> = {};
            graph.edges.forEach(edge => {
              const minNode = edge.from < edge.to ? edge.from : edge.to;
              const maxNode = edge.from < edge.to ? edge.to : edge.from;
              const key = `${minNode}-${maxNode}`;
              if (!edgeGroups[key]) edgeGroups[key] = [];
              edgeGroups[key].push(edge);
            });

            const edgeOffsets = new Map<FlowEdge, number>();
            Object.values(edgeGroups).forEach(group => {
              // Group by exact direction if we want, or just offset them all.
              // Offsetting them all avoids overlapping labels.
              group.forEach((edge, index) => {
                const sign = index % 2 === 0 ? 1 : -1;
                const magnitude = Math.ceil(index / 2);
                const offset = sign * magnitude * 35; // 35px spread per level
                edgeOffsets.set(edge, offset);
              });
            });

            return graph.edges.map((edge, i) => {
              const fromPos = positions[edge.from];
              const toPos = positions[edge.to];
              if (!fromPos || !toPos) return null;

              const style = getEdgeStyle(edge.edgeType, edge.isSuspicious);
              const isActive = isEdgeConnected(edge);
              const className = !isActive ? "edge-dimmed" : (edge.isSuspicious ? "edge-flow-suspicious" : "edge-flow");
              
              const strokeColor = isActive && activeNode ? (edge.isSuspicious ? "#FF3366" : "#FFFFFF") : style.stroke;
              const strokeWidth = isActive && activeNode ? style.strokeWidth + 1 : style.strokeWidth;

              // Calculate Curve Path
              const offset = edgeOffsets.get(edge) || 0;
              const dx = toPos.x - fromPos.x;
              const dy = toPos.y - fromPos.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const nx = -dy / dist;
              const ny = dx / dist;

              // Control point for quadratic bezier
              const cx = (fromPos.x + toPos.x) / 2 + nx * offset;
              const cy = (fromPos.y + toPos.y) / 2 + ny * offset;

              // Text position at curve peak (t=0.5)
              const textX = (fromPos.x + toPos.x) / 4 + cx / 2;
              const textY = (fromPos.y + toPos.y) / 4 + cy / 2;

              const d = `M ${fromPos.x} ${fromPos.y} Q ${cx} ${cy} ${toPos.x} ${toPos.y}`;

              return (
                <g key={i} className="transition-opacity duration-300">
                  {isActive && activeNode && (
                    <path d={d} fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 3} opacity={0.1} />
                  )}
                  <path
                    d={d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth + (edge.isSuspicious ? 1 : 0)}
                    className={className}
                  />
                  
                  {/* Edge Labels */}
                  {isActive && (
                    <g>
                      {edge.edgeType === "transfer" && parseFloat(edge.amount) > 0 && (
                        <text x={textX} y={textY - 8}
                          fill={edge.isSuspicious ? "#FF3366" : (activeNode ? "#FFFFFF" : "#525880")}
                          fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="bold"
                          filter={activeNode ? "url(#glow)" : ""}
                        >
                          {edge.amount} SUI
                        </text>
                      )}
                      {edge.edgeType !== "transfer" && (
                        <text x={textX} y={textY - 8}
                          fill={activeNode ? "#FFFFFF" : style.stroke}
                          fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="bold"
                          opacity={activeNode ? 1 : 0.8}
                        >
                          {edge.edgeType.replace("_", " ")}
                        </text>
                      )}
                    </g>
                  )}
                </g>
              );
            });
          })()}

          {/* Nodes */}
          {graph.nodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;

            const isOrigin = node.isOrigin;
            const isProtocol = node.nodeType === "protocol";
            const color = getNodeColor(node);
            const shape = getNodeShape(node.nodeType);
            
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNode === node.id;
            const isActive = isNodeConnected(node.id);

            const baseSize = isOrigin ? 24 : isProtocol ? 18 : 14;
            const nodeSize = (isSelected || isHovered) ? baseSize * 1.2 : baseSize;

            return (
              <g 
                key={node.id}
                onMouseDown={handleNodeMouseDown(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className={`node-hoverable ${!isActive ? 'node-dimmed' : ''}`}
                style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
              >
                {/* Selection / Hover Glow Ring */}
                {(isSelected || isHovered || isOrigin) && (
                  <circle cx={pos.x} cy={pos.y} r={nodeSize + 12}
                    fill="none" stroke={color} strokeWidth={isSelected ? 3 : 1.5}
                    opacity={isSelected ? 0.6 : 0.3}
                    filter="url(#glow-strong)"
                    className={isSelected ? "animate-pulse" : ""}
                  />
                )}

                {/* Node shape */}
                {shape === "diamond" ? (
                  <rect
                    x={pos.x - nodeSize * 0.8} y={pos.y - nodeSize * 0.8}
                    width={nodeSize * 1.6} height={nodeSize * 1.6}
                    transform={`rotate(45 ${pos.x} ${pos.y})`}
                    fill={isProtocol ? `${color}20` : `${color}15`}
                    stroke={color} strokeWidth={isSelected ? 4 : 2.5} rx={3}
                    filter={isSelected ? "url(#glow)" : ""}
                  />
                ) : (
                  <>
                    <circle cx={pos.x} cy={pos.y} r={nodeSize}
                      fill={`${color}20`}
                      stroke={color} strokeWidth={isSelected ? 4 : 2.5}
                      filter={isSelected ? "url(#glow)" : ""}
                    />
                    <circle cx={pos.x} cy={pos.y} r={nodeSize * 0.35} fill={color} />
                  </>
                )}

                {shape === "diamond" && <circle cx={pos.x} cy={pos.y} r={3} fill={color} />}

                {/* Labels - Only show if active or no selection */}
                {isActive && (
                  <g className="pointer-events-none">
                    {/* Background pill for text for better readability */}
                    <rect 
                      x={pos.x - 45} y={pos.y + nodeSize + 8} width="90" height="18" rx="9" 
                      fill="rgba(0,0,0,0.6)" className="backdrop-blur-sm"
                    />
                    <text x={pos.x} y={pos.y + nodeSize + 20}
                      fill={isProtocol ? "#00E5FF" : (isSelected ? "#FFF" : "#8B93C4")}
                      fontSize={isProtocol || isSelected ? "11" : "10"} textAnchor="middle" 
                      fontFamily="JetBrains Mono, monospace" fontWeight={isProtocol || isOrigin || isSelected ? "bold" : "normal"}
                    >
                      {node.label || `${node.address.slice(0, 6)}...${node.address.slice(-4)}`}
                    </text>
                    
                    {(isSelected || isHovered) && (
                      <text x={pos.x} y={pos.y - nodeSize - 12}
                        fill={color} fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="bold"
                      >
                        {isProtocol ? (node.protocolInfo?.verified ? "✓ Verified" : "Unverified") : `Risk: ${node.riskScore}/100`}
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Selected Node Details Panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 w-72 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-5 shadow-2xl animate-in slide-in-from-right-4 fade-in duration-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-display text-white font-bold text-lg">Node Details</h3>
            <button onClick={() => setSelectedNodeId(null)} className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-xs text-white/40 mb-1 uppercase tracking-wider font-bold">Address</div>
              <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2 border border-white/[0.05]">
                <code className="text-xs text-white/80 font-mono flex-1 truncate">{selectedNode.address}</code>
                <button onClick={() => navigator.clipboard.writeText(selectedNode.address)} className="text-white/40 hover:text-cyan-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                <div className="text-[10px] text-white/40 mb-1 uppercase tracking-wider font-bold">Type</div>
                <div className="text-sm font-semibold text-white capitalize">{selectedNode.nodeType}</div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                <div className="text-[10px] text-white/40 mb-1 uppercase tracking-wider font-bold">Transactions</div>
                <div className="text-sm font-semibold text-white">{selectedNode.txCount}</div>
              </div>
              
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05] col-span-2">
                <div className="text-[10px] text-white/40 mb-1 uppercase tracking-wider font-bold">Risk Assessment</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${selectedNode.riskScore}%`, backgroundColor: getNodeColor(selectedNode) }} />
                  </div>
                  <div className="text-sm font-bold font-mono" style={{ color: getNodeColor(selectedNode) }}>
                    {selectedNode.riskScore}/100
                  </div>
                </div>
                <div className="text-xs mt-2 capitalize font-semibold" style={{ color: getNodeColor(selectedNode) }}>
                  {selectedNode.riskLevel} Risk
                </div>
              </div>

              {selectedNode.protocolInfo && (
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05] col-span-2">
                  <div className="text-[10px] text-white/40 mb-1 uppercase tracking-wider font-bold">Protocol Info</div>
                  <div className="text-sm font-semibold text-cyan-400 mb-1">{selectedNode.protocolInfo.name} ({selectedNode.protocolInfo.type})</div>
                  <div className="text-xs flex items-center gap-1">
                    {selectedNode.protocolInfo.verified ? (
                      <span className="text-emerald-400 flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg> Verified Contract</span>
                    ) : (
                      <span className="text-purple-400 flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10.29 3.86 8.5 8.5a2 2 0 0 1 0 2.83l-5.66 5.66a2 2 0 0 1-2.83 0l-8.5-8.5A2 2 0 0 1 1 11.02V5a2 2 0 0 1 2-2h6.02a2 2 0 0 1 1.27.86z"/><line x1="7" y1="7" x2="7" y2="7"/></svg> Unverified Contract</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={() => setSelectedNodeId(null)} className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white/70 transition-colors border border-white/10">
              Close Detail
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pattern Card ─────────────────────────────────────────

function PatternCard({ pattern }: { pattern: SuspiciousPattern }) {
  const iconMap: Record<string, string> = {
    mixer: "🔄",
    funnel: "🔻",
    scatter: "💫",
    circular: "🔁",
    sybil: "👥",
    rapid_drain: "💸",
    dusting: "🧹",
    peel_chain: "🔗",
    unverified_contract: "🚨",
    nft_wash_trade: "🎭",
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] hover:border-white/[0.1] transition-all">
      <div className="text-xl">{iconMap[pattern.type] || "⚠️"}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-semibold" style={{ color: getSeverityColor(pattern.severity) }}>
            {pattern.type.replace(/_/g, " ").toUpperCase()}
          </span>
          <span className="text-[10px] text-white/20">
            Confidence: {pattern.confidence}%
          </span>
        </div>
        <p className="text-xs text-white/40 leading-relaxed">{pattern.description}</p>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────

export default function TrustGraphPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [graph, setGraph] = useState<FlowGraph | null>(null);
  const [behavioral, setBehavioral] = useState<BehavioralPattern[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [depth, setDepth] = useState(2);
  const [maxNodes, setMaxNodes] = useState(50);

  const handleAnalyze = useCallback(async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    setGraph(null);
    setBehavioral(null);

    try {
      const res = await fetch("/api/fund-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim(), depth, maxNodes }),
      });

      if (!res.ok) throw new Error(`Analysis failed: ${res.status}`);

      const data = await res.json();
      setGraph(data.flowGraph);
      setBehavioral(data.behavioral?.patterns || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [address, depth, maxNodes]);

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-gradient-to-bl from-white/[0.04] via-magenta-500/5 to-transparent rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[30%] w-[400px] h-[400px] bg-gradient-to-t from-white/[0.04] via-transparent to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="border-b border-white/[0.06] bg-black/40 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/30 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/logo.png" alt="SuiShield" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]" />
              </div>
              <div>
                <div className="text-white font-display font-semibold text-sm">SuiShield</div>
                <div className="text-white/20 text-[11px]">Trust Graph</div>
              </div>
            </div>
          </div>
          <DualWalletButton />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 py-8 space-y-6">
        {/* Page Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-white/[0.04] to-white/[0.04] border border-white/[0.06] text-xs">
            <GitBranch className="w-3 h-3 text-white/50" />
            <span className="text-white/50 font-bold uppercase tracking-widest">Fund Flow Analysis</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">
            Trust <span className="text-white/50">Graph</span>
          </h1>
          <p className="text-white/30 text-sm max-w-md">
            Trace fund flow patterns, detect suspicious clusters, and visualize address relationships.
          </p>
        </div>

        {/* Input */}
        <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-magenta-500/[0.02] p-5 backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-white/50" />
            <span className="text-white font-display font-semibold text-sm">Trace Fund Flow</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Paste Sui address to trace..."
              className="flex-1 bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-magenta-500/40 transition-colors font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !address.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-magenta-400 to-magenta-500 text-white font-bold hover:from-magenta-300 hover:to-magenta-400 transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
              Trace
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1 flex items-center gap-3 bg-black/40 border border-white/[0.06] rounded-xl px-4 py-2.5">
              <span className="text-xs text-white/50 font-semibold uppercase tracking-wider w-24">Max Nodes</span>
              <input 
                type="range" min="10" max="150" step="10" 
                value={maxNodes} 
                onChange={e => setMaxNodes(parseInt(e.target.value))} 
                className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 cursor-pointer" 
              />
              <span className="text-sm text-cyan-400 font-bold w-8 text-right font-mono">{maxNodes}</span>
            </div>
            <div className="flex-1 flex items-center gap-3 bg-black/40 border border-white/[0.06] rounded-xl px-4 py-2.5">
              <span className="text-xs text-white/50 font-semibold uppercase tracking-wider w-24">Trace Depth</span>
              <input 
                type="range" min="1" max="4" step="1" 
                value={depth} 
                onChange={e => setDepth(parseInt(e.target.value))} 
                className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-magenta-400 cursor-pointer" 
              />
              <span className="text-sm text-magenta-400 font-bold w-8 text-right font-mono">{depth}</span>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-magenta-500/20 to-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
            </div>
            <p className="text-white text-sm">Tracing fund flow...</p>
            <p className="text-white/20 text-xs">Analyzing transactions via Tatum Sui RPC</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-5 text-center backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            <p className="text-white/50 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {graph && (
          <div className="space-y-6">
            {/* Risk Summary */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Overall Risk", value: `${graph.riskSummary.overallRisk}/100`, color: getRiskColor(graph.riskSummary.overallRisk), gradient: "from-white/[0.04] to-white/[0.02]" },
                { label: "Addresses", value: graph.riskSummary.uniqueAddresses.toString(), color: "#FFFFFF", gradient: "from-white/[0.04] to-white/[0.02]" },
                { label: "Flagged", value: graph.riskSummary.flaggedAddresses.toString(), color: "#FF3366", gradient: "from-white/[0.04] to-white/[0.02]" },
                { label: "Volume", value: graph.riskSummary.totalVolume, color: "#00E5FF", gradient: "from-white/[0.04] to-white/[0.02]" },
              ].map(({ label, value, color, gradient }) => (
                <div key={label} className={`relative rounded-2xl border border-white/[0.06] bg-gradient-to-br ${gradient} p-4 backdrop-blur-xl overflow-hidden`}>
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                  <div className="text-white/30 text-xs mb-1">{label}</div>
                  <div className="font-display font-bold text-2xl" style={{ color }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Graph Visualization */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-white/50" />
                <span className="text-white font-display font-semibold text-sm">Trust Graph</span>
              </div>
              <TrustGraphViz graph={graph} />
            </div>

            {/* Suspicious Patterns */}
            {graph.suspiciousPatterns.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-white/50" />
                  <span className="text-white font-display font-semibold text-sm">
                    Suspicious Patterns ({graph.suspiciousPatterns.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {graph.suspiciousPatterns.map((pattern, i) => (
                    <PatternCard key={i} pattern={pattern} />
                  ))}
                </div>
              </div>
            )}

            {/* Behavioral Patterns */}
            {behavioral && behavioral.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-white/50" />
                  <span className="text-white font-display font-semibold text-sm">Behavioral Analysis</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {behavioral.map((pattern, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] hover:border-white/[0.1] transition-all">
                      {pattern.detected ? (
                        <AlertTriangle className="w-4 h-4 text-white/50 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-white/80 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="text-xs font-mono text-white/40">{pattern.type.replace(/_/g, " ")}</div>
                        <div className="text-xs text-white/20 mt-0.5">{pattern.description}</div>
                      </div>
                      {pattern.detected && (
                        <span className="text-[10px] text-white/50">{pattern.confidence}%</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-4 backdrop-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">Legend</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {/* Node Types */}
                <div className="text-white/30 text-[10px] font-bold uppercase tracking-wider col-span-2 mt-1 mb-0.5">Nodes</div>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-3 h-3 rounded-full" style={{ background: "#00FF9D" }} /> Safe Wallet</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-3 h-3 rounded-full" style={{ background: "#FFB300" }} /> Medium Risk</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-3 h-3 rounded-full" style={{ background: "#FF3366" }} /> High Risk</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-3 h-3 rounded-full border-2 border-cyan-400" /> Origin</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-3 h-3 rotate-45 rounded-sm" style={{ background: "rgba(0,229,255,0.3)", border: "1.5px solid #00E5FF" }} /> Verified Protocol</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-3 h-3 rotate-45 rounded-sm" style={{ background: "rgba(168,85,247,0.3)", border: "1.5px solid #A855F7" }} /> Unverified Contract</span>

                {/* Edge Types */}
                <div className="text-white/30 text-[10px] font-bold uppercase tracking-wider col-span-2 mt-2 mb-0.5">Connections</div>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-6 h-0.5" style={{ background: "rgba(0,229,255,0.4)" }} /> Transfer</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: "rgba(168,85,247,0.6)" }} /> Contract Call</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-6 h-0.5" style={{ background: "rgba(0,255,157,0.5)" }} /> Swap</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: "rgba(255,179,0,0.5)" }} /> Stake</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: "rgba(255,107,0,0.5)" }} /> NFT Transfer</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-6 h-0.5 border-t-2 border-dashed border-magenta-400" /> Suspicious</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
