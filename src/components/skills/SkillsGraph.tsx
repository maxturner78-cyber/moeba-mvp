import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { getNodeRadius, getNodeStatus, type SkillNode, type SkillEdge } from "@/data/skillsData";

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  proficiency: number;
  cluster: string;
  promotionRequired?: boolean;
  radius: number;
  status: "developed" | "developing" | "seed" | "promotion";
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: SimNode | string;
  target: SimNode | string;
}

const clusterCenters: Record<string, { x: number; y: number }> = {
  core: { x: 0, y: 0 },
  audit: { x: 180, y: -120 },
  client: { x: -200, y: -100 },
  tax: { x: 200, y: 160 },
  compliance: { x: -180, y: 140 },
};

interface Props {
  nodes: SkillNode[];
  edges: SkillEdge[];
}

const SkillsGraph: React.FC<Props> = ({ nodes: inputNodes, edges: inputEdges }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    node: SimNode;
  } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dimensionsRef = useRef({ width: 900, height: 600 });

  const buildSimNodes = useCallback((snapshotNodes: SkillNode[]) => {
    const nodes: SimNode[] = snapshotNodes.map((n) => ({
      id: n.id,
      label: n.label,
      proficiency: n.proficiency,
      cluster: n.cluster,
      promotionRequired: n.promotionRequired,
      radius: getNodeRadius(n.proficiency, n.promotionRequired),
      status: getNodeStatus(n),
      x: dimensionsRef.current.width / 2 + (clusterCenters[n.cluster]?.x ?? 0) + (Math.random() - 0.5) * 40,
      y: dimensionsRef.current.height / 2 + (clusterCenters[n.cluster]?.y ?? 0) + (Math.random() - 0.5) * 40,
    }));
    return nodes;
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const width = rect.width || 900;
    const height = rect.height || 600;
    dimensionsRef.current = { width, height };

    const nodes = buildSimNodes(inputNodes);
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const links: SimLink[] = inputEdges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({ source: e.source, target: e.target }));

    // Clear
    const sel = d3.select(svg);
    sel.selectAll("*").remove();

    const g = sel.append("g");

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    sel.call(zoom);
    sel.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85).translate(-width / 2, -height / 2));

    // Links
    const linkSel = g
      .append("g")
      .selectAll<SVGLineElement, SimLink>("line")
      .data(links)
      .join("line")
      .attr("stroke", "#E5E5E5")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.6);

    // Node groups
    const nodeSel = g
      .append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(nodes, (d) => d.id)
      .join("g")
      .attr("cursor", "pointer")
      .call(
        d3.drag<SVGGElement, SimNode>()
          .on("start", (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) sim.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Draw circles
    nodeSel.each(function (d) {
      const el = d3.select(this);
      if (d.status === "seed") {
        // Subtle fill + stronger border so "not started" is clearly visible
        el.append("circle")
          .attr("r", d.radius)
          .attr("fill", "#F3F4F6")
          .attr("stroke", "#9CA3AF")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "4 3");
        // Plus icon to signal "to learn"
        el.append("line").attr("x1", -4).attr("y1", 0).attr("x2", 4).attr("y2", 0)
          .attr("stroke", "#9CA3AF").attr("stroke-width", 1.5).attr("stroke-linecap", "round");
        el.append("line").attr("x1", 0).attr("y1", -4).attr("x2", 0).attr("y2", 4)
          .attr("stroke", "#9CA3AF").attr("stroke-width", 1.5).attr("stroke-linecap", "round");
      } else if (d.status === "promotion") {
        // Amber fill + bold border — these are high-priority learning targets
        el.append("circle")
          .attr("r", d.radius)
          .attr("fill", "#FEF3C7")
          .attr("stroke", "#F59E0B")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5 3");
        // Star/asterisk to signal "priority"
        const s = 4;
        el.append("line").attr("x1", -s).attr("y1", 0).attr("x2", s).attr("y2", 0)
          .attr("stroke", "#F59E0B").attr("stroke-width", 1.5).attr("stroke-linecap", "round");
        el.append("line").attr("x1", 0).attr("y1", -s).attr("x2", 0).attr("y2", s)
          .attr("stroke", "#F59E0B").attr("stroke-width", 1.5).attr("stroke-linecap", "round");
        el.append("line").attr("x1", -3).attr("y1", -3).attr("x2", 3).attr("y2", 3)
          .attr("stroke", "#F59E0B").attr("stroke-width", 1.2).attr("stroke-linecap", "round");
        el.append("line").attr("x1", 3).attr("y1", -3).attr("x2", -3).attr("y2", 3)
          .attr("stroke", "#F59E0B").attr("stroke-width", 1.2).attr("stroke-linecap", "round");
      } else if (d.status === "developing") {
        el.append("circle")
          .attr("r", d.radius)
          .attr("fill", "#22C55E")
          .attr("fill-opacity", 0.5)
          .attr("stroke", "#22C55E")
          .attr("stroke-width", 1)
          .attr("stroke-opacity", 0.3);
      } else {
        // developed
        el.append("circle")
          .attr("r", d.radius)
          .attr("fill", "#22C55E")
          .attr("stroke", "#FFFFFF")
          .attr("stroke-width", 2);
      }
    });

    // Labels — always show for seed/promotion nodes (learning targets), size-gated for others
    nodeSel
      .append("text")
      .text((d) => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.radius + 14)
      .attr("font-size", (d) => (d.status === "promotion" ? 11.5 : 11))
      .attr("font-weight", (d) => (d.status === "promotion" ? 600 : 400))
      .attr("font-family", "Inter, sans-serif")
      .attr("fill", (d) => {
        if (d.status === "promotion") return "#6B7280";
        if (d.status === "seed") return "#6B7280";
        return d.radius > 14 ? "#374151" : "#6B7280";
      })
      .attr("opacity", (d) => {
        if (d.status === "promotion" || d.status === "seed") return 1;
        return d.radius > 10 ? 1 : 0;
      })
      .attr("class", "label-text")
      .attr("pointer-events", "none");

    // Hover handlers
    nodeSel
      .on("mouseenter", function (event, d) {
        setHoveredId(d.id);

        // Highlight connections
        const connectedIds = new Set<string>();
        connectedIds.add(d.id);
        links.forEach((l) => {
          const sId = typeof l.source === "string" ? l.source : (l.source as SimNode).id;
          const tId = typeof l.target === "string" ? l.target : (l.target as SimNode).id;
          if (sId === d.id) connectedIds.add(tId);
          if (tId === d.id) connectedIds.add(sId);
        });

        linkSel
          .attr("stroke", (l) => {
            const sId = typeof l.source === "string" ? l.source : (l.source as SimNode).id;
            const tId = typeof l.target === "string" ? l.target : (l.target as SimNode).id;
            return sId === d.id || tId === d.id ? "#9CA3AF" : "#E5E5E5";
          })
          .attr("stroke-width", (l) => {
            const sId = typeof l.source === "string" ? l.source : (l.source as SimNode).id;
            const tId = typeof l.target === "string" ? l.target : (l.target as SimNode).id;
            return sId === d.id || tId === d.id ? 1.5 : 1;
          })
          .attr("stroke-opacity", (l) => {
            const sId = typeof l.source === "string" ? l.source : (l.source as SimNode).id;
            const tId = typeof l.target === "string" ? l.target : (l.target as SimNode).id;
            return sId === d.id || tId === d.id ? 1 : 0.2;
          });

        // Scale up hovered node
        d3.select(this).select("circle").transition().duration(150).attr("r", d.radius * 1.15);

        // Show labels for connected nodes
        nodeSel.selectAll<SVGTextElement, SimNode>(".label-text")
          .attr("opacity", (nd) => connectedIds.has(nd.id) ? 1 : (nd.radius > 10 ? 0.3 : 0));

        // Tooltip
        const svgRect = svg.getBoundingClientRect();
        setTooltip({
          x: event.clientX - svgRect.left,
          y: event.clientY - svgRect.top - 10,
          node: d,
        });
      })
      .on("mousemove", (event) => {
        const svgRect = svg.getBoundingClientRect();
        setTooltip((prev) =>
          prev ? { ...prev, x: event.clientX - svgRect.left, y: event.clientY - svgRect.top - 10 } : null
        );
      })
      .on("mouseleave", function (_event, d) {
        setHoveredId(null);
        linkSel.attr("stroke", "#E5E5E5").attr("stroke-width", 1).attr("stroke-opacity", 0.6);
        d3.select(this).select("circle").transition().duration(150).attr("r", d.radius);
        nodeSel.selectAll<SVGTextElement, SimNode>(".label-text")
          .attr("opacity", (nd) => (nd.radius > 10 ? 1 : 0));
        setTooltip(null);
      });

    // Simulation
    const sim = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        "link",
        d3.forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(80).strength(0.3)
      )
      .force("charge", d3.forceManyBody<SimNode>().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<SimNode>().radius((d) => d.radius + 15))
      .force("cluster", (alpha: number) => {
        nodes.forEach((d) => {
          const center = clusterCenters[d.cluster];
          const cx = width / 2 + center.x;
          const cy = height / 2 + center.y;
          d.vx! += (cx - d.x!) * alpha * 0.04;
          d.vy! += (cy - d.y!) * alpha * 0.04;
        });
      })
      .alpha(0.8)
      .alphaDecay(0.02)
      .on("tick", () => {
        linkSel
          .attr("x1", (d) => (d.source as SimNode).x!)
          .attr("y1", (d) => (d.source as SimNode).y!)
          .attr("x2", (d) => (d.target as SimNode).x!)
          .attr("y2", (d) => (d.target as SimNode).y!);
        nodeSel.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });

    simRef.current = sim;

    return () => {
      sim.stop();
    };
  }, [month, buildSimNodes]);

  const clusterLabels: Record<string, string> = {
    core: "Core Behavioural",
    audit: "Audit",
    client: "Client",
    tax: "Tax",
    compliance: "Compliance",
  };

  const statusLabels: Record<string, string> = {
    developed: "Developed",
    developing: "Developing",
    seed: "Not started",
    promotion: "Required for promotion",
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 12,
            top: tooltip.y - 60,
            background: "#111111",
            borderRadius: 8,
            padding: "12px 16px",
            pointerEvents: "none",
            zIndex: 20,
            minWidth: 180,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", marginBottom: 6 }}>
            {tooltip.node.label}
          </div>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Proficiency</span>
            <span
              className="font-mono-data"
              style={{ fontSize: 13, color: "#FFFFFF", fontWeight: 500 }}
            >
              {tooltip.node.proficiency > 0 ? `${tooltip.node.proficiency}/10` : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Status</span>
            <span style={{ fontSize: 11, color: "#FFFFFF" }}>
              {statusLabels[tooltip.node.status]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Cluster</span>
            <span style={{ fontSize: 11, color: "#FFFFFF" }}>
              {clusterLabels[tooltip.node.cluster] || tooltip.node.cluster}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsGraph;
