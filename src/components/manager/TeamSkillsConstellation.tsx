import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { teamGraduates, statusColors } from "@/data/teamData";
import { getSnapshot, type SkillNode } from "@/data/skillsData";
import { ArrowLeft, Users } from "lucide-react";
import SkillsGraph from "@/components/skills/SkillsGraph";

const gradSkillMonths: Record<string, number> = {
  g1: 3, g2: 3, g3: 2, g4: 3, g5: 2, g6: 3,
};

/* Proficiency jitter per grad so shared skills differ slightly */
const profJitter: Record<string, number> = {
  g1: 0, g2: 0.8, g3: -0.5, g4: 0.3, g5: -0.3, g6: 0.5,
};

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: "employee" | "skill";
  radius: number;
  /* employee fields */
  initials?: string;
  status?: string;
  role?: string;
  week?: number;
  gradId?: string;
  /* skill fields */
  proficiency?: number;
  cluster?: string;
  sharedBy?: string[]; // grad ids that share this skill
  skillStatus?: "developed" | "developing" | "seed";
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: GraphNode | string;
  target: GraphNode | string;
}

const clusterColors: Record<string, string> = {
  core: "#6366F1",
  audit: "#3B82F6",
  client: "#EC4899",
  tax: "#F59E0B",
  compliance: "#8B5CF6",
};

