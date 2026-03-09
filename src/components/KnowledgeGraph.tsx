import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface KnowledgeGraphProps {
  data?: any;
  className?: string;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data, className }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%");

    svg.selectAll("*").remove();

    const nodes = [
      { id: "MRI", group: 1 },
      { id: "Quantum Sensors", group: 2 },
      { id: "Superconductivity", group: 2 },
      { id: "Signal Processing", group: 3 },
      { id: "Biomimicry", group: 4 },
      { id: "Nano-fluidics", group: 4 },
      { id: "Robotics", group: 5 },
      { id: "Neural Interface", group: 5 },
    ];

    const links = [
      { source: "MRI", target: "Quantum Sensors" },
      { source: "MRI", target: "Superconductivity" },
      { source: "Quantum Sensors", target: "Signal Processing" },
      { source: "Biomimicry", target: "Robotics" },
      { source: "Robotics", target: "Neural Interface" },
      { source: "Neural Interface", target: "Signal Processing" },
    ];

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-width", 1.5)
      .selectAll("line")
      .data(links)
      .join("line");

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 8)
      .attr("fill", (d: any) => {
        const colors = ["#0ea5e9", "#14b8a6", "#8b5cf6", "#f43f5e", "#eab308"];
        return colors[d.group - 1] || "#fff";
      })
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("title").text((d: any) => d.id);

    const labels = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d: any) => d.id)
      .attr("font-size", "10px")
      .attr("fill", "rgba(255,255,255,0.7)")
      .attr("dx", 12)
      .attr("dy", 4);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className={cn("w-full h-full min-h-[400px] glass-panel overflow-hidden", className)}>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

import { cn } from '../lib/utils';
export default KnowledgeGraph;
