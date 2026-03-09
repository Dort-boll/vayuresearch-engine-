import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { cn } from '../lib/utils';

interface KnowledgeGraphProps {
  data?: any;
  className?: string;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data, className }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    let width = containerRef.current.clientWidth || 800;
    let height = containerRef.current.clientHeight || 600;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%");

    svg.selectAll("*").remove();

    // Add a container for zooming
    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const nodes = data?.nodes || [
      { id: "MRI", group: 1, val: 15 },
      { id: "Quantum Sensors", group: 2, val: 10 },
      { id: "Superconductivity", group: 2, val: 10 },
      { id: "Signal Processing", group: 3, val: 12 },
      { id: "Biomimicry", group: 4, val: 8 },
      { id: "Nano-fluidics", group: 4, val: 8 },
      { id: "Robotics", group: 5, val: 14 },
      { id: "Neural Interface", group: 5, val: 14 },
    ];

    const links = data?.links || [
      { source: "MRI", target: "Quantum Sensors", value: 2 },
      { source: "MRI", target: "Superconductivity", value: 2 },
      { source: "Quantum Sensors", target: "Signal Processing", value: 1 },
      { source: "Biomimicry", target: "Robotics", value: 1 },
      { source: "Robotics", target: "Neural Interface", value: 3 },
      { source: "Neural Interface", target: "Signal Processing", value: 3 },
    ];

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    const link = g.append("g")
      .attr("stroke", "rgba(255,255,255,0.15)")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value || 1) * 1.5);

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", (d: any) => d.val || 10)
      .attr("fill", (d: any) => {
        const colors = ["#0ea5e9", "#14b8a6", "#8b5cf6", "#f43f5e", "#eab308", "#10b981"];
        return colors[d.group - 1] || "#fff";
      })
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 0 5px rgba(255,255,255,0.1))");

    node.append("text")
      .text((d: any) => d.id)
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .attr("fill", "rgba(255,255,255,0.9)")
      .attr("dx", (d: any) => (d.val || 10) + 5)
      .attr("dy", 4)
      .style("pointer-events", "none");

    node.append("title").text((d: any) => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
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

    const resizeObserver = new ResizeObserver(entries => {
      if (!entries[0]) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
      simulation.alpha(0.3).restart();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      simulation.stop();
      resizeObserver.disconnect();
    };
  }, [data]);

  return (
    <div ref={containerRef} className={cn("w-full h-full min-h-[400px] glass-panel overflow-hidden", className)}>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default KnowledgeGraph;
