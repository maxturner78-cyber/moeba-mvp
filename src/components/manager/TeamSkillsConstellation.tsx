import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { teamGraduates, statusColors } from "@/data/teamData";
import { getSnapshot, getNodeRadius, getNodeStatus, type SkillNode } from "@/data/skillsData";
import { ArrowLeft, Users } from "lucide-react";
import SkillsGraph from "@/components/skills/SkillsGraph";

/* ── Per-graduate skill snapshots with slight variation ── */
const gradSkillMonths: Record<string, number> = {
  g1: 3, g2: 3, g3: 2, g4: 3, g5: 2, g6: 3,
};

/* Skill summary per grad for the team-level tooltip */
function getGradSkillSummary(gradId: string) {
  const month = gradSkillMonths[gradId] || 3;
  const snap = getSnapshot(month);
  const developed = snap.nodes.filter((n) => n.proficiency > 6).length;
  const developing = snap.nodes.filter((n) => n.proficiency > 0 && n.proficiency <= 6).length;
  const notStarted = snap.nodes.filter((n) => n.proficiency === 0).length;
  const avgProf = snap.nodes.length
    ? snap.nodes.reduce((s, n) => s + n.proficiency, 0) / snap.nodes.length
    : 0;
  return { developed, developing, notStarted, avgProf, total: snap.nodes.length };
}

/* ── Cluster layout for the team view ── */
interface TeamSimNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  initials: string;
  role: string;
  week: number;
  status: string;
  radius: number;
  summary: ReturnType<typeof getGradSkillSummary>;
}