const TeamSkillsConstellation: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedGrad, setSelectedGrad] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null);
  const [hoveredEmployee, setHoveredEmployee] = useState<string | null>(null);

  useEffect(() => {
    if (selectedGrad) return;
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const width = rect.width || 900;
    const height = rect.height || 600;

    // Build unified graph: employees + skills
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const skillMap = new Map<string, GraphNode>(); // skillId -> node
    const skillOwners = new Map<string, string[]>(); // skillId -> gradIds

    // First pass: collect which grads have which skills
    teamGraduates.forEach((g) => {
      const month = gradSkillMonths[g.id] || 3;
      const snap = getSnapshot(month);
      snap.nodes.forEach((sk) => {
        const jitteredProf = Math.max(0, Math.min(10, sk.proficiency + (profJitter[g.id] || 0)));
        if (jitteredProf > 0) {
          if (!skillOwners.has(sk.id)) skillOwners.set(sk.id, []);
          skillOwners.get(sk.id)!.push(g.id);
        }
      });
    });

    // Employee nodes
    teamGraduates.forEach((g) => {
      nodes.push({
        id: `emp-${g.id}`,
        label: g.name,
        type: "employee",
        radius: 32,
        initials: g.initials,
        status: g.status,
        role: g.role,
        week: g.week,
        gradId: g.id,
      });
    });

    // Skill nodes + links
    teamGraduates.forEach((g) => {
      const month = gradSkillMonths[g.id] || 3;
      const snap = getSnapshot(month);
      snap.nodes.forEach((sk) => {
        const jitteredProf = Math.max(0, Math.min(10, sk.proficiency + (profJitter[g.id] || 0)));
        if (jitteredProf <= 0) return;

        if (!skillMap.has(sk.id)) {
          const owners = skillOwners.get(sk.id) || [];
          const isShared = owners.length > 1;
          const avgProf = jitteredProf;
          const status: "developed" | "developing" | "seed" = avgProf > 6 ? "developed" : avgProf > 0 ? "developing" : "seed";
          const baseRadius = isShared ? 7 + owners.length * 1.5 : 5 + (avgProf / 10) * 4;

          const skillNode: GraphNode = {
            id: `skill-${sk.id}`,
            label: sk.label,
            type: "skill",
            radius: baseRadius,
            proficiency: avgProf,
            cluster: sk.cluster,
            sharedBy: owners,
            skillStatus: status,
          };
          skillMap.set(sk.id, skillNode);
          nodes.push(skillNode);
        }

        // Link employee to skill
        links.push({
          source: `emp-${g.id}`,
          target: `skill-${sk.id}`,
        });
      });
    });

    const sel = d3.select(svg);
    sel.selectAll("*").remove();

    const defs = sel.append("defs");
    // Employee gradients
    teamGraduates.forEach((g) => {
      const colors = statusColors[g.status];
      const grad = defs.append("radialGradient").attr("id", `tsc-emp-${g.id}`);
      grad.append("stop").attr("offset", "0%").attr("stop-color", colors.line).attr("stop-opacity", 1);
      grad.append("stop").attr("offset", "100%").attr("stop-color", colors.line).attr("stop-opacity", 0.7);
    });

    const g = sel.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => g.attr("transform", event.transform));
    sel.call(zoom);
    sel.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(0.9));

    // Links
    const linkSel = g.append("g")
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(links)
      .join("line")
      .attr("stroke", "#E5E5E5")
      .attr("stroke-width", 0.6)
      .attr("stroke-opacity", 0.35);

    // Nodes
    const nodeSel = g.append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes, (d) => d.id)
      .join("g")
      .attr("cursor", (d) => d.type === "employee" ? "pointer" : "default");

    nodeSel.each(function (d) {
      const el = d3.select(this);

      if (d.type === "employee") {
        // Outer glow
        el.append("circle")
          .attr("r", d.radius + 4)
          .attr("fill", "none")
          .attr("stroke", statusColors[d.status!]?.line || "#666")
          .attr("stroke-width", 1.5)
          .attr("stroke-opacity", 0.2)
          .attr("class", "emp-glow");

        el.append("circle")
          .attr("r", d.radius)
          .attr("fill", `url(#tsc-emp-${d.gradId})`)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2.5)
          .attr("class", "main-circle");

        el.append("text")
          .text(d.initials!)
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("font-size", 14)
          .attr("font-weight", 600)
          .attr("fill", "#fff")
          .attr("pointer-events", "none");

        el.append("text")
          .text(d.label.split(" ")[0])
          .attr("text-anchor", "middle")
          .attr("dy", d.radius + 18)
          .attr("font-size", 11)
          .attr("font-weight", 500)
          .attr("fill", "#374151")
          .attr("pointer-events", "none")
          .attr("class", "emp-label");
      } else {
        // Skill node
        const color = clusterColors[d.cluster!] || "#6B7280";
        const isShared = (d.sharedBy?.length || 0) > 1;

        el.append("circle")
          .attr("r", d.radius)
          .attr("fill", color)
          .attr("fill-opacity", isShared ? 0.6 : 0.3)
          .attr("stroke", isShared ? color : "none")
          .attr("stroke-width", isShared ? 1 : 0)
          .attr("stroke-opacity", 0.5)
          .attr("class", "main-circle");

        // Show label for shared skills
        if (isShared) {
          el.append("text")
            .text(d.label)
            .attr("text-anchor", "middle")
            .attr("dy", d.radius + 12)
            .attr("font-size", 9)
            .attr("fill", "#6B7280")
            .attr("pointer-events", "none")
            .attr("class", "skill-label")
            .attr("opacity", 0.7);
        }
      }
    });

    // Hover handlers
    nodeSel
      .on("mouseenter", function (event, d) {
        if (d.type === "employee") {
          // Highlight this employee's skill network
          const empId = d.id;
          const connectedSkills = new Set<string>();
          links.forEach((l) => {
            const sId = typeof l.source === "string" ? l.source : l.source.id;
            const tId = typeof l.target === "string" ? l.target : l.target.id;
            if (sId === empId) connectedSkills.add(tId);
            if (tId === empId) connectedSkills.add(sId);
          });

          linkSel
            .attr("stroke-opacity", (l) => {
              const sId = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
              const tId = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
              return sId === empId || tId === empId ? 0.6 : 0.05;
            })
            .attr("stroke-width", (l) => {
              const sId = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
              const tId = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
              return sId === empId || tId === empId ? 1.2 : 0.4;
            })
            .attr("stroke", (l) => {
              const sId = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
              const tId = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
              return sId === empId || tId === empId ? (statusColors[d.status!]?.line || "#666") : "#E5E5E5";
            });

          nodeSel.selectAll<SVGCircleElement, GraphNode>(".main-circle")
            .attr("fill-opacity", (nd) => {
              if (nd.id === empId) return undefined as any; // keep gradient
              if (nd.type === "employee") return undefined as any;
              return connectedSkills.has(nd.id) ? 0.8 : 0.08;
            });

          nodeSel.selectAll<SVGTextElement, GraphNode>(".skill-label")
            .attr("opacity", (nd) => connectedSkills.has(nd.id) ? 1 : 0.1);

          d3.select(this).select(".main-circle").transition().duration(150).attr("r", d.radius * 1.12);
          d3.select(this).select(".emp-glow").transition().duration(150).attr("r", (d.radius * 1.12) + 4).attr("stroke-opacity", 0.4);
        }

        // Tooltip
        const svgRect = svg.getBoundingClientRect();
        setTooltip({ x: event.clientX - svgRect.left, y: event.clientY - svgRect.top - 10, node: d });
      })
      .on("mousemove", (event) => {
        const svgRect = svg.getBoundingClientRect();
        setTooltip((prev) => prev ? { ...prev, x: event.clientX - svgRect.left, y: event.clientY - svgRect.top - 10 } : null);
      })
      .on("mouseleave", function (_event, d) {
        linkSel.attr("stroke", "#E5E5E5").attr("stroke-width", 0.6).attr("stroke-opacity", 0.35);
        nodeSel.selectAll<SVGCircleElement, GraphNode>(".main-circle")
          .attr("fill-opacity", (nd) => {
            if (nd.type === "employee") return undefined as any;
            return (nd.sharedBy?.length || 0) > 1 ? 0.6 : 0.3;
          });
        nodeSel.selectAll<SVGTextElement, GraphNode>(".skill-label").attr("opacity", 0.7);
        if (d.type === "employee") {
          d3.select(this).select(".main-circle").transition().duration(150).attr("r", d.radius);
          d3.select(this).select(".emp-glow").transition().duration(150).attr("r", d.radius + 4).attr("stroke-opacity", 0.2);
        }
        setTooltip(null);
      })
      .on("click", (_event, d) => {
        if (d.type === "employee" && d.gradId) {
          setTooltip(null);
          setSelectedGrad(d.gradId);
        }
      });

    // Simulation
    const sim = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance((l) => {
        const s = typeof l.source === "string" ? nodes.find((n) => n.id === l.source)! : l.source as GraphNode;
        const t = typeof l.target === "string" ? nodes.find((n) => n.id === l.target)! : l.target as GraphNode;
        // Shared skills pull closer
        if (t.type === "skill" && (t.sharedBy?.length || 0) > 1) return 60;
        return 90;
      }).strength((l) => {
        const t = typeof l.target === "string" ? nodes.find((n) => n.id === l.target)! : l.target as GraphNode;
        return (t.type === "skill" && (t.sharedBy?.length || 0) > 1) ? 0.4 : 0.15;
      }))
      .force("charge", d3.forceManyBody<GraphNode>().strength((d) => d.type === "employee" ? -400 : -30))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<GraphNode>().radius((d) => d.radius + (d.type === "employee" ? 12 : 4)))
      .alpha(0.9)
      .alphaDecay(0.015)
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
      d3.drag<SVGGElement, GraphNode>()
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

  // Drill-down view
  const selectedGradData = selectedGrad ? teamGraduates.find((g) => g.id === selectedGrad) : null;
  if (selectedGrad && selectedGradData) {
    const month = gradSkillMonths[selectedGrad] || 3;
    return (
      <div>
        <button
          onClick={() => setSelectedGrad(null)}
          className="flex items-center gap-2 mb-4"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6B7280", padding: "4px 0" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#111"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#6B7280"; }}
        >
          <ArrowLeft size={16} /> Back to Team Constellation
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: statusColors[selectedGradData.status].line, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 600 }}>
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

  // Tooltip renderer
  const renderTooltip = () => {
    if (!tooltip) return null;
    const d = tooltip.node;
    if (d.type === "employee") {
      return (
        <div style={{ position: "absolute", left: tooltip.x + 14, top: tooltip.y - 60, background: "#111", borderRadius: 8, padding: "12px 16px", pointerEvents: "none", zIndex: 20, minWidth: 180 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{d.label}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{d.role} · Week {d.week}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Click to explore their skills</div>
        </div>
      );
    }
    // Skill node
    const shared = d.sharedBy || [];
    const gradNames = shared.map((gid) => teamGraduates.find((tg) => tg.id === gid)?.name.split(" ")[0] || gid);
    return (
      <div style={{ position: "absolute", left: tooltip.x + 14, top: tooltip.y - 60, background: "#111", borderRadius: 8, padding: "12px 16px", pointerEvents: "none", zIndex: 20, minWidth: 180 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{d.label}</div>
        <div className="flex items-center gap-1.5" style={{ marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: clusterColors[d.cluster!] || "#6B7280", display: "inline-block" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "capitalize" }}>{d.cluster}</span>
        </div>
        {shared.length > 1 && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
            Shared by: {gradNames.join(", ")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Users size={20} strokeWidth={1.5} style={{ color: "#22C55E" }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111" }}>Team Skills Constellation</h2>
      </div>
      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
        Employees are central nodes surrounded by their skills. Shared skills naturally cluster between graduates — revealing team strengths and gaps at a glance. Click any employee to drill into their constellation.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-3" style={{ fontSize: 11, color: "#6B7280" }}>
        {Object.entries(clusterColors).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
            <span style={{ textTransform: "capitalize" }}>{key}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#9CA3AF" }}>
          Larger skill nodes = shared by more graduates
        </div>
      </div>

      <div style={{ position: "relative", height: 560, borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", background: "#fff", overflow: "hidden" }}>
        <svg ref={svgRef} style={{ width: "100%", height: "100%", display: "block" }} />
        {renderTooltip()}
      </div>
    </div>
  );
};

export default TeamSkillsConstellation;