const TeamSkillsConstellation: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedGrad, setSelectedGrad] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: TeamSimNode } | null>(null);

  useEffect(() => {
    if (selectedGrad) return;
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 560;

    const nodes: TeamSimNode[] = teamGraduates.map((g) => {
      const summary = getGradSkillSummary(g.id);
      const baseRadius = 28 + (summary.avgProf / 10) * 20;
      return {
        id: g.id,
        name: g.name,
        initials: g.initials,
        role: g.role,
        week: g.week,
        status: g.status,
        radius: baseRadius,
        summary,
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 200,
      };
    });

    // Create links between all grads (subtle connections)
    type TeamLink = d3.SimulationLinkDatum<TeamSimNode>;
    const links: TeamLink[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        links.push({ source: nodes[i], target: nodes[j] });
      }
    }

    const sel = d3.select(svg);
    sel.selectAll("*").remove();

    // Defs for gradients
    const defs = sel.append("defs");
    teamGraduates.forEach((g) => {
      const colors = statusColors[g.status];
      const grad = defs.append("radialGradient").attr("id", `team-grad-${g.id}`);
      grad.append("stop").attr("offset", "0%").attr("stop-color", colors.line).attr("stop-opacity", 0.9);
      grad.append("stop").attr("offset", "100%").attr("stop-color", colors.line).attr("stop-opacity", 0.5);
    });

    const g = sel.append("g");

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => g.attr("transform", event.transform));
    sel.call(zoom);
    sel.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));

    // Links
    const linkSel = g.append("g")
      .selectAll<SVGLineElement, TeamLink>("line")
      .data(links)
      .join("line")
      .attr("stroke", "#E5E5E5")
      .attr("stroke-width", 0.5)
      .attr("stroke-opacity", 0.3);

    // Nodes
    const nodeSel = g.append("g")
      .selectAll<SVGGElement, TeamSimNode>("g")
      .data(nodes, (d) => d.id)
      .join("g")
      .attr("cursor", "pointer");

    // Outer ring showing skill breakdown
    nodeSel.each(function (d) {
      const el = d3.select(this);
      const colors = statusColors[d.status];

      // Subtle outer glow
      el.append("circle")
        .attr("r", d.radius + 6)
        .attr("fill", "none")
        .attr("stroke", colors.line)
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.15);

      // Main circle
      el.append("circle")
        .attr("r", d.radius)
        .attr("fill", `url(#team-grad-${d.id})`)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2.5)
        .attr("class", "main-circle");

      // Skill breakdown ring (developed arc)
      const total = d.summary.total || 1;
      const devAngle = (d.summary.developed / total) * Math.PI * 2;
      const devingAngle = (d.summary.developing / total) * Math.PI * 2;

      const arc = d3.arc<any, any>().innerRadius(d.radius + 2).outerRadius(d.radius + 5);

      if (devAngle > 0) {
        el.append("path")
          .attr("d", arc({ startAngle: 0, endAngle: devAngle }))
          .attr("fill", "#22C55E")
          .attr("opacity", 0.7);
      }
      if (devingAngle > 0) {
        el.append("path")
          .attr("d", arc({ startAngle: devAngle, endAngle: devAngle + devingAngle }))
          .attr("fill", "#F59E0B")
          .attr("opacity", 0.5);
      }
      if (total - d.summary.developed - d.summary.developing > 0) {
        const notStartedAngle = ((total - d.summary.developed - d.summary.developing) / total) * Math.PI * 2;
        el.append("path")
          .attr("d", arc({ startAngle: devAngle + devingAngle, endAngle: devAngle + devingAngle + notStartedAngle }))
          .attr("fill", "#D1D5DB")
          .attr("opacity", 0.4);
      }

      // Initials
      el.append("text")
        .text(d.initials)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-size", d.radius > 36 ? 16 : 14)
        .attr("font-weight", 600)
        .attr("fill", "#fff")
        .attr("pointer-events", "none");

      // Name label below
      el.append("text")
        .text(d.name.split(" ")[0])
        .attr("text-anchor", "middle")
        .attr("dy", d.radius + 20)
        .attr("font-size", 12)
        .attr("font-weight", 500)
        .attr("fill", "#374151")
        .attr("pointer-events", "none");

      // Week label
      el.append("text")
        .text(`Week ${d.week}`)
        .attr("text-anchor", "middle")
        .attr("dy", d.radius + 34)
        .attr("font-size", 10)
        .attr("fill", "#9CA3AF")
        .attr("pointer-events", "none");
    });

    // Hover
    nodeSel
      .on("mouseenter", function (event, d) {
        d3.select(this).select(".main-circle").transition().duration(150).attr("r", d.radius * 1.1);
        linkSel.attr("stroke-opacity", (l: any) => {
          const s = typeof l.source === "string" ? l.source : l.source.id;
          const t = typeof l.target === "string" ? l.target : l.target.id;
          return s === d.id || t === d.id ? 0.4 : 0.05;
        }).attr("stroke-width", (l: any) => {
          const s = typeof l.source === "string" ? l.source : l.source.id;
          const t = typeof l.target === "string" ? l.target : l.target.id;
          return s === d.id || t === d.id ? 1 : 0.5;
        });
        const svgRect = svg.getBoundingClientRect();
        setTooltip({ x: event.clientX - svgRect.left, y: event.clientY - svgRect.top - 10, node: d });
      })
      .on("mousemove", (event) => {
        const svgRect = svg.getBoundingClientRect();
        setTooltip((prev) => prev ? { ...prev, x: event.clientX - svgRect.left, y: event.clientY - svgRect.top - 10 } : null);
      })
      .on("mouseleave", function (_event, d) {
        d3.select(this).select(".main-circle").transition().duration(150).attr("r", d.radius);
        linkSel.attr("stroke-opacity", 0.3).attr("stroke-width", 0.5);
        setTooltip(null);
      })
      .on("click", (_event, d) => {
        setTooltip(null);
        setSelectedGrad(d.id);
      });

    // Simulation
    const sim = d3.forceSimulation<TeamSimNode>(nodes)
      .force("link", d3.forceLink<TeamSimNode, TeamLink>(links).id((d) => d.id).distance(160).strength(0.05))
      .force("charge", d3.forceManyBody<TeamSimNode>().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<TeamSimNode>().radius((d) => d.radius + 24))
      .alpha(0.8)
      .alphaDecay(0.03)
      .on("tick", () => {
        linkSel
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);
        nodeSel.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });

    // Drag
    nodeSel.call(
      d3.drag<SVGGElement, TeamSimNode>()
        .on("start", (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on("end", (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
    );

    return () => { sim.stop(); };
  }, [selectedGrad]);

  const selectedGradData = selectedGrad ? teamGraduates.find((g) => g.id === selectedGrad) : null;

  if (selectedGrad && selectedGradData) {
    const month = gradSkillMonths[selectedGrad] || 3;
    return (
      <div>
        <button
          onClick={() => setSelectedGrad(null)}
          className="flex items-center gap-2 mb-4"
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, color: "#6B7280", padding: "4px 0",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#111"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#6B7280"; }}
        >
          <ArrowLeft size={16} />
          Back to Team Constellation
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: statusColors[selectedGradData.status].line,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 14, fontWeight: 600,
            }}
          >
            {selectedGradData.initials}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#111" }}>{selectedGradData.name}</div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>{selectedGradData.role} · Week {selectedGradData.week}</div>
          </div>
        </div>

        <div style={{ height: 500, borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", background: "#fff" }}>
          <SkillsGraph month={month} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Users size={20} strokeWidth={1.5} style={{ color: "#22C55E" }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111" }}>Team Skills Constellation</h2>
      </div>
      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
        Each node represents a graduate. Size reflects average skill proficiency. The ring shows skill breakdown. Click any graduate to explore their individual constellation.
      </p>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-3" style={{ fontSize: 11, color: "#6B7280" }}>
        <div className="flex items-center gap-1.5">
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
          Developed
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />
          Developing
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#D1D5DB", display: "inline-block" }} />
          Not Started
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#9CA3AF" }}>Click a graduate to drill in</div>
      </div>

      <div style={{ position: "relative", height: 520, borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", background: "#fff", overflow: "hidden" }}>
        <svg ref={svgRef} style={{ width: "100%", height: "100%", display: "block" }} />

        {tooltip && (
          <div
            style={{
              position: "absolute",
              left: tooltip.x + 14,
              top: tooltip.y - 80,
              background: "#111",
              borderRadius: 8,
              padding: "12px 16px",
              pointerEvents: "none",
              zIndex: 20,
              minWidth: 200,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{tooltip.node.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{tooltip.node.role} · Week {tooltip.node.week}</div>
            <div className="flex items-center justify-between" style={{ marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Avg Proficiency</span>
              <span className="font-mono-data" style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{tooltip.node.summary.avgProf.toFixed(1)}/10</span>
            </div>
            <div className="flex items-center justify-between" style={{ marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Developed</span>
              <span style={{ fontSize: 12, color: "#22C55E" }}>{tooltip.node.summary.developed}</span>
            </div>
            <div className="flex items-center justify-between" style={{ marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Developing</span>
              <span style={{ fontSize: 12, color: "#F59E0B" }}>{tooltip.node.summary.developing}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Not Started</span>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>{tooltip.node.summary.notStarted}</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>Click to explore skills</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSkillsConstellation;
